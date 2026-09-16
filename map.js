// map.js - Geração Procedural e Roteamento do Grid

const MapConfig = {
layers: 6, // Quantidade de andares antes do Chefe
nodesPerLayer: 3
};

// Tipos de salas possíveis
const NodeTypes = [
{ type: 'combat', label: '[ COMBATE ]', color: 'var(--highlight)' },
{ type: 'shop', label: '[ MERCADOR ]', color: 'var(--text-light)' },
{ type: 'event', label: '[ ANOMALIA ]', color: 'var(--corrupt-green)' },
{ type: 'terminal', label: '[ TERMINAL ]', color: 'var(--metal-gray)' }
];

function renderMap() {
const mapGrid = document.getElementById('map-grid');
if (!mapGrid) return;

// Evita recriar o mapa se ele já estiver renderizado para a run atual
if (mapGrid.children.length > 0) return;

mapGrid.innerHTML = '';
mapGrid.style.display = 'flex';
mapGrid.style.flexDirection = 'column-reverse'; // Renderiza de baixo (início) para cima (boss)
mapGrid.style.gap = '40px';
mapGrid.style.alignItems = 'center';
mapGrid.style.marginTop = '40px';
mapGrid.style.paddingBottom = '40px';

for (let i = 0; i < MapConfig.layers; i++) {
const layerDiv = document.createElement('div');
layerDiv.style.display = 'flex';
layerDiv.style.gap = '50px';

// O topo é estritamente reservado para o Boss
if (i === MapConfig.layers - 1) {
const bossNode = createNode('boss', '[ CHEFE DO SETOR ]', '#ff0000');
bossNode.classList.add('ps1-jitter'); // Tremor acentuado no boss
layerDiv.appendChild(bossNode);
} else {
// Gera a quantidade de caminhos por camada (entre 2 e 3)
const nodeCount = Math.floor(Math.random() * 2) + 2;
for (let j = 0; j < nodeCount; j++) {
// Sorteio enviesado (mais combates do que terminais/shoppings)
const isCombat = Math.random() > 0.4;
let nodeData;

if (isCombat) {
nodeData = NodeTypes[0];
} else {
// Escolhe entre loja, evento ou fogueira
nodeData = NodeTypes[Math.floor(Math.random() * (NodeTypes.length - 1)) + 1];
}

const node = createNode(nodeData.type, nodeData.label, nodeData.color);
layerDiv.appendChild(node);
}
}
mapGrid.appendChild(layerDiv);
}
}

function createNode(type, label, color) {
const btn = document.createElement('button');
btn.innerText = label;
btn.className = 'map-node';
btn.style.border = 2px solid ${color}`;
btn.style.color = color;
btn.style.backgroundColor = '#000';
btn.style.minWidth = '140px';
btn.style.padding = '15px';
btn.style.fontSize = '14px';

// Efeito hover via JS para manter o controle absoluto das rotas
btn.addEventListener('mouseover', () => {
btn.style.backgroundColor = color;
btn.style.color = '#000';
});
btn.addEventListener('mouseout', () => {
btn.style.backgroundColor = '#000';
btn.style.color = color;
});

btn.addEventListener('click', () => handleNodeClick(type));

return btn;
}

function handleNodeClick(type) {
console.log(Conexão estabelecida com o nó:${type}`);
GameState.currentNode = type;

switch(type) {
case 'combat':
case 'boss':
if (typeof initCombat === 'function') initCombat(type === 'boss');
switchScreen('combat-screen');
break;
case 'shop':
if (typeof initShop === 'function') initShop();
switchScreen('shop-screen');
break;
case 'event':
if (typeof triggerEvent === 'function') triggerEvent();
switchScreen('event-screen');
break;
case 'terminal':
// Terminal de Contenção (A Fogueira)
const choice = confirm("Terminal de Contenção. Pressione OK para restaurar 25% de Integridade, ou CANCELAR para corromper e aprimorar um tomo.");
if (choice) {
GameState.hp = Math.min(GameState.maxHp, GameState.hp + 25);
updateHUD();
alert("Integridade restaurada. Retornando ao grid.");
} else {
alert("Módulo de aprimoramento em manutenção. Restaurando integridade como fallback.");
}
// Em um loop real, desativaríamos o andar atual e liberaríamos o próximo
break;
}
}

