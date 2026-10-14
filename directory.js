// Public searches use POST so healthcare search text is not part of request URLs.
// Results stay in memory briefly; no private account or patient fields are requested.
let activeRequest;
let offset = 0;
let lastQuery = '';
let lastCity = '';
let initialized = false;
const cache = new Map();

export function cancelDirectory() {
  activeRequest?.abort();
}

export async function showDirectory(query = '', keepPage = false, refresh = false) {
  if (!initialized) {
    initialized = true;
    document.getElementById('directory-filters').addEventListener('submit', event => {
      event.preventDefault(); showDirectory(lastQuery);
    });
    document.getElementById('retry-directory').addEventListener('click', () => showDirectory(lastQuery, true, true));
    document.getElementById('directory-previous').addEventListener('click', () => { offset = Math.max(0, offset - 12); showDirectory(lastQuery, true); });
    document.getElementById('directory-next').addEventListener('click', () => { offset += 12; showDirectory(lastQuery, true); });
  }
  const city = document.getElementById('directory-city').value.trim();
  if (!keepPage || query !== lastQuery || city !== lastCity) offset = 0;
  lastQuery = query; lastCity = city;
  activeRequest?.abort();
  const task = new AbortController();
  activeRequest = task;
  const status = document.getElementById('directory-status');
  const results = document.getElementById('directory-results');
  const empty = document.getElementById('directory-empty');
  const error = document.getElementById('directory-error');
  const skeleton = document.getElementById('directory-skeleton');
  const retry = document.getElementById('retry-directory');
  const previous = document.getElementById('directory-previous');
  const next = document.getElementById('directory-next');
  results.replaceChildren(); empty.hidden = true; error.textContent = '';
  retry.hidden = true; previous.disabled = true; next.disabled = true;
  status.textContent = 'Searching verified facilities…'; skeleton.hidden = false;
  try {
    const key = JSON.stringify([query, city, offset]);
    const cached = cache.get(key);
    let data = !refresh && cached?.expires > Date.now() ? cached.data : null;
    if (!data) {
      const endpoint = import.meta.env.VITE_SUPABASE_URL;
      const publicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      if (!endpoint || !publicKey) throw new Error('unconfigured');
      const response = await fetch(endpoint + '/rest/v1/rpc/search_facilities', {
        method: 'POST', headers: { apikey: publicKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_query: query, p_city: city, p_offset: offset }),
        signal: AbortSignal.any([task.signal, AbortSignal.timeout(15_000)]),
        credentials: 'omit', referrerPolicy: 'no-referrer',
      });
      if (!response.ok) throw new Error('unavailable');
      data = await response.json();
      if (!Array.isArray(data.items) || !Number.isInteger(data.total) || data.total < 0 || !Array.isArray(data.matched_services)) throw new Error('invalid-response');
      if (task.signal.aborted) return;
      if (cache.size >= 20) cache.delete(cache.keys().next().value);
      cache.set(key, { data, expires: Date.now() + 30_000 });
    }
    if (task.signal.aborted) return;
    status.textContent = data.total ? `Showing ${offset + 1}–${offset + data.items.length} of ${data.total} verified facilities.` : 'No verified facilities match this search.';
    if (data.matched_services.length) status.textContent += ' Matched service: ' + data.matched_services.join(', ') + '.';
    document.getElementById('directory-description').textContent = query || city
      ? 'No verified facility matches your search and location. Try a service name, facility name or another city.'
      : 'No verified facilities have been published yet.';
    empty.hidden = data.items.length > 0;
    for (const facility of data.items) results.append(facilityCard(facility));
    previous.disabled = offset === 0;
    next.disabled = offset + data.items.length >= data.total;
  } catch {
    if (task.signal.aborted) return;
    status.textContent = '';
    error.textContent = 'The facility directory could not load. Check your connection and try again.';
    retry.hidden = false;
  } finally {
    if (!task.signal.aborted) skeleton.hidden = true;
  }
}

function facilityCard(facility) {
  const card = document.createElement('article'); card.className = 'panel facility-card';
  const heading = document.createElement('h2'); heading.textContent = facility.name;
  const address = document.createElement('p'); address.textContent = facility.address + ', ' + facility.city;
  const services = document.createElement('p'); services.textContent = facility.services.length
    ? 'Verified services: ' + facility.services.join(', ') : 'No verified services listed.';
  const details = document.createElement('details');
  const summary = document.createElement('summary'); summary.textContent = 'Contact and operating hours';
  const phone = document.createElement('p'); phone.textContent = facility.phone ? 'Phone: ' + facility.phone : 'No verified phone number listed.';
  const hours = document.createElement('p'); hours.textContent = facility.operating_hours ? 'Hours: ' + facility.operating_hours : 'Operating hours are not listed.';
  details.append(summary, phone, hours);
  const booking = document.createElement('p'); booking.className = 'muted';
  booking.textContent = 'Online booking is not available yet. Contact the facility to ask about scheduling.';
  card.append(heading, address, services, details, booking);
  return card;
}
