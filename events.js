// events.js - Gerenciamento de Anomalias Narrativas e Sacrifícios

let currentEvent = null;

function triggerEvent() {
    console.log("Detectando assinatura de anomalia...");
    
    // Verificação estrita de segurança do banco de dados procedural
    if (!GameState.db || !GameState.db.events || GameState.db.events.length === 0) {
        console.error("Nenhum evento encontrado no banco de dados.");
        if (typeof switchScreen === 'function') {
            switchScreen('map-screen');
        }
        return;
    }

    // Sorteia um evento aleatório
    const randomIndex = Math.floor(Math.random() * GameState.db.events.length);
    currentEvent = GameState.db.events[randomIndex];

    renderEvent(currentEvent);
}

function renderEvent(eventData) {
    const titleEl = document.getElementById('event-title');
    const descEl = document.getElementById('event-description');
    const choicesContainer = document.getElementById('event-choices');

    if (titleEl) titleEl.innerText = eventData.title;
    if (descEl) descEl.innerText = eventData.description;
    
    if (choicesContainer) {
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
}

function handleEventChoice(choice) {
    let canAfford = true;

    // 1. Processar o Custo (Cost)
    switch (choice.cost) {
        case 'lose_1_card':
            if (GameState.deck.length >= 1) {
                const sacrificed = GameState.deck.pop();
                alert(`Tomo sacrificado: ${sacrificed.name}`);
            } else {
                canAfford = false;
                alert("Cartas insuficientes para o sacrifício.");
            }
            break;
        case 'lose_3_specific':
            if (GameState.deck.length >= 3) {
                GameState.deck.splice(-3, 3);
                alert("3 tomos foram consumidos pela anomalia.");
            } else {
                canAfford = false;
                alert("Você não possui o conhecimento (cartas) necessário para satisfazer a entidade.");
            }
            break;
        case 'hp_15':
            if (typeof takeDamage === 'function') {
                takeDamage(15);
            }
            alert("Sua carne foi mutilada. -15% Integridade.");
            break;
        case 'none':
            break;
        default:
            console.warn("Custo desconhecido:", choice.cost);
    }

    if (!canAfford) return; // Aborta se não tiver os recursos

    // 2. Processar a Recompensa (Reward)
    switch (choice.rewardType) {
        case 'currency':
            GameState.currency += choice.rewardValue;
            alert(`Você extraiu ${choice.rewardValue} de recursos.`);
            break;
        case 'implant':
            if (choice.rewardValue === 'random_joker' && GameState.db.implants) {
                const randomImplant = GameState.db.implants[Math.floor(Math.random() * GameState.db.implants.length)];
                GameState.bag.push({ ...randomImplant, instanceId: `evt_imp_${Date.now()}` });
                alert(`Novo implante parasita enxertado: ${randomImplant.name}`);
            }
            break;
        case 'upgrade':
            if (choice.rewardValue === 'base_mult_up') {
                if (GameState.deck.length > 0) {
                    GameState.deck[0].baseMult += 1.0;
                    alert(`O tomo ${GameState.deck[0].name} sofreu mutação. Multiplicador Base aumentado!`);
                }
            }
            break;
        case 'combat':
            alert("A negociação falhou. Prepare-se para o combate!");
            if (typeof initCombat === 'function') initCombat(false);
            if (typeof switchScreen === 'function') switchScreen('combat-screen');
            return; // Sai da função sem voltar ao mapa
        case 'none':
            alert("Você escapa ileso pelas sombras.");
            break;
    }

    if (typeof updateHUD === 'function') updateHUD();
    
    // Retorna ao mapa após concluir
    if (typeof switchScreen === 'function') {
        switchScreen('map-screen');
    }
}
