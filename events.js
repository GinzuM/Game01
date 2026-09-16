// events.js - Gerenciamento de Anomalias Narrativas e Sacrifícios

let currentEvent = null;

function triggerEvent() {
console.log("Detectando assinatura de anomalia...");

if (!GameState.db || !GameState.db.events || GameState.db.events.length === 0) {
console.error("Nenhum evento encontrado no banco de dados.");
switchScreen('map-screen');
return;
}

// Sorteia um evento aleatório do banco de dados
const randomIndex = Math.floor(Math.random() * GameState.db.events.length);
currentEvent = GameState.db.events[randomIndex];

renderEvent(currentEvent);
}

function renderEvent(eventData) {
document.getElementById('event-title').innerText = eventData.title;
document.getElementById('event-description').innerText = eventData.description;

const choicesContainer = document.getElementById('event-choices');
choicesContainer.innerHTML = '';
choicesContainer.style.display = 'flex';
choicesContainer.style.flexDirection = 'column';
choicesContainer.style.gap = '15px';
choicesContainer.style.marginTop = '30px';

eventData.choices.forEach(choice => {
const btn = document.createElement('button');
btn.innerText = choice.text;

// Estilização condicional baseada no custo
if (choice.cost.includes('lose') || choice.cost.includes('hp')) {
btn.style.borderColor = 'var(--flesh-red)';
btn.style.color = 'var(--highlight)';
} else {
btn.style.borderColor = 'var(--corrupt-green)';
}

btn.addEventListener('click', () => handleEventChoice(choice));
choicesContainer.appendChild(btn);
});
}

function handleEventChoice(choice) {
let canAfford = true;

// 1. Processar o Custo (Cost)
switch (choice.cost) {
case 'lose_1_card':
if (GameState.deck.length >= 1) {
const sacrificed = GameState.deck.pop();
alert(Tomo sacrificado: ${sacrificed.name}`);
} else {
canAfford = false;
alert("Cartas insuficientes para o sacrifício.");
}
break;
case 'lose_3_specific':
// Para o protótipo, removemos as 3 últimas cartas se houver
if (GameState.deck.length >= 3) {
GameState.deck.splice(-3, 3);
alert("3 tomos foram consumidos pela anomalia.");
} else {
canAfford = false;
alert("Você não possui o conhecimento (cartas) necessário para satisfazer a entidade.");
}
break;
case 'hp_15':
takeDamage(15);
alert("Sua carne foi mutilada. -15% Integridade.");
break;
case 'none':
break;
default:
console.warn("Custo desconhecido:", choice.cost);
}

if (!canAfford) return; // Se não puder pagar, aborta a interação

// 2. Processar a Recompensa (Reward)
switch (choice.rewardType) {
case 'currency':
GameState.currency += choice.rewardValue;
alert(Você extraiu${choice.rewardValue} de recursos.); break; case 'implant': if (choice.rewardValue === 'random_joker') { const randomImplant = GameState.db.implants[Math.floor(Math.random() * GameState.db.implants.length)]; GameState.bag.push({ ...randomImplant, instanceId:evt_imp_latex
{Date.now()}` }); alert(`Novo implante parasita enxertado: 

{randomImplant.name}); } break; case 'upgrade': if (choice.rewardValue === 'base_mult_up') { // Aplica um buff permanente no primeiro tomo do deck (se existir) if (GameState.deck.length &gt; 0) { GameState.deck[0].baseMult += 1.0; alert(O tomo ${GameState.deck[0].name} sofreu mutação. Multiplicador Base aumentado!`);
}
}
break;
case 'combat':
alert("A negociação falhou. Prepare-se para o combate!");
if (typeof initCombat === 'function') initCombat(false);
switchScreen('combat-screen');
return; // Sai da função sem voltar ao mapa
case 'none':
alert("Você escapa ileso pelas sombras.");
break;
}

updateHUD();

// Retorna ao mapa após concluir o evento
switchScreen('map-screen');
}

