// inventory.js - Gerenciamento Dinâmico do Arquivo (Deck e Bag)

document.addEventListener('DOMContentLoaded', () => {
const modal = document.getElementById('inventory-modal');
const btnOpen = document.getElementById('btn-inventory');
const btnClose = document.getElementById('close-inventory');

// Controle de Abertura/Fechamento Global
btnOpen.addEventListener('click', () => {
renderInventory();
modal.classList.remove('hidden');
});

btnClose.addEventListener('click', () => {
modal.classList.add('hidden');
});

// Fechar ao clicar fora do modal
modal.addEventListener('click', (e) => {
if (e.target === modal) {
modal.classList.add('hidden');
}
});
});

// Renderiza visualmente as cartas e implantes
function renderInventory() {
const deckGrid = document.getElementById('deck-grid');
const implantsGrid = document.getElementById('implants-grid');

deckGrid.innerHTML = '';
implantsGrid.innerHTML = '';

// Renderizar Tomos (Cartas)
GameState.deck.forEach(card => {
const cardEl = document.createElement('div');
cardEl.className = 'card-item';
cardEl.innerHTML = &lt;div class="card-title"&gt;${card.name}</div>
<div class="card-desc">Rolagem: ${card.dice}&lt;br&gt;Mult Base: x${card.baseMult}</div>
<div class="card-desc" style="color: var(--corrupt-green);">${card.description}&lt;/div&gt;;

// Duplo clique prepara a inspeção para aplicação de upgrades dinâmicos
cardEl.addEventListener('dblclick', () => inspectCard(card));

deckGrid.appendChild(cardEl);
});

// Renderizar Implantes (Coringas)
GameState.bag.forEach(implant => {
const impEl = document.createElement('div');
impEl.className = 'card-item ps1-jitter'; // Implantes sofrem o efeito de tremor
impEl.style.borderColor = 'var(--flesh-red)';
impEl.innerHTML = &lt;div class="card-title" style="color: var(--flesh-red);"&gt;${implant.name}</div>
<div class="card-desc">${implant.description}&lt;/div&gt;;
implantsGrid.appendChild(impEl);
});
}

// Inspecionar ou Modificar Carta
function inspectCard(card) {
console.log(Auditoria de anomalia: ${card.name} [ID Instância: ${card.instanceId}]);
// O gancho para aplicar mods comprados na loja será inserido aqui
}

// Utilitário de Sacrifício e Deleção
function removeCardFromDeck(instanceId) {
GameState.deck = GameState.deck.filter(c => c.instanceId !== instanceId);
updateHUD();

if (!document.getElementById('inventory-modal').classList.contains('hidden')) {
renderInventory();
}
}

