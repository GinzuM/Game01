// shop.js - Lógica do Mercador e Upgrades Dinâmicos

const ShopState = {
currentItems: [],
rerollCost: 5
};

// Inicializa a loja ao entrar no nó do mapa
function initShop() {
console.log("Acessando interface do Mercador.");

// Configura botões da loja
const btnReroll = document.getElementById('btn-reroll');
const btnLeave = document.getElementById('btn-leave-shop');

// Evita múltiplos binds caso o jogador visite a loja várias vezes
btnReroll.replaceWith(btnReroll.cloneNode(true));
btnLeave.replaceWith(btnLeave.cloneNode(true));

document.getElementById('btn-reroll').addEventListener('click', rerollShop);
document.getElementById('btn-leave-shop').addEventListener('click', leaveShop);

generateShopItems();
}

// Gera o inventário do mercador baseado no pool do data.json
function generateShopItems() {
const shopContainer = document.getElementById('shop-items');
shopContainer.innerHTML = '';
ShopState.currentItems = [];

// O mercador exibe 3 itens aleatórios (podem ser Tomos ou Implantes)
for (let i = 0; i < 3; i++) {
const isImplant = Math.random() > 0.5;
let pool = isImplant ? GameState.db.implants : GameState.db.tomes;

// Sorteia um item que não seja secreto (isso pode ser parametrizado depois)
let item = pool[Math.floor(Math.random() * pool.length)];

// Custo dinâmico: Implantes são mais caros que Tomos
let cost = isImplant ? Math.floor(Math.random() * 20) + 30 : Math.floor(Math.random() * 15) + 15;

// Clona o objeto para não sujar o banco de dados original
let shopItem = { ...item, cost: cost, isImplant: isImplant, instanceId: shop_${Date.now()}_${i} };
ShopState.currentItems.push(shopItem);
}

renderShopItems();
}

function renderShopItems() {
const shopContainer = document.getElementById('shop-items');
shopContainer.innerHTML = '';

ShopState.currentItems.forEach(item => {
const itemEl = document.createElement('div');
itemEl.className = 'card-item';
// Bordas diferentes para diferenciar implantes de tomos
itemEl.style.borderColor = item.isImplant ? 'var(--flesh-red)' : 'var(--metal-gray)';

itemEl.innerHTML = &lt;div class="card-title" style="color: ${item.isImplant ? 'var(--flesh-red)' : 'var(--corrupt-green)'}">
${item.name} &lt;/div&gt; &lt;div class="card-desc"&gt;${item.description}</div>
<div class="card-desc" style="margin-top: 10px; font-weight: bold; color: var(--highlight);">
Preço: ${item.cost} &lt;/div&gt;;

itemEl.addEventListener('click', () => buyItem(item, itemEl));
shopContainer.appendChild(itemEl);
});
}

function buyItem(item, elementNode) {
if (GameState.currency >= item.cost) {
GameState.currency -= item.cost;
updateHUD();

// Remove da vitrine da loja
elementNode.remove();
ShopState.currentItems = ShopState.currentItems.filter(i => i.instanceId !== item.instanceId);

if (item.isImplant) {
GameState.bag.push(item);
console.log(Implante adquirido: ${item.name}); } else { // Se for um Tomo de Upgrade (ex: consumível), vai para a zona ativa // Caso contrário, vai para o Deck. Aqui simplificamos indo para o Deck. GameState.deck.push(item); console.log(Tomo adquirido: ${item.name});
}

// Se o inventário estiver aberto no fundo, força atualização
if (!document.getElementById('inventory-modal').classList.contains('hidden')) {
renderInventory();
}
} else {
alert("Moeda insuficiente. O mercador recusa a transação.");
}
}

function rerollShop() {
if (GameState.currency >= ShopState.rerollCost) {
GameState.currency -= ShopState.rerollCost;
// Escalonamento do custo de reroll (anti-abuso)
ShopState.rerollCost += 5;
document.getElementById('btn-reroll').innerText = Atualizar Vitrine (Custo: ${ShopState.rerollCost});

updateHUD();
generateShopItems();
} else {
alert("Recursos insuficientes para atualizar o catálogo.");
}
}

function leaveShop() {
// Reseta custo do reroll para a próxima visita
ShopState.rerollCost = 5;
document.getElementById('btn-reroll').innerText = Atualizar Vitrine (Custo: 5);
switchScreen('map-screen');
}






