// combat.js - Engine de Combate Híbrida (Atualizado para Mobile & Sensibilidade)

const CombatState = {
boss: null,
drawPile: [],
hand: [],
discardPile: [],
selectedCards: [],
mouseX: 300,
mouseY: 150,
projectiles: [],
isEvading: false,
evasionFrames: 0,
maxEvasionFrames: 300,
ritual: { baseMult: 1.0, currentMult: 1.0, diceTotal: 0 },
loopId: null,
inputVector: { x: 0, y: 0 } // Vetor para os controles mobile
};

const canvas = document.getElementById('arena');
const ctx = canvas.getContext('2d');

// --- SISTEMA DE MOVIMENTAÇÃO (MOUSE E MOBILE) ---

// Movimento via Mouse (Usa movementX/Y para permitir aplicação de sensibilidade)
canvas.addEventListener('mousemove', (e) => {
if (!CombatState.isEvading) return;

// Calcula o deslocamento e aplica a configuração de sensibilidade
CombatState.mouseX += e.movementX * SettingsState.sens;
CombatState.mouseY += e.movementY * SettingsState.sens;

clampCursorToArena();
});

// Movimento via D-Pad Mobile
function bindMobileControls() {
const bindBtn = (id, vecX, vecY) => {
const btn = document.getElementById(id);
// Usa touchstart/end para dispositivos móveis, mousedown/up como fallback
btn.addEventListener('touchstart', (e) => { e.preventDefault(); CombatState.inputVector.x = vecX; CombatState.inputVector.y = vecY; });
btn.addEventListener('touchend', (e) => { e.preventDefault(); CombatState.inputVector.x = 0; CombatState.inputVector.y = 0; });
btn.addEventListener('mousedown', () => { CombatState.inputVector.x = vecX; CombatState.inputVector.y = vecY; });
btn.addEventListener('mouseup', () => { CombatState.inputVector.x = 0; CombatState.inputVector.y = 0; });
};

bindBtn('btn-up', 0, -1);
bindBtn('btn-down', 0, 1);
bindBtn('btn-left', -1, 0);
bindBtn('btn-right', 1, 0);
}
// Executa no carregamento do script
document.addEventListener('DOMContentLoaded', bindMobileControls);

function clampCursorToArena() {
if (CombatState.mouseX < 0) CombatState.mouseX = 0;
if (CombatState.mouseX > canvas.width) CombatState.mouseX = canvas.width;
if (CombatState.mouseY < 0) CombatState.mouseY = 0;
if (CombatState.mouseY > canvas.height) CombatState.mouseY = canvas.height;
}

// --- LÓGICA DO COMBATE ---

function initCombat(isBossPhase) {
console.log("Inicializando Protocolo de Contenção.");

const bossPool = GameState.db.bosses;
CombatState.boss = isBossPhase ? bossPool[0] : { name: "Anomalia Algorítmica", hp: 120, bulletDensity: "low", bulletSpeed: "slow" };
document.getElementById('boss-name').innerText = ${CombatState.boss.name} [HP: ${CombatState.boss.hp}];

CombatState.drawPile = [...GameState.deck].sort(() => Math.random() - 0.5);
CombatState.discardPile = [];
CombatState.hand = [];
CombatState.isEvading = false;

// Centraliza o jogador no início
CombatState.mouseX = canvas.width / 2;
CombatState.mouseY = canvas.height / 2;

updateRitualUI(1.0, 0);
drawCards(GameState.maxDraw);

document.getElementById('btn-play-ritual').onclick = startRitual;
document.getElementById('btn-discard').onclick = discardSelected;

if (CombatState.loopId) cancelAnimationFrame(CombatState.loopId);
combatLoop();
}

function drawCards(amount) {
for (let i = 0; i < amount; i++) {
if (CombatState.drawPile.length === 0) {
CombatState.drawPile = [...CombatState.discardPile].sort(() => Math.random() - 0.5);
CombatState.discardPile = [];
if (CombatState.drawPile.length === 0) break;
}
CombatState.hand.push(CombatState.drawPile.pop());
}
renderCombatHand();
}

