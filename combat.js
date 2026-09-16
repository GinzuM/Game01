// combat.js - Motor Híbrido: Bullet Hell (Undertale) + Deckbuilding (Balatro) + RPG

const CombatState = {
    isActive: false,
    boss: null,
    drawPile: [],
    hand: [],
    selectedCards: [],
    drawCount: 5,
    animationId: null,
    projectiles: [],
    playerX: 300,
    playerY: 150,
    frame: 0
};

function initCombat(isBossMode = false) {
    console.log("Iniciando Sequência de Contenção/Combate.");
    
    // Verificações de segurança e carregamento de inimigo
    if (!GameState.db || !GameState.db.bosses) {
        console.error("Banco de dados indisponível para combate.");
        return;
    }

    // Seleciona um Boss ou um Inimigo padrão
    if (isBossMode) {
        CombatState.boss = { ...GameState.db.bosses[Math.floor(Math.random() * GameState.db.bosses.length)], currentHp: 250 };
    } else {
        // Gera um inimigo genérico para lutas normais
        CombatState.boss = { 
            name: "Anomalia Menor", 
            currentHp: 100, 
            bulletDensity: "low", 
            bulletSpeed: "slow",
            mechanic: "none"
        };
    }

    const bossNameEl = document.getElementById('boss-name');
    if (bossNameEl) bossNameEl.innerText = `${CombatState.boss.name} [HP: ${CombatState.boss.currentHp}]`;

    // Reseta o estado do jogador para a luta
    CombatState.drawPile = [...GameState.deck];
    CombatState.drawPile = shuffleArray(CombatState.drawPile);
    CombatState.hand = [];
    CombatState.selectedCards = [];
    CombatState.drawCount = GameState.maxDraw;
    CombatState.projectiles = [];
    CombatState.isActive = true;
    CombatState.frame = 0;

    // Atualiza a interface
    updateCombatUI();
    drawCards();
    
    // Binds dos botões da interface
    const btnPlay = document.getElementById('btn-play-ritual');
    const btnDiscard = document.getElementById('btn-discard');
    
    if (btnPlay) {
        const newBtnPlay = btnPlay.cloneNode(true);
        btnPlay.parentNode.replaceChild(newBtnPlay, btnPlay);
        newBtnPlay.addEventListener('click', executeRitual);
    }
    
    if (btnDiscard) {
        const newBtnDiscard = btnDiscard.cloneNode(true);
        btnDiscard.parentNode.replaceChild(newBtnDiscard, btnDiscard);
        newBtnDiscard.addEventListener('click', discardSelection);
    }

    // Inicia o motor físico da arena
    setupArena();
}

// ==========================================
// MÓDULO 1: DECKBUILDING & RPG (Balatro)
// ==========================================

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function drawCards() {
    while (CombatState.hand.length < 5 && CombatState.drawPile.length > 0 && CombatState.drawCount > 0) {
        CombatState.hand.push(CombatState.drawPile.pop());
        CombatState.drawCount--;
    }
    
    if (CombatState.drawPile.length === 0) {
        console.log("Pilha de saque vazia. Embaralhando deck...");
        CombatState.drawPile = shuffleArray([...GameState.deck]);
    }
    
    renderHand();
    updateCombatUI();
}

function renderHand() {
    const handContainer = document.getElementById('hand');
    if (!handContainer) return;
    handContainer.innerHTML = '';

    CombatState.hand.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card-item';
        cardEl.style.borderColor = CombatState.selectedCards.includes(index) ? 'var(--highlight)' : 'var(--metal-gray)';
        if (CombatState.selectedCards.includes(index)) {
            cardEl.style.transform = 'translateY(-10px)';
            cardEl.style.boxShadow = '0 0 10px var(--highlight)';
        }

        cardEl.innerHTML = `
            <div class="card-title">${card.name}</div>
            <div class="card-desc">Rolagem: ${card.dice}</div>
            <div class="card-desc">Mult: x${card.baseMult}</div>
        `;

        cardEl.addEventListener('click', () => toggleCardSelection(index));
        handContainer.appendChild(cardEl);
    });
}

function toggleCardSelection(index) {
    const selIndex = CombatState.selectedCards.indexOf(index);
    if (selIndex > -1) {
        CombatState.selectedCards.splice(selIndex, 1);
    } else {
        if (CombatState.selectedCards.length < 5) {
            CombatState.selectedCards.push(index);
        }
    }
    renderHand();
    calculatePreview();
}

function calculatePreview() {
    // Apenas visual. O cálculo real é no executeRitual.
    let totalMult = 1.0;
    CombatState.selectedCards.forEach(idx => {
        totalMult += CombatState.hand[idx].baseMult;
    });
    const multDisplay = document.getElementById('multiplier');
    if (multDisplay) multDisplay.innerText = totalMult.toFixed(1);
}

function discardSelection() {
    if (CombatState.selectedCards.length === 0) return;
    
    // Remove as cartas selecionadas da mão
    CombatState.selectedCards.sort((a, b) => b - a).forEach(idx => {
        CombatState.hand.splice(idx, 1);
    });
    
    CombatState.selectedCards = [];
    drawCards();
}

function rollDiceString(diceStr) {
    // Converte "2d6" em rolagens reais
    const parts = diceStr.toLowerCase().split('d');
    const amount = parts.length > 1 && parts[0] !== "" ? parseInt(parts[0]) : 1;
    const faces = parts.length > 1 ? parseInt(parts[1]) : parseInt(parts[0]);
    
    let total = 0;
    for (let i = 0; i < amount; i++) {
        total += Math.floor(Math.random() * faces) + 1;
    }
    return total;
}

