// -------------------------
// 📅 Afficher la date du jour
// -------------------------
const todaySpan = document.getElementById('todayDate');
const today = new Date();
const todayKey = today.toISOString().slice(0, 10); // YYYY-MM-DD
todaySpan.textContent = todayKey;

// -------------------------
// 🚬 Charger / initialiser le compteur du jour
// -------------------------
let cigsFumees = 0;
const saved = localStorage.getItem('cigs_' + todayKey);
if (saved) {
  cigsFumees = parseInt(saved);
}

const cigsSpan = document.getElementById('cigsFumees');
cigsSpan.textContent = cigsFumees;

function save() {
  localStorage.setItem('cigs_' + todayKey, cigsFumees);
  cigsSpan.textContent = cigsFumees;
}

// -------------------------
// ➕➖ Boutons
// -------------------------
const plusBtn = document.getElementById('plus');
const minusBtn = document.getElementById('minus');

plusBtn.addEventListener('click', () => {
  cigsFumees += 1;
  save();
  majEconomies();
  enregistrerEconomiesDuJour(todayKey, cigsFumees, calculObjectif());
});

minusBtn.addEventListener('click', () => {
  cigsFumees = Math.max(0, cigsFumees - 1);
  save();
  majEconomies();
  enregistrerEconomiesDuJour(todayKey, cigsFumees, calculObjectif());
});

// -------------------------
// 🎯 Gestion de la date de début
// -------------------------
const dateInput = document.getElementById('dateDebut');
const saveDateBtn = document.getElementById('saveDate');
const objectifSpan = document.getElementById('objectifJour');

let dateDebut = localStorage.getItem('dateDebut');
if (dateDebut) {
  dateInput.value = dateDebut;
}

saveDateBtn.addEventListener('click', () => {
  dateDebut = dateInput.value;
  localStorage.setItem('dateDebut', dateDebut);
  majObjectif();
});

// Calcul de l’objectif du jour
function calculObjectif() {
  if (!dateDebut) return 20;

  const start = new Date(dateDebut);
  const today = new Date();
  const diffJours = Math.floor((today - start) / (1000 * 60 * 60 * 24));

  const totalJours = 20 * 30; // approx 20 mois
  const reductionParJour = 20 / totalJours;

  let objectif = Math.max(0, 20 - diffJours * reductionParJour);
  return Math.round(objectif);
}

function majObjectif() {
  objectifSpan.textContent = calculObjectif();
}

// -------------------------
// 💶 Prix du paquet modifiable
// -------------------------
function chargerPrixPaquet() {
  const prixPaquet = localStorage.getItem("prixPaquet");
  if (prixPaquet) {
    document.getElementById("prixPaquet").value = prixPaquet;
  }
}

function calculerPrixCigarette(prixPaquet) {
  return prixPaquet / 20;
}

document.getElementById("prixPaquet").addEventListener("input", function () {
  const prixPaquet = parseFloat(this.value);

  if (!isNaN(prixPaquet) && prixPaquet > 0) {
    localStorage.setItem("prixPaquet", prixPaquet);
    localStorage.setItem("prixCigarette", calculerPrixCigarette(prixPaquet));
  }
});

// Valeur par défaut si vide
if (!localStorage.getItem("prixPaquet")) {
  localStorage.setItem("prixPaquet", 13);
  localStorage.setItem("prixCigarette", 0.65);
}

chargerPrixPaquet();

// -------------------------
// 💰 Économies du jour
// -------------------------
const nonFumeesSpan = document.getElementById('nonFumees');
const economiesJourSpan = document.getElementById('economiesJour');

function majEconomies() {
  const objectif = calculObjectif();
  const fumees = cigsFumees;

  const nonFumees = Math.max(0, objectif - fumees);
  nonFumeesSpan.textContent = nonFumees;

  const prixCig = parseFloat(localStorage.getItem("prixCigarette")) || 0.65;
  const economies = nonFumees * prixCig;

  economiesJourSpan.textContent = economies.toFixed(2);
}

// -------------------------
// 📊 Économies mensuelles + cumulées
// -------------------------
const economiesMoisSpan = document.getElementById('economiesMois');
const economiesTotalesSpan = document.getElementById('economiesTotales');

// Enregistrer les économies du jour dans l’historique
function enregistrerEconomiesDuJour(date, cigarettesFumees, quotaJour) {
  const prixCigarette = parseFloat(localStorage.getItem("prixCigarette")) || 0.65;

  const economiesJour = Math.max(0, (quotaJour - cigarettesFumees) * prixCigarette);

  let historique = JSON.parse(localStorage.getItem("historique")) || {};

  historique[date] = {
    cigarettesFumees,
    quotaJour,
    economiesJour
  };

  localStorage.setItem("historique", JSON.stringify(historique));

  mettreAJourEconomiesCumulees(historique);
  majEconomiesMois(historique);

  return economiesJour;
}

// Total cumulé
function mettreAJourEconomiesCumulees(historique) {
  let total = 0;

  for (const jour in historique) {
    total += historique[jour].economiesJour;
  }

  localStorage.setItem("economiesCumulees", total.toFixed(2));
  economiesTotalesSpan.textContent = total.toFixed(2);
}

// Économies du mois
function majEconomiesMois(historique) {
  const moisActuel = today.toISOString().slice(0, 7);
  let totalMois = 0;

  for (const jour in historique) {
    if (jour.startsWith(moisActuel)) {
      totalMois += historique[jour].economiesJour;
    }
  }

  economiesMoisSpan.textContent = totalMois.toFixed(2);
}

// -------------------------
// 🚀 Initialisation
// -------------------------
majObjectif();
majEconomies();

const historiqueInit = JSON.parse(localStorage.getItem("historique")) || {};
mettreAJourEconomiesCumulees(historiqueInit);
majEconomiesMois(historiqueInit);

// -------------------------
// 🛠️ PWA
// -------------------------
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