function renderCombatHand() {
const handContainer = document.getElementById('hand');
handContainer.innerHTML = '';
CombatState.selectedCards = [];
document.getElementById('draw-count').innerText = CombatState.drawPile.length;

CombatState.hand.forEach(card => {
const cardEl = document.createElement('div');
cardEl.className = 'card-item';
cardEl.innerHTML = <div class="card-title"&gt;${card.name}</div><div class="card-desc">Roll: ${card.dice}&lt;br&gt;Mult: x${card.baseMult}</div>`;

cardEl.addEventListener('click', () => {
if (CombatState.isEvading) return;

cardEl.classList.toggle('selected');
if (cardEl.classList.contains('selected')) {
cardEl.style.borderColor = 'var(--corrupt-green)';
cardEl.style.transform = 'translateY(-10px)';
CombatState.selectedCards.push(card);
} else {
cardEl.style.borderColor = 'var(--metal-gray)';
cardEl.style.transform = 'none';
CombatState.selectedCards = CombatState.selectedCards.filter(c => c.instanceId !== card.instanceId);
}
previewRitual();
});
handContainer.appendChild(cardEl);
});
}

function previewRitual() {
let mult = 1.0;
CombatState.selectedCards.forEach(c => mult += c.baseMult);
updateRitualUI(mult, "?");
}

function updateRitualUI(mult, diceTxt) {
document.getElementById('multiplier').innerText = mult.toFixed(1);
document.getElementById('dice-result').innerText = diceTxt;
}

function rollDiceString(diceStr) {
if (!diceStr || diceStr === 'none') return 0;
const parts = diceStr.toLowerCase().split('d');
const qtd = parts[0] ? parseInt(parts[0]) : 1;
const faces = parseInt(parts[1]);
let total = 0;
for (let i = 0; i < qtd; i++) {
total += Math.floor(Math.random() * faces) + 1;
}
return total;
}

function discardSelected() {
if (CombatState.isEvading || CombatState.selectedCards.length === 0) return;
CombatState.selectedCards.forEach(card => {
CombatState.hand = CombatState.hand.filter(c => c.instanceId !== card.instanceId);
CombatState.discardPile.push(card);
});
drawCards(CombatState.selectedCards.length);
}

function startRitual() {
if (CombatState.isEvading || CombatState.selectedCards.length === 0) return;

CombatState.ritual.baseMult = 1.0;
CombatState.ritual.diceTotal = 0;

CombatState.selectedCards.forEach(card => {
CombatState.ritual.baseMult += card.baseMult;
CombatState.ritual.diceTotal += rollDiceString(card.dice);
});

CombatState.ritual.currentMult = CombatState.ritual.baseMult;
updateRitualUI(CombatState.ritual.currentMult, CombatState.ritual.diceTotal);

console.log("Fase de contenção ativa.");
CombatState.isEvading = true;
CombatState.evasionFrames = 0;
CombatState.projectiles = [];

document.getElementById('btn-play-ritual').disabled = true;
document.getElementById('btn-discard').disabled = true;
}

function combatLoop() {
ctx.clearRect(0, 0, canvas.width, canvas.height);

if (CombatState.isEvading) {
CombatState.evasionFrames++;

// Processa o vetor do D-Pad Mobile
if (SettingsState.mobileMode && (CombatState.inputVector.x !== 0 || CombatState.inputVector.y !== 0)) {
// Velocidade base (5) multiplicada pela sensibilidade
CombatState.mouseX += CombatState.inputVector.x * (5 * SettingsState.sens);
CombatState.mouseY += CombatState.inputVector.y * (5 * SettingsState.sens);
clampCursorToArena();
}

const spawnRate = CombatState.boss.bulletDensity === 'high' ? 10 : 25;
if (CombatState.evasionFrames % spawnRate === 0) {
CombatState.projectiles.push({
x: Math.random() < 0.5 ? 0 : canvas.width,
y: Math.random() * canvas.height,
size: Math.random() * 6 + 4,
speedX: (Math.random() * 5 + 2) * (Math.random() < 0.5 ? 1 : -1),
speedY: (Math.random() - 0.5) * 4,
color: Math.random() < 0.2 ? 'var(--corrupt-green)' : '#ffffff'
});
}

ctx.fillStyle = 'var(--flesh-red)';
ctx.beginPath();
ctx.arc(CombatState.mouseX, CombatState.mouseY, 6, 0, Math.PI * 2);
ctx.fill();

for (let i = CombatState.projectiles.length - 1; i >= 0; i--) {
let p = CombatState.projectiles[i];
p.x += p.speedX;
p.y += p.speedY;

ctx.fillStyle = p.color;
ctx.beginPath();
ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
ctx.fill();

const dist = Math.hypot(CombatState.mouseX - p.x, CombatState.mouseY - p.y);
if (dist < p.size + 6) {
CombatState.ritual.currentMult = Math.max(1.0, CombatState.ritual.currentMult - 0.5);
updateRitualUI(CombatState.ritual.currentMult, CombatState.ritual.diceTotal);

takeDamage(2);
CombatState.projectiles.splice(i, 1);

canvas.style.borderColor = 'var(--highlight)';
setTimeout(() => canvas.style.borderColor = 'var(--ui-border)', 150);
}
}

if (CombatState.evasionFrames >= CombatState.maxEvasionFrames) {
resolveRitualDamage();
}
} else {
ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
ctx.font = "14px Courier New";
ctx.fillText("Aguardando Compilação do Ritual...", 150, 150);
}

CombatState.loopId = requestAnimationFrame(combatLoop);
}

function resolveRitualDamage() {
CombatState.isEvading = false;
document.getElementById('btn-play-ritual').disabled = false;
document.getElementById('btn-discard').disabled = false;

const finalDamage = Math.floor(CombatState.ritual.diceTotal * CombatState.ritual.currentMult);
CombatState.boss.hp -= finalDamage;
document.getElementById('boss-name').innerText = ``${CombatState.boss.name} [HP: ${CombatState.boss.hp}]`;

CombatState.selectedCards.forEach(card => {
CombatState.hand = CombatState.hand.filter(c => c.instanceId !== card.instanceId);
CombatState.discardPile.push(card);
});

if (CombatState.boss.hp <= 0) {
alert("Anomalia neutralizada. A extração foi concluída.");
GameState.currency += 30;
updateHUD();
switchScreen('map-screen');
} else {
drawCards(GameState.maxDraw - CombatState.hand.length);
renderCombatHand();
updateRitualUI(1.0, 0);
}
}

