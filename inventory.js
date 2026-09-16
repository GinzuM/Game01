// inventory.js - Gerenciamento Dinâmico do Arquivo (Deck e Bag)

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('inventory-modal');
    const btnOpen = document.getElementById('btn-inventory');
    const btnClose = document.getElementById('close-inventory');

    // Controle de Abertura Global
    if (btnOpen && modal) {
        btnOpen.addEventListener('click', () => {
            renderInventory();
            modal.classList.remove('hidden');
        });
    }

    // Controle de Fechamento
    if (btnClose && modal) {
        btnClose.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    // Fechar ao clicar fora do conteúdo do modal (no fundo escuro)
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
});

// Renderiza visualmente as cartas e implantes
function renderInventory() {
    const deckGrid = document.getElementById('deck-grid');
    const implantsGrid = document.getElementById('implants-grid');
    
    if (deckGrid) deckGrid.innerHTML = '';
    if (implantsGrid) implantsGrid.innerHTML = '';

    // Renderizar Tomos (Deck/Cartas)
    if (deckGrid && GameState.deck) {
        GameState.deck.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card-item';
            cardEl.innerHTML = `
                <div class="card-title">${card.name}</div>
                <div class="card-desc">Rolagem: ${card.dice}<br>Mult Base: x${card.baseMult}</div>
                <div class="card-desc" style="color: var(--corrupt-green); margin-top: 5px;">${card.description}</div>
            `;
            
            // Duplo clique prepara a inspeção para aplicação de upgrades dinâmicos na loja
            cardEl.addEventListener('dblclick', () => inspectCard(card));
            
            deckGrid.appendChild(cardEl);
        });
    }

    // Renderizar Implantes (Bag/Coringas)
    if (implantsGrid && GameState.bag) {
        GameState.bag.forEach(implant => {
            const impEl = document.createElement('div');
            impEl.className = 'card-item ps1-jitter'; // Implantes sofrem o efeito de tremor
            impEl.style.borderColor = 'var(--flesh-red)';
            impEl.innerHTML = `
                <div class="card-title" style="color: var(--flesh-red);">${implant.name}</div>
                <div class="card-desc">${implant.description}</div>
            `;
            implantsGrid.appendChild(impEl);
        });
    }
}

// Inspecionar ou Modificar Carta
function inspectCard(card) {
    console.log(`Auditoria de anomalia: ${card.name} [ID Instância: ${card.instanceId}]`);
    // O gancho para aplicar mods comprados na loja opera aqui
}

// Utilitário de Sacrifício e Deleção
function removeCardFromDeck(instanceId) {
    if (!GameState.deck) return;
    
    GameState.deck = GameState.deck.filter(c => c.instanceId !== instanceId);
    
    if (typeof updateHUD === 'function') {
        updateHUD();
    }
    
    const modal = document.getElementById('inventory-modal');
    if (modal && !modal.classList.contains('hidden')) {
        renderInventory();
    }
}
