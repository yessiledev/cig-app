// Afficher la date du jour
const todaySpan = document.getElementById('todayDate');
const today = new Date();
const todayKey = today.toISOString().slice(0, 10); // YYYY-MM-DD
todaySpan.textContent = todayKey;

// Charger / initialiser le compteur du jour
let cigsFumees = 0;
const saved = localStorage.getItem('cigs_' + todayKey);
if (saved) {
  cigsFumees = parseInt(saved);
}

const cigsSpan = document.getElementById('cigsFumees');
cigsSpan.textContent = cigsFumees;

// Boutons + et -
const plusBtn = document.getElementById('plus');
const minusBtn = document.getElementById('minus');

function save() {
  localStorage.setItem('cigs_' + todayKey, cigsFumees);
  cigsSpan.textContent = cigsFumees;
}

plusBtn.addEventListener('click', () => {
  cigsFumees += 1;
  save();
  majEconomies();
  majEconomiesGlobales();
});


minusBtn.addEventListener('click', () => {
  cigsFumees = Math.max(0, cigsFumees - 1);
  save();
  majEconomies();
  majEconomiesGlobales();
});


// --- Gestion de la date de début ---
const dateInput = document.getElementById('dateDebut');
const saveDateBtn = document.getElementById('saveDate');
const objectifSpan = document.getElementById('objectifJour');

// Charger la date de début si elle existe
let dateDebut = localStorage.getItem('dateDebut');
if (dateDebut) {
  dateInput.value = dateDebut;
}

// Fonction pour calculer l'objectif du jour
function calculObjectif() {
  if (!dateDebut) return 20; // par défaut

  const start = new Date(dateDebut);
  const today = new Date();
  const diffJours = Math.floor((today - start) / (1000 * 60 * 60 * 24));

  const totalJours = 20 * 30; // approx 20 mois
  const reductionParJour = 20 / totalJours;

  let objectif = Math.max(0, 20 - diffJours * reductionParJour);
  return Math.round(objectif);
}

// Afficher l'objectif
function majObjectif() {
  const obj = calculObjectif();
  objectifSpan.textContent = obj;
}
// --- Calcul cigarettes non fumées + économies du jour ---
const nonFumeesSpan = document.getElementById('nonFumees');
const economiesJourSpan = document.getElementById('economiesJour');

// Prix d'un paquet (modifiable plus tard)
const PRIX_PAQUET = 12;
const CIGS_PAR_PAQUET = 20;

function majEconomies() {
  const objectif = calculObjectif();
  const fumees = cigsFumees;

  const nonFumees = Math.max(0, objectif - fumees);
  nonFumeesSpan.textContent = nonFumees;

  const prixParCig = PRIX_PAQUET / CIGS_PAR_PAQUET;
  const economies = nonFumees * prixParCig;

  economiesJourSpan.textContent = economies.toFixed(2);
}
// --- Calcul économies mensuelles + totales ---
const economiesMoisSpan = document.getElementById('economiesMois');
const economiesTotalesSpan = document.getElementById('economiesTotales');

function majEconomiesGlobales() {
  const prixParCig = PRIX_PAQUET / CIGS_PAR_PAQUET;

  let total = 0;
  let mois = 0;

  const today = new Date();
  const moisActuel = today.toISOString().slice(0, 7); // YYYY-MM

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key.startsWith('cigs_')) {
      const dateStr = key.replace('cigs_', '');
      const fumees = parseInt(localStorage.getItem(key));

      const dateObj = new Date(dateStr);
      const objectif = calculObjectif(dateObj);

      const nonFumees = Math.max(0, objectif - fumees);
      const economies = nonFumees * prixParCig;

      total += economies;

      if (dateStr.startsWith(moisActuel)) {
        mois += economies;
      }
    }
  }

  economiesTotalesSpan.textContent = total.toFixed(2);
  economiesMoisSpan.textContent = mois.toFixed(2);
}

// Sauvegarde de la date de début
saveDateBtn.addEventListener('click', () => {
  dateDebut = dateInput.value;
  localStorage.setItem('dateDebut', dateDebut);
  majObjectif();
});

// Mise à jour initiale
majObjectif();
majEconomies();
majEconomiesGlobales();

// --- PWA : enregistrement du service worker ---
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}


