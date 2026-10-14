// Supabase is a backend client, not a UI framework. It loads only on account pages.
let client;
let starting;
let status = 'loading';
let resident = null;
let recoverySession = false;
let residentVersion = 0;
let request;
let notificationsPage = 0;
let profileCache;
const notificationsCache = new Map();
// Keep only whether the provider reported a failure, never its tokens or message.
const callbackFailed = [new URLSearchParams(location.search), new URLSearchParams(location.hash.slice(1))]
  .some(parameters => parameters.has('error') || parameters.has('error_code'));

export function startAuthentication() {
  starting ??= initialize();
  return starting;
}

async function initialize() {
  setupForms();
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) { status = 'unconfigured'; updateAuthentication(); return; }

  const timeout = setTimeout(() => {
    status = 'error';
    updateAuthentication();
  }, 12_000);
  try {
    const { createClient } = await import('@supabase/supabase-js');
    client = createClient(url, key, {
      auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      global: { fetch: (input, options) => fetch(input, { ...options, signal: options?.signal ? AbortSignal.any([options.signal, AbortSignal.timeout(15_000)]) : AbortSignal.timeout(15_000) }) },
    });
    let authEventReceived = false;
    client.auth.onAuthStateChange((event, session) => {
      authEventReceived = true;
      clearTimeout(timeout);
      setResident(session?.user || null, event === 'PASSWORD_RECOVERY');
    });
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    clearTimeout(timeout);
    if (!authEventReceived) setResident(data.session?.user || null, false);
  } catch {
    clearTimeout(timeout);
    status = 'error';
    updateAuthentication();
  }
}

function setResident(user, recovering) {
  if (resident?.id !== user?.id) {
    residentVersion += 1;
    recoverySession = false;
    request?.abort();
    profileCache = undefined;
    notificationsCache.clear();
    notificationsPage = 0;
    // Remove private text immediately, before any new request finishes.
    document.getElementById('profile-email').textContent = '';
    document.getElementById('profile-welcome').textContent = 'Welcome, resident';
    document.getElementById('display-name').value = '';
    document.getElementById('notification-list').replaceChildren();
  }
  resident = user;
  status = 'ready';
  recoverySession = user ? recovering || recoverySession : false;
  updateAuthentication();
  document.dispatchEvent(new Event('resident-state-changed'));
}

function updateAuthentication() {
  document.querySelectorAll('[data-resident-gate]').forEach(gate => {
    gate.removeAttribute('role');
    gate.hidden = !!resident && status === 'ready';
    gate.replaceChildren();
    const heading = document.createElement('h2');
    const description = document.createElement('p');
    if (status === 'loading') { heading.textContent = 'Checking your sign-in…'; gate.setAttribute('role', 'status'); }
    else if (status === 'error') { heading.textContent = 'We could not check your sign-in'; description.textContent = 'Reload the page to try again.'; gate.setAttribute('role', 'alert'); }
    else if (status !== 'ready') { heading.textContent = 'Resident sign-in is not yet available'; description.textContent = 'Account services are being prepared. Public browsing and accessibility settings remain available.'; }
    else { heading.textContent = 'Sign in to continue'; description.textContent = 'Your personal information is available only to your signed-in account.'; }
    gate.append(heading, description);
    if (status === 'ready' && !resident) {
      const link = document.createElement('a'); link.href = '#auth/login'; link.className = 'button'; link.textContent = 'Sign in'; gate.append(link);
    }
  });
  document.querySelectorAll('[data-resident-content]').forEach(content => { content.hidden = !resident || status !== 'ready'; });
  document.querySelectorAll('[data-auth-unavailable]').forEach(message => { message.hidden = status === 'ready' || status === 'loading'; });
  document.querySelectorAll('[data-auth-signed-in]').forEach(message => { message.hidden = !resident; });
  for (const name of ['login', 'register', 'recover']) {
    const form = document.getElementById(name + '-form');
    form.hidden = status !== 'ready' || (name !== 'recover' && !!resident);
  }
  document.getElementById('password-form').hidden = !recoverySession || !resident;
  document.getElementById('recovery-required').hidden = recoverySession && !!resident;
}

export function showResidentPage(page) {
  updateAuthentication();
  if (page === 'auth/callback') {
    if (status === 'loading') return;
    history.replaceState(null, '', '/#auth/callback');
    if (resident && !callbackFailed && status === 'ready') location.hash = recoverySession ? 'auth/update-password' : 'profile';
    else document.getElementById('callback-status').textContent = 'This link could not be verified. It may have expired or was opened in another browser.';
  }
  if (!resident || status !== 'ready') return;
  if (page === 'profile') loadProfile();
  if (page === 'notifications') loadNotifications();
}

function fieldError(input, message) {
  input.setAttribute('aria-invalid', String(!!message));
  document.getElementById(input.id + '-error').textContent = message;
}

