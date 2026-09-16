// shop.js - Lógica do Mercador e Upgrades Dinâmicos

const ShopState = {
    currentItems: [],
    rerollCost: 5
};

// Inicializa a loja ao entrar no nó do mapa
function initShop() {
    console.log("Acessando interface do Mercador.");
    
    // Verifica se o banco de dados procedural existe antes de prosseguir
    if (!GameState.db || !GameState.db.tomes || !GameState.db.implants) {
        console.error("Erro: Banco de dados não carregado. Abortando loja.");
        return;
    }

    const btnReroll = document.getElementById('btn-reroll');
    const btnLeave = document.getElementById('btn-leave-shop');
    
    // Removemos os listeners antigos substituindo os botões por clones para evitar duplicação de eventos
    if (btnReroll) {
        const newBtnReroll = btnReroll.cloneNode(true);
        btnReroll.parentNode.replaceChild(newBtnReroll, btnReroll);
        newBtnReroll.addEventListener('click', rerollShop);
    }
    
    if (btnLeave) {
        const newBtnLeave = btnLeave.cloneNode(true);
        btnLeave.parentNode.replaceChild(newBtnLeave, btnLeave);
        newBtnLeave.addEventListener('click', leaveShop);
    }

    generateShopItems();
}

// Gera o inventário do mercador baseado no pool do data.json
function generateShopItems() {
    const shopContainer = document.getElementById('shop-items');
    if (!shopContainer) return;
    
    shopContainer.innerHTML = '';
    ShopState.currentItems = [];

    // O mercador exibe 3 itens aleatórios
    for (let i = 0; i < 3; i++) {
        const isImplant = Math.random() > 0.5;
        let pool = isImplant ? GameState.db.implants : GameState.db.tomes;
        
        if (pool && pool.length > 0) {
            let item = pool[Math.floor(Math.random() * pool.length)];
            let cost = isImplant ? Math.floor(Math.random() * 20) + 30 : Math.floor(Math.random() * 15) + 15;
            
            let shopItem = { ...item, cost: cost, isImplant: isImplant, instanceId: `shop_${Date.now()}_${i}` };
            ShopState.currentItems.push(shopItem);
        }
    }

    renderShopItems();
}

function renderShopItems() {
    const shopContainer = document.getElementById('shop-items');
    if (!shopContainer) return;
    
    shopContainer.innerHTML = '';

    ShopState.currentItems.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'card-item';
        itemEl.style.borderColor = item.isImplant ? 'var(--flesh-red)' : 'var(--metal-gray)';
        
        itemEl.innerHTML = `
            <div class="card-title" style="color: ${item.isImplant ? 'var(--flesh-red)' : 'var(--corrupt-green)'}">
                ${item.name}
            </div>
            <div class="card-desc" style="margin-top: 5px;">${item.description}</div>
            <div class="card-desc" style="margin-top: 10px; font-weight: bold; color: var(--highlight);">
                Preço: ${item.cost}
            </div>
        `;

        itemEl.addEventListener('click', () => buyItem(item, itemEl));
        shopContainer.appendChild(itemEl);
    });
}

function buyItem(item, elementNode) {
    if (GameState.currency >= item.cost) {
        GameState.currency -= item.cost;
        
        if (typeof updateHUD === 'function') updateHUD();
        
        // Remove da vitrine
        elementNode.remove();
        ShopState.currentItems = ShopState.currentItems.filter(i => i.instanceId !== item.instanceId);

        if (item.isImplant) {
            GameState.bag.push(item);
            console.log(`Implante adquirido: ${item.name}`);
        } else {
            GameState.deck.push(item);
            console.log(`Tomo adquirido: ${item.name}`);
        }
        
        // Atualiza o inventário em tempo real se o modal estiver aberto no fundo
        const inventoryModal = document.getElementById('inventory-modal');
        if (inventoryModal && !inventoryModal.classList.contains('hidden') && typeof renderInventory === 'function') {
            renderInventory();
        }
    } else {
        alert("Moeda insuficiente. O mercador recusa a transação.");
    }
}

function rerollShop() {
    if (GameState.currency >= ShopState.rerollCost) {
        GameState.currency -= ShopState.rerollCost;
        ShopState.rerollCost += 5; // Aumenta o custo a cada uso
        
        const btnReroll = document.getElementById('btn-reroll');
        if (btnReroll) {
            btnReroll.innerText = `Atualizar Vitrine (Custo: ${ShopState.rerollCost})`;
        }
        
        if (typeof updateHUD === 'function') updateHUD();
        generateShopItems();
    } else {
        alert("Recursos insuficientes para atualizar o catálogo.");
    }
}

function leaveShop() {
    ShopState.rerollCost = 5;
    const btnReroll = document.getElementById('btn-reroll');
    if (btnReroll) {
        btnReroll.innerText = `Atualizar Vitrine (Custo: 5)`;
    }
    
    if (typeof switchScreen === 'function') {
        switchScreen('map-screen');
    }
}