function executeRitual() {
    if (CombatState.selectedCards.length === 0) return;

    let baseDamage = 0;
    let finalMult = 1.0;

    // Calcula os dados e multiplicadores das cartas
    CombatState.selectedCards.forEach(idx => {
        const card = CombatState.hand[idx];
        const rollResult = rollDiceString(card.dice);
        baseDamage += rollResult;
        finalMult += card.baseMult;
    });

    // Simulação da aplicação de Implantes (Bag/Coringas)
    let shrinkArena = false;
    GameState.bag.forEach(implant => {
        if (implant.mechanic === 'shrink_arena_mult_3') {
            finalMult *= 3;
            shrinkArena = true;
        }
        if (implant.mechanic === 'max_d8_blood' && GameState.hp > 5) {
            takeDamage(5); // Dano autoinfligido
        }
    });

    const totalDamage = Math.floor(baseDamage * finalMult);
    
    const diceDisplay = document.getElementById('dice-result');
    if (diceDisplay) {
        diceDisplay.innerText = `Rolou: ${baseDamage} (Dano Total: ${totalDamage})`;
        diceDisplay.classList.add('ps1-jitter');
        setTimeout(() => diceDisplay.classList.remove('ps1-jitter'), 500);
    }

    // Aplica o dano ao chefe
    CombatState.boss.currentHp -= totalDamage;
    const bossNameEl = document.getElementById('boss-name');
    if (bossNameEl) bossNameEl.innerText = `${CombatState.boss.name} [HP: ${Math.max(0, CombatState.boss.currentHp)}]`;

    // Remove as cartas usadas
    CombatState.selectedCards.sort((a, b) => b - a).forEach(idx => {
        CombatState.hand.splice(idx, 1);
    });
    CombatState.selectedCards = [];
    drawCards();

    // Checa fim do combate
    if (CombatState.boss.currentHp <= 0) {
        winCombat();
    }
}

function updateCombatUI() {
    const drawDisplay = document.getElementById('draw-count');
    if (drawDisplay) drawDisplay.innerText = CombatState.drawCount;
}

function winCombat() {
    CombatState.isActive = false;
    if (CombatState.animationId) cancelAnimationFrame(CombatState.animationId);
    
    GameState.currency += Math.floor(Math.random() * 30) + 20; // Recompensa
    alert("Entidade purgada. Recursos extraídos.");
    
    if (typeof updateHUD === 'function') updateHUD();
    if (typeof switchScreen === 'function') switchScreen('map-screen');
}


// ==========================================
// MÓDULO 2: BULLET HELL (Undertale)
// ==========================================

function setupArena() {
    const canvas = document.getElementById('arena');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Bind de movimento do mouse (desvincula anteriores para não acumular)
    canvas.onmousemove = (e) => {
        if (!CombatState.isActive) return;
        const rect = canvas.getBoundingClientRect();
        
        // Escala corrigida em relação ao tamanho real do canvas
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        CombatState.playerX = (e.clientX - rect.left) * scaleX;
        CombatState.playerY = (e.clientY - rect.top) * scaleY;
    };

    if (CombatState.animationId) cancelAnimationFrame(CombatState.animationId);
    arenaLoop(canvas, ctx);
}

class Projectile {
    constructor(width, height, speedProfile) {
        this.x = Math.random() < 0.5 ? 0 : width;
        this.y = Math.random() * height;
        this.size = Math.random() * 6 + 3;
        
        let baseSpeed = speedProfile === 'fast' ? 4 : 2;
        this.speedX = (Math.random() * baseSpeed + 1) * (this.x === 0 ? 1 : -1);
        this.speedY = (Math.random() - 0.5) * baseSpeed;
        
        this.color = Math.random() < 0.3 ? '#ff3333' : '#c4c4c4';
        this.isSquare = Math.random() < 0.2; // Algumas balas são quadrados low poly
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        if (this.isSquare) {
            ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function arenaLoop(canvas, ctx) {
    if (!CombatState.isActive) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    CombatState.frame++;

    // Taxa de spawn baseada na densidade do boss
    let spawnRate = CombatState.boss.bulletDensity === 'high' ? 10 : 25;
    
    if (CombatState.frame % spawnRate === 0) {
        CombatState.projectiles.push(new Projectile(canvas.width, canvas.height, CombatState.boss.bulletSpeed));
    }

    // Renderiza a alma/cursor do jogador (coração simplificado/quadrado roxo)
    ctx.fillStyle = 'var(--corrupt-green)';
    ctx.fillRect(CombatState.playerX - 5, CombatState.playerY - 5, 10, 10);

    // Processa os projéteis
    for (let i = CombatState.projectiles.length - 1; i >= 0; i--) {
        let p = CombatState.projectiles[i];
        p.update();
        p.draw(ctx);

        // Colisão
        const dist = Math.hypot(CombatState.playerX - p.x, CombatState.playerY - p.y);
        if (dist < p.size + 5) {
            if (typeof takeDamage === 'function') {
                takeDamage(2); // Dano constante por hit
            }
            CombatState.projectiles.splice(i, 1);
            
            // Feedback visual no canvas
            canvas.style.borderColor = 'var(--flesh-red)';
            setTimeout(() => { if (canvas) canvas.style.borderColor = 'var(--ui-border)'; }, 100);
        } else if (p.x < -50 || p.x > canvas.width + 50 || p.y < -50 || p.y > canvas.height + 50) {
            // Remove lixo de memória fora da tela
            CombatState.projectiles.splice(i, 1);
        }
    }

    CombatState.animationId = requestAnimationFrame(() => arenaLoop(canvas, ctx));
}
