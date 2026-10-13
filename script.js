const form = document.querySelector('#comparison-form');
const pickup = document.querySelector('#pickup-location');
const pickupDate = document.querySelector('#pickup-date');
const returnDate = document.querySelector('#return-date');
const cardFilter = document.querySelector('#card-filter');
const errorBox = document.querySelector('#form-error');
const resultsSummary = document.querySelector('#results-summary');
const partnerSearchLocation = document.querySelector('#partner-search-location');
const partnerSearchDates = document.querySelector('#partner-search-dates');

const isNl = document.documentElement.lang.toLowerCase().startsWith('nl');
const t = (en, nl) => isNl ? nl : en;
const toISO = (date) => date.toISOString().slice(0, 10);
const today = new Date();
const start = new Date(today); start.setDate(today.getDate() + 14);
const end = new Date(today); end.setDate(today.getDate() + 21);

if (pickupDate && returnDate) {
  pickupDate.min = toISO(today);
  returnDate.min = toISO(today);
  pickupDate.value = toISO(start);
  returnDate.value = toISO(end);
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat(isNl ? 'nl-NL' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function getDays() {
  const a = new Date(`${pickupDate.value}T12:00:00`);
  const b = new Date(`${returnDate.value}T12:00:00`);
  return Math.max(1, Math.round((b - a) / 86400000));
}

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    errorBox.textContent = '';

    if (!pickup.value) {
      errorBox.textContent = t('Choose a pickup location to continue.','Kies een ophaallocatie om door te gaan.');
      pickup.focus();
      return;
    }
    if (!pickupDate.value || !returnDate.value) {
      errorBox.textContent = t('Choose both pickup and return dates.','Kies zowel een ophaal- als retourdatum.');
      return;
    }
    if (new Date(returnDate.value) <= new Date(pickupDate.value)) {
      errorBox.textContent = t('The return date must be after the pickup date.','De retourdatum moet na de ophaaldatum liggen.');
      returnDate.focus();
      return;
    }

    const days = getDays();
    const preference = cardFilter?.options[cardFilter.selectedIndex]?.text || 'Any card';
    if (partnerSearchLocation) partnerSearchLocation.textContent = pickup.value;
    if (partnerSearchDates) partnerSearchDates.textContent = `${formatDate(pickupDate.value)} – ${formatDate(returnDate.value)} · ${days} ${isNl ? (days === 1 ? 'dag' : 'dagen') : `day${days === 1 ? '' : 's'}`}`;
    if (resultsSummary) resultsSummary.textContent = isNl ? `${pickup.value} · ${days} ${days === 1 ? 'dag' : 'dagen'} · ${preference}. Controleer definitieve beschikbaarheid en huurvoorwaarden op de partnersite.` : `${pickup.value} · ${days} day${days === 1 ? '' : 's'} · ${preference}. Check final availability and rental conditions on each partner site.`;

    document.querySelector('#results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

if (returnDate) {
  returnDate.addEventListener('change', () => {
    returnDate.min = pickupDate.value || toISO(today);
  });
}

if (pickupDate) {
  pickupDate.addEventListener('change', () => {
    returnDate.min = pickupDate.value || toISO(today);
    if (returnDate.value && returnDate.value <= pickupDate.value) {
      const next = new Date(`${pickupDate.value}T12:00:00`);
      next.setDate(next.getDate() + 7);
      returnDate.value = toISO(next);
    }
  });
}

document.querySelectorAll('.airport-grid a').forEach(link => {
  link.addEventListener('click', () => {
    if (!pickup) return;
    const airport = link.querySelector('strong')?.textContent || '';
    const option = [...pickup.options].find(o => o.textContent.includes(airport.replace(' Airport','')));
    if (option) pickup.value = option.value;
  });
});

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

// Mobile navigation
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');

function setMobileMenu(open) {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  mobileMenu.setAttribute('aria-hidden', String(!open));
  mobileMenu.classList.toggle('is-open', open);
}

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    setMobileMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMobileMenu(false));
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      setMobileMenu(false);
      menuToggle.focus();
    }
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) setMobileMenu(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1020) setMobileMenu(false);
  });
}

// Affiliate click tracking
// Fires only when Google Analytics has been enabled through the site's consent flow.
document.querySelectorAll('a[data-affiliate-partner]').forEach(link => {
  link.addEventListener('click', () => {
    if (typeof window.gtag === 'function') {
      const provider = link.dataset.affiliatePartner || 'unknown';
      window.gtag('event', 'affiliate_click', {
        affiliate_provider: provider,
        affiliate_partner: provider,
        affiliate_network: link.dataset.affiliateNetwork || 'unknown',
        affiliate_market: link.dataset.affiliateMarket || 'unknown',
        affiliate_placement: link.dataset.affiliatePlacement || 'unknown',
        placement: link.dataset.affiliatePlacement || 'unknown',
        airport: link.dataset.affiliateAirport || pickup?.value || '',
        search_location: pickup?.value || '',
        page_location: window.location.href,
        page_path: window.location.pathname,
        destination_url: link.href,
        link_url: link.href
      });
    }
  });
});
