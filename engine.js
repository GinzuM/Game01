// engine.js - Gerenciamento de Estado Global e Motor Principal

const GameState = {
hp: 100,
maxHp: 100,
currency: 0,
deck: [],
bag: [],
maxDraw: 5,
db: null,
currentNode: null
};

// Novo objeto para as configurações persistentes
const SettingsState = {
volume: 100,
guiScale: 1.0,
sens: 1.0,
ctrlScale: 1.0,
mobileMode: false
};

async function initGame() {
await loadData();
buildInitialDeck();
updateHUD();
console.log("Sistema Inicializado. Protocolo 'Carne e Metal' Ativo.");
}

async function loadData() {
try {
const response = await fetch('data.json');
GameState.db = await response.json();
} catch (error) {
console.warn("Lendo via tag de script local.");
const dataElement = document.getElementById('game-data');
if (dataElement) {
GameState.db = JSON.parse(dataElement.textContent);
}
}
}

function buildInitialDeck() {
if (!GameState.db) return;
const tomeD4 = GameState.db.tomes.find(t => t.id === 'tome_001');
const tomeD8 = GameState.db.tomes.find(t => t.id === 'tome_003');
for (let i = 0; i < 4; i++) {
GameState.deck.push({ ...tomeD4, instanceId: card_${Date.now()}_${i} });
}
GameState.deck.push({ ...tomeD8, instanceId: card_${Date.now()}_5 });
}

function switchScreen(screenId) {
document.querySelectorAll('.screen').forEach(screen => {
screen.classList.add('hidden');
screen.classList.remove('active');
});

const targetScreen = document.getElementById(screenId);
if (targetScreen) {
targetScreen.classList.remove('hidden');
targetScreen.classList.add('active');
}

if(screenId === 'map-screen' && typeof renderMap === 'function') {
renderMap();
}
}

function updateHUD() {
const hpDisplay = document.getElementById('hp-display');
const currencyDisplay = document.getElementById('currency-display');

if (hpDisplay) hpDisplay.innerText = GameState.hp;
if (currencyDisplay) currencyDisplay.innerText = GameState.currency;

if (GameState.hp <= 30 && hpDisplay) {
hpDisplay.style.color = '#ff3333';
hpDisplay.classList.add('ps1-jitter');
} else if (hpDisplay) {
hpDisplay.style.color = 'var(--corrupt-green)';
hpDisplay.classList.remove('ps1-jitter');
}

const deckCount = document.getElementById('deck-count');
if(deckCount) deckCount.innerText = GameState.deck.length;
}

function takeDamage(amount) {
GameState.hp -= amount;
if (GameState.hp < 0) GameState.hp = 0;
updateHUD();
if (GameState.hp === 0) triggerGameOver();
}

function triggerGameOver() {
alert("INTEGRIDADE ZERO. SISTEMA CORROMPIDO.");
location.reload();
}

window.addEventListener('DOMContentLoaded', initGame);

