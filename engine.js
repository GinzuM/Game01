// engine.js - Gerenciamento de Estado Global e Motor Principal

// 1. Definição estrita dos Estados Globais
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

const SettingsState = {
    volume: 100,
    guiScale: 1.0,
    sens: 1.0,
    ctrlScale: 1.0,
    mobileMode: false
};

// 2. Inicialização Segura
async function initGame() {
    console.log("Inicializando banco de dados procedural...");
    await loadData();
    buildInitialDeck();
    updateHUD();
    
    // O jogo aguarda na tela 'main-menu' (já definida como active no HTML).
    console.log("Sistema Pronto. Aguardando input no Menu Principal.");
}

// 3. Carregamento de Dados (Fetch com Fallback)
async function loadData() {
    try {
        const response = await fetch('data.json');
        GameState.db = await response.json();
        console.log("Arquivo de anomalias (data.json) carregado via Fetch.");
    } catch (error) {
        console.warn("Fetch bloqueado (CORS/Local). Lendo via tag de script (Fallback).");
        const dataElement = document.getElementById('game-data');
        if (dataElement) {
            GameState.db = JSON.parse(dataElement.textContent);
        } else {
            console.error("ERRO CRÍTICO: Banco de dados não encontrado.");
        }
    }
}

// 4. Montagem do Deck Inicial
function buildInitialDeck() {
    if (!GameState.db) return;
    
    GameState.deck = []; // Garante limpeza caso seja chamado múltiplas vezes
    
    const tomeD4 = GameState.db.tomes.find(t => t.id === 'tome_001');
    const tomeD8 = GameState.db.tomes.find(t => t.id === 'tome_003');
    
    for (let i = 0; i < 4; i++) {
        GameState.deck.push({ ...tomeD4, instanceId: `card_${Date.now()}_${i}` });
    }
    GameState.deck.push({ ...tomeD8, instanceId: `card_${Date.now()}_5` });
}

// 5. Roteamento de Telas (SPA)
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
    
    // Gatilho para renderizar o mapa caso a tela destino seja o map-screen
    if(screenId === 'map-screen' && typeof renderMap === 'function') {
        renderMap();
    }
}

// 6. Atualização de Interface (HUD)
function updateHUD() {
    const hpDisplay = document.getElementById('hp-display');
    const currencyDisplay = document.getElementById('currency-display');
    
    if (hpDisplay) hpDisplay.innerText = GameState.hp;
    if (currencyDisplay) currencyDisplay.innerText = GameState.currency;
    
    // Efeito visual de corrupção caso o HP esteja crítico
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

// 7. Sistema de Dano Global
function takeDamage(amount) {
    GameState.hp -= amount;
    if (GameState.hp < 0) GameState.hp = 0;
    
    updateHUD();
    
    if (GameState.hp === 0) {
        triggerGameOver();
    }
}

function triggerGameOver() {
    alert("INTEGRIDADE ZERO. SISTEMA CORROMPIDO.\nA Entidade consumiu seu código.");
    location.reload(); // Reinicia o ciclo (Roguelike loop)
}

// Inicia a engine apenas após o DOM estar completamente montado
window.addEventListener('DOMContentLoaded', initGame);
