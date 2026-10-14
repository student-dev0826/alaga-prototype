import { showIcons } from './icons.js';

// A few shared variables are enough for the current application.
// Search text is kept in memory, never in the address or browser storage.
let searchQuery = '';
let currentPage = 'home';
let selectedCategory = '';
let authModule;
let firstPage = true;

showIcons();
setupPreferences();
setupSearch();
setupGuide();

window.addEventListener('hashchange', showPage);
document.addEventListener('resident-state-changed', () => {
  authModule?.showResidentPage(currentPage);
});

document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  document.getElementById('main-content').focus();
});

// Hidden HTML sections act as pages. Hash links support Back/Forward and reloads.
function showPage() {
  let route = location.hash.slice(1) || location.pathname.slice(1) || 'home';
  if (route === 'main-content') route = currentPage;
  if (route === 'search') route = 'health-centers';
  if (route.startsWith('health-centers/')) route = 'facility';
  if (route.startsWith('appointments/')) route = 'appointments';
  if (route.startsWith('health-guide/')) route = 'health-article';
  const page = Array.from(document.querySelectorAll('[data-page]')).find(section => section.dataset.page === route);
  currentPage = page ? route : 'not-found';

  document.querySelectorAll('[data-page]').forEach(section => {
    section.hidden = section.dataset.page !== currentPage;
  });
  document.querySelectorAll('.nav-link, .bottom-link').forEach(link => {
    const active = link.getAttribute('href') === '#' + currentPage;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  const heading = document.querySelector('[data-page="' + currentPage + '"] h1');
  document.title = (currentPage === 'health-centers' && searchQuery ? 'Search Results' : heading.textContent) + ' — ALAGA';
  document.querySelector('.app-shell').scrollTo({ top: 0 });
  window.scrollTo({ top: 0 });
  if (!firstPage) heading.focus({ preventScroll: true });
  firstPage = false;

  const residentPage = ['profile', 'appointments', 'notifications'].includes(currentPage);
  if (residentPage || currentPage.startsWith('auth/')) {
    loadAuthentication().then(module => module.showResidentPage(currentPage)).catch(() => {
      document.querySelectorAll('[data-resident-gate]').forEach(gate => {
        gate.textContent = 'Account services could not load. Reload the page to try again.';
        gate.setAttribute('role', 'alert');
      });
      document.querySelectorAll('[data-auth-form]').forEach(form => { form.hidden = true; });
      document.querySelectorAll('[data-auth-unavailable]').forEach(message => { message.hidden = false; });
      document.getElementById('callback-status').textContent = 'Account services could not load. Reload the page to try again.';
    });
  }
}

async function loadAuthentication() {
  if (!authModule) {
    authModule = await import('./auth.js');
  }
  await authModule.startAuthentication();
  return authModule;
}

function search(query) {
  searchQuery = query.trim();
  if (!searchQuery) return;
  document.getElementById('directory-query').value = searchQuery;
  document.getElementById('directory-title').textContent = 'Results for “' + searchQuery + '”';
  document.getElementById('directory-description').textContent = 'Your search has been received. Facility data is not yet connected, so ALAGA cannot verify matches.';
  document.getElementById('clear-search').hidden = false;
  document.getElementById('search-suggestions').hidden = true;
  location.hash = 'search';
  showPage();
}

function setupSearch() {
  document.querySelectorAll('[data-search-form]').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      search(form.elements.query.value);
    });
  });
  document.querySelectorAll('[data-query]').forEach(button => {
    button.addEventListener('click', () => search(button.dataset.query));
  });
  document.getElementById('clear-search').addEventListener('click', () => {
    searchQuery = '';
    document.getElementById('directory-query').value = '';
    document.getElementById('directory-title').textContent = 'Find a Health Center';
    document.getElementById('directory-description').textContent = 'ALAGA is preparing its verified facility directory.';
    document.getElementById('clear-search').hidden = true;
    location.hash = 'home';
  });

  let suggestionTimer;
  const input = document.getElementById('home-query');
  const suggestions = document.getElementById('search-suggestions');
  input.addEventListener('input', () => {
    clearTimeout(suggestionTimer);
    suggestionTimer = setTimeout(() => {
      const query = input.value.trim().toLowerCase();
      const matches = Array.from(document.querySelectorAll('[data-query]')).filter(button => query && button.textContent.toLowerCase().includes(query)).slice(0, 4);
      suggestions.replaceChildren();
      matches.forEach(match => {
        const button = document.createElement('button');
        button.className = 'suggestion';
        button.textContent = match.textContent;
        button.addEventListener('click', () => search(match.textContent));
        suggestions.append(button);
      });
      suggestions.hidden = matches.length === 0;
    }, 250);
  });
  input.addEventListener('keydown', event => { if (event.key === 'Escape') suggestions.hidden = true; });

  document.getElementById('toggle-map').addEventListener('click', event => {
    const panel = document.getElementById('location-panel');
    panel.hidden = !panel.hidden;
    document.getElementById('directory-layout').classList.toggle('directory-grid', !panel.hidden);
    event.currentTarget.textContent = panel.hidden ? 'Show location panel' : 'Hide location panel';
    event.currentTarget.setAttribute('aria-expanded', String(!panel.hidden));
  });
  document.querySelectorAll('[name="appointment-status"]').forEach(input => {
    input.addEventListener('change', () => {
      document.querySelectorAll('[name="appointment-status"]').forEach(radio => radio.parentElement.classList.toggle('selected', radio.checked));
    });
  });
}

