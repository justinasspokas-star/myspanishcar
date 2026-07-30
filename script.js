const form = document.querySelector('#comparison-form');
const pickup = document.querySelector('#pickup-location');
const pickupDate = document.querySelector('#pickup-date');
const returnDate = document.querySelector('#return-date');
const cardFilter = document.querySelector('#card-filter');
const errorBox = document.querySelector('#form-error');
const resultsSummary = document.querySelector('#results-summary');
const resultsList = document.querySelector('#results-list');
const sortSelect = document.querySelector('#sort-results');
const toast = document.querySelector('#toast');

const toISO = (date) => date.toISOString().slice(0, 10);
const today = new Date();
const start = new Date(today); start.setDate(today.getDate() + 14);
const end = new Date(today); end.setDate(today.getDate() + 21);
pickupDate.min = toISO(today);
returnDate.min = toISO(today);
pickupDate.value = toISO(start);
returnDate.value = toISO(end);

function getDays() {
  const a = new Date(`${pickupDate.value}T12:00:00`);
  const b = new Date(`${returnDate.value}T12:00:00`);
  return Math.max(1, Math.round((b - a) / 86400000));
}

function updatePrices(days) {
  document.querySelectorAll('.result-card').forEach(card => {
    const daily = Number(card.dataset.daily);
    card.querySelector('.total-price').textContent = `€${daily * days}`;
    card.querySelector('.daily-price').textContent = `€${daily}`;
  });
}

function filterCards() {
  const preference = cardFilter.value;
  document.querySelectorAll('.result-card').forEach(card => {
    const matches = preference === 'all' || preference === 'credit' || card.dataset.card === 'debit';
    card.hidden = !matches;
  });
}

function sortCards() {
  const cards = [...resultsList.querySelectorAll('.result-card')];
  const key = sortSelect.value;
  cards.sort((a, b) => {
    if (key === 'price') return Number(a.dataset.daily) - Number(b.dataset.daily);
    if (key === 'deposit') return Number(a.dataset.deposit) - Number(b.dataset.deposit);
    return Number(b.dataset.score) - Number(a.dataset.score);
  });
  cards.forEach(card => resultsList.append(card));
}

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
  const days = getDays();
  if (new Date(returnDate.value) <= new Date(pickupDate.value)) {
    errorBox.textContent = 'The return date must be after the pickup date.';
    returnDate.focus();
    return;
  }
  updatePrices(days);
  filterCards();
  sortCards();
  resultsSummary.textContent = `${pickup.value} · ${days} day${days === 1 ? '' : 's'} · example prices updated for this prototype.`;
  document.querySelector('#results').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

cardFilter.addEventListener('change', filterCards);
sortSelect.addEventListener('change', sortCards);
returnDate.addEventListener('change', () => { returnDate.min = pickupDate.value || toISO(today); });
pickupDate.addEventListener('change', () => {
  returnDate.min = pickupDate.value || toISO(today);
  if (returnDate.value && returnDate.value <= pickupDate.value) {
    const next = new Date(`${pickupDate.value}T12:00:00`); next.setDate(next.getDate() + 7);
    returnDate.value = toISO(next);
  }
});

document.querySelectorAll('.partner-button').forEach(button => {
  button.addEventListener('click', () => {
    toast.textContent = `${button.dataset.car}: add your approved affiliate deep link here.`;
    toast.classList.add('show');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
  });
});

document.querySelectorAll('.airport-grid a').forEach(link => {
  link.addEventListener('click', () => {
    const airport = link.querySelector('strong').textContent;
    const option = [...pickup.options].find(o => o.textContent.includes(airport.replace(' Airport','')));
    if (option) pickup.value = option.value;
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();
updatePrices(getDays());
