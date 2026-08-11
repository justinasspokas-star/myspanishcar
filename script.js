const form = document.querySelector('#comparison-form');
const pickup = document.querySelector('#pickup-location');
const pickupDate = document.querySelector('#pickup-date');
const returnDate = document.querySelector('#return-date');
const cardFilter = document.querySelector('#card-filter');
const errorBox = document.querySelector('#form-error');
const resultsSummary = document.querySelector('#results-summary');
const partnerSearchLocation = document.querySelector('#partner-search-location');
const partnerSearchDates = document.querySelector('#partner-search-dates');

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
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
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
      errorBox.textContent = 'Choose a pickup location to continue.';
      pickup.focus();
      return;
    }
    if (!pickupDate.value || !returnDate.value) {
      errorBox.textContent = 'Choose both pickup and return dates.';
      return;
    }
    if (new Date(returnDate.value) <= new Date(pickupDate.value)) {
      errorBox.textContent = 'The return date must be after the pickup date.';
      returnDate.focus();
      return;
    }

    const days = getDays();
    const preference = cardFilter?.options[cardFilter.selectedIndex]?.text || 'Any card';
    if (partnerSearchLocation) partnerSearchLocation.textContent = pickup.value;
    if (partnerSearchDates) partnerSearchDates.textContent = `${formatDate(pickupDate.value)} – ${formatDate(returnDate.value)} · ${days} day${days === 1 ? '' : 's'}`;
    if (resultsSummary) resultsSummary.textContent = `${pickup.value} · ${days} day${days === 1 ? '' : 's'} · ${preference}. Check final availability and rental conditions on each partner site.`;

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
// Only fires when Google Analytics has been enabled through the site's consent flow.
document.querySelectorAll('a[data-affiliate-partner]').forEach(link => {
  link.addEventListener('click', () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'affiliate_click', {
        affiliate_partner: link.dataset.affiliatePartner || 'unknown',
        affiliate_network: link.dataset.affiliateNetwork || 'unknown',
        affiliate_market: link.dataset.affiliateMarket || 'unknown',
        affiliate_placement: link.dataset.affiliatePlacement || 'unknown',
        search_location: pickup?.value || '',
        link_url: link.href
      });
    }
  });
});