function setupGuide() {
  const cards = Array.from(document.querySelectorAll('[data-category]'));
  function selectCategory(id) {
    selectedCategory = id === selectedCategory ? '' : id;
    cards.forEach(card => {
      const selected = card.dataset.category === selectedCategory;
      card.classList.toggle('chosen', selected);
      card.setAttribute('aria-pressed', String(selected));
    });
    const selected = cards.find(card => card.dataset.category === selectedCategory);
    document.getElementById('guide-article-title').textContent = selected ? selected.querySelector('strong').textContent + ': no published articles yet' : 'No published articles yet';
  }
  cards.forEach(card => card.addEventListener('click', () => selectCategory(card.dataset.category)));
  document.querySelectorAll('[data-guide-category]').forEach(link => link.addEventListener('click', () => selectCategory(link.dataset.guideCategory)));
  document.getElementById('guide-query').addEventListener('input', event => {
    const query = event.target.value.trim().toLowerCase();
    cards.forEach(card => { card.hidden = !card.querySelector('strong').textContent.toLowerCase().includes(query); });
    document.getElementById('guide-search-status').textContent = cards.every(card => card.hidden) ? 'No categories match this search. Try a different word.' : '';
  });
}

function setupPreferences() {
  const defaults = { textSize: 'standard', highContrast: false, reduceMotion: false };
  let preferences = { ...defaults };
  try {
    const saved = JSON.parse(localStorage.getItem('alaga-accessibility-v1'));
    if (saved) preferences = { textSize: ['standard', 'large', 'extra-large'].includes(saved.textSize) ? saved.textSize : 'standard', highContrast: saved.highContrast === true, reduceMotion: saved.reduceMotion === true };
  } catch { /* Keep usable defaults if storage is blocked or malformed. */ }

  function apply() {
    document.documentElement.dataset.textSize = preferences.textSize;
    document.documentElement.dataset.contrast = String(preferences.highContrast);
    document.documentElement.dataset.reduceMotion = String(preferences.reduceMotion);
    document.getElementById('text-size').value = preferences.textSize;
    document.getElementById('high-contrast').checked = preferences.highContrast;
    document.getElementById('reduce-motion').checked = preferences.reduceMotion;
    document.getElementById('preferences-status').textContent = 'Current preferences: ' + preferences.textSize + ' text, high contrast ' + (preferences.highContrast ? 'on' : 'off') + ', reduced motion ' + (preferences.reduceMotion ? 'on' : 'off') + '.';
    try { localStorage.setItem('alaga-accessibility-v1', JSON.stringify(preferences)); } catch { /* Settings still work for this page. */ }
  }
  document.getElementById('text-size').addEventListener('change', event => { preferences.textSize = event.target.value; apply(); });
  document.getElementById('high-contrast').addEventListener('change', event => { preferences.highContrast = event.target.checked; apply(); });
  document.getElementById('reduce-motion').addEventListener('change', event => { preferences.reduceMotion = event.target.checked; apply(); });
  document.getElementById('reset-preferences').addEventListener('click', () => { preferences = { ...defaults }; apply(); });
  apply();
}

showPage();