function validateForm(form, newPassword = false) {
  let valid = true;
  if (form.elements.email) {
    const email = form.elements.email;
    email.value = email.value.trim();
    const error = !email.value || !email.validity.valid || email.value.length > 254 ? 'Enter a valid email address.' : '';
    fieldError(email, error); valid &&= !error;
  }
  if (form.elements.password) {
    const password = form.elements.password;
    const error = password.value.length < (newPassword ? 12 : 1) ? (newPassword ? 'Use at least 12 characters.' : 'Enter your password.') : password.value.length > 128 ? 'Use no more than 128 characters.' : '';
    fieldError(password, error); valid &&= !error;
  }
  if (form.elements.confirmPassword) {
    const confirm = form.elements.confirmPassword;
    const error = confirm.value !== form.elements.password.value ? 'Passwords must match.' : '';
    fieldError(confirm, error); valid &&= !error;
  }
  if (!valid) form.querySelector('[aria-invalid="true"]').focus();
  return valid;
}

function safeError(error) {
  if (['invalid_credentials', 'invalid_login_credentials'].includes(error?.code)) return 'Email or password is incorrect. Please check both and try again.';
  if (error?.code === 'email_not_confirmed') return 'Confirm your email address using the link we sent before signing in.';
  if (['over_request_rate_limit', 'over_email_send_rate_limit'].includes(error?.code)) return 'Too many attempts. Please wait a few minutes before trying again.';
  if (error?.code === 'weak_password') return 'Choose a stronger password and try again.';
  return 'The request could not be completed. Check your connection and try again.';
}

function setupForms() {
  for (const name of ['login', 'register', 'recover', 'password']) {
    const form = document.getElementById(name + '-form');
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const errorText = form.querySelector('[data-form-error]');
      const message = form.querySelector('[data-form-message]');
      errorText.textContent = ''; message.textContent = '';
      if (!validateForm(form, name === 'register' || name === 'password')) return;
      if (!client || status !== 'ready') { errorText.textContent = 'Account services are unavailable. Please try again later.'; return; }
      if (name === 'password' && (!resident || !recoverySession)) { errorText.textContent = 'Open your recovery link first.'; return; }
      const button = form.querySelector('button');
      const originalLabel = button.textContent;
      button.disabled = true; button.textContent = 'Please wait…';
      try {
        const email = form.elements.email?.value;
        const password = form.elements.password?.value;
        let result;
        if (name === 'login') result = await client.auth.signInWithPassword({ email, password });
        if (name === 'register') result = await client.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + '/auth/callback' } });
        if (name === 'recover') result = await client.auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/auth/callback' });
        if (name === 'password') result = await client.auth.updateUser({ password });
        if (result.error) throw result.error;
        form.reset();
        if (name === 'recover') message.textContent = 'If this address has an account, a recovery link will arrive by email. Open it in this same browser.';
        else if (name === 'password') { message.textContent = 'Your password has been saved. Use it for your next sign-in.'; }
        else if (result.data.session) location.hash = 'profile';
        else message.textContent = 'Check your email for a confirmation link. If your address is already registered, sign in or use password recovery.';
      } catch (error) { errorText.textContent = safeError(error); }
      finally { button.disabled = false; button.textContent = originalLabel; }
    });
  }
  document.getElementById('profile-form').addEventListener('submit', saveProfile);
  document.getElementById('retry-profile').addEventListener('click', () => loadProfile(true));
  document.getElementById('retry-notifications').addEventListener('click', () => loadNotifications(true));
  document.getElementById('sign-out').addEventListener('click', async event => {
    const button = event.currentTarget; button.disabled = true;
    try { const { error } = await client.auth.signOut({ scope: 'local' }); if (error) throw error; }
    catch { document.getElementById('profile-error').textContent = 'We could not sign you out. Try again.'; }
    finally { button.disabled = false; }
  });
  document.getElementById('previous-notifications').addEventListener('click', () => { notificationsPage = Math.max(0, notificationsPage - 1); loadNotifications(); });
  document.getElementById('next-notifications').addEventListener('click', () => { notificationsPage += 1; loadNotifications(); });
}

function beginPrivateRequest() {
  request?.abort();
  request = new AbortController();
  return { signal: request.signal, version: residentVersion, userId: resident.id };
}

function stillOwned(task) {
  return resident?.id === task.userId && residentVersion === task.version && !task.signal.aborted;
}

async function loadProfile(force = false) {
  const task = beginPrivateRequest();
  const message = document.getElementById('profile-status');
  const errorText = document.getElementById('profile-error');
  message.textContent = 'Loading profile…'; errorText.textContent = '';
  document.getElementById('profile-skeleton').hidden = false;
  document.getElementById('profile-form').hidden = true;
  document.getElementById('retry-profile').hidden = true;
  try {
    let data = profileCache?.expires > Date.now() && !force ? profileCache.data : null;
    if (!data) {
      const result = await client.from('profiles').select('id, display_name').eq('id', task.userId).abortSignal(task.signal).single();
      if (result.error) throw result.error;
      data = result.data;
    }
    if (!stillOwned(task)) return;
    profileCache = { data, expires: Date.now() + 30_000 };
    document.getElementById('profile-welcome').textContent = data.display_name ? 'Welcome, ' + data.display_name : 'Welcome, resident';
    document.getElementById('profile-email').textContent = 'Signed in as ' + (resident.email || 'resident');
    document.getElementById('display-name').value = data.display_name || '';
    document.getElementById('profile-form').hidden = false;
    message.textContent = '';
  } catch {
    if (!stillOwned(task)) return;
    message.textContent = ''; errorText.textContent = 'Your profile could not load. Please try again.';
    document.getElementById('retry-profile').hidden = false;
  } finally { if (stillOwned(task)) document.getElementById('profile-skeleton').hidden = true; }
}

async function saveProfile(event) {
  event.preventDefault();
  if (!resident || status !== 'ready') return;
  const input = document.getElementById('display-name');
  const name = input.value.trim();
  fieldError(input, name.length < 1 || name.length > 100 ? 'Enter a name with 1 to 100 characters.' : '');
  if (input.getAttribute('aria-invalid') === 'true') { input.focus(); return; }
  const task = beginPrivateRequest();
  const button = document.getElementById('save-profile'); button.disabled = true;
  try {
    const { data, error } = await client.from('profiles').update({ display_name: name }).eq('id', task.userId).select('id, display_name').abortSignal(task.signal).single();
    if (error) throw error;
    if (!stillOwned(task)) return;
    profileCache = { data, expires: Date.now() + 30_000 };
    document.getElementById('profile-welcome').textContent = 'Welcome, ' + data.display_name;
    document.getElementById('profile-status').textContent = 'Your profile has been saved.';
    document.getElementById('profile-error').textContent = '';
  } catch { if (stillOwned(task)) document.getElementById('profile-error').textContent = 'Your profile was not saved. Check your connection and try again.'; }
  finally { button.disabled = false; }
}

async function loadNotifications(force = false) {
  const task = beginPrivateRequest();
  const page = notificationsPage;
  const cacheKey = task.userId + ':' + page;
  const message = document.getElementById('notifications-status');
  const errorText = document.getElementById('notifications-error');
  message.textContent = 'Loading notifications…'; errorText.textContent = '';
  document.getElementById('notifications-skeleton').hidden = false;
  document.getElementById('notification-list').replaceChildren();
  document.getElementById('retry-notifications').hidden = true;
  try {
    const cached = notificationsCache.get(cacheKey);
    let data = cached?.expires > Date.now() && !force ? cached.data : null;
    if (!data) {
      const result = await client.from('notifications').select('id, title, message, read_at, created_at').eq('user_id', task.userId).order('created_at', { ascending: false }).order('id').range(page * 20, page * 20 + 19).abortSignal(task.signal);
      if (result.error) throw result.error;
      data = result.data;
    }
    if (!stillOwned(task)) return;
    notificationsCache.set(cacheKey, { data, expires: Date.now() + 30_000 });
    message.textContent = data.length ? '' : 'No notifications to show.';
    const list = document.getElementById('notification-list');
    for (const item of data) {
      const row = document.createElement('li'); row.className = 'panel';
      const title = document.createElement('h2'); title.textContent = item.title;
      const readState = document.createElement('p'); readState.textContent = item.read_at ? 'Read' : 'Unread';
      const text = document.createElement('p'); text.textContent = item.message;
      const date = document.createElement('p'); date.className = 'muted'; date.textContent = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Manila' }).format(new Date(item.created_at));
      row.append(title, readState, text, date);
      if (!item.read_at) {
        const button = document.createElement('button'); button.className = 'button secondary'; button.textContent = 'Mark as read';
        button.addEventListener('click', async () => {
          button.disabled = true;
          try {
            const { error } = await client.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', item.id).eq('user_id', task.userId).select('id').single();
            if (error) throw error;
            if (!stillOwned(task)) return;
            notificationsCache.clear(); loadNotifications(true);
          } catch { if (stillOwned(task)) errorText.textContent = 'The notification could not be updated. Please try again.'; }
          finally { button.disabled = false; }
        });
        row.append(button);
      }
      list.append(row);
    }
    document.getElementById('previous-notifications').disabled = page === 0;
    document.getElementById('next-notifications').disabled = data.length < 20;
  } catch {
    if (!stillOwned(task)) return;
    message.textContent = ''; errorText.textContent = 'Notifications could not load.';
    document.getElementById('retry-notifications').hidden = false;
  } finally { if (stillOwned(task)) document.getElementById('notifications-skeleton').hidden = true; }
}
