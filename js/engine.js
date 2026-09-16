// MOTOR PRINCIPAL GRIMOIRE.SYS V3.0

class GrimoireEngine {
    constructor() {
        this.state = {
            ante: 1,
            blindStep: 0, // 0=small, 1=big, 2=boss
            roundType: 'small',
            targetScore: 300,
            currentScore: 0,
            gold: 4,
            handsLeft: 4,
            discardsLeft: 3,
            handSize: 8,
            maxRelics: 5,
            maxConsumables: 2,
            deck: [],
            drawPile: [],
            hand: [],
            discardPile: [],
            selectedCards: [],
            relics: [],
            consumables: [],
            workbenchPool: [], // Pool temporária de reordenação e sacrifício
            tomeLevels: {},
            activeBoss: null,
            tempDiceBonus: null,
            bestTomeScore: 0,
            permanentDiscardPenalty: 0,
            bossMultiplier: 1.0,
            isDiceGolden: false,
            shopStock: [],
            packStock: []
        };

        this.initLevels();
        this.initDOM();
        this.bindEvents();
    }

    initLevels() {
        Object.keys(SPELL_TOMES).forEach(key => {
            this.state.tomeLevels[key] = { level: 1 };
        });
    }

    initDOM() {
        this.dom = {
            titleScreen: document.getElementById('title-screen'),
            btnStartGame: document.getElementById('btn-start-game'),
            targetScore: document.getElementById('target-score'),
            currentScore: document.getElementById('current-score'),
            handsLeft: document.getElementById('hands-left'),
            discardsLeft: document.getElementById('discards-left'),
            playerGold: document.getElementById('player-gold'),
            tomeName: document.getElementById('tome-name'),
            tomeLevel: document.getElementById('tome-level'),
            calcChips: document.getElementById('calc-chips'),
            calcMult: document.getElementById('calc-mult'),
            calcEst: document.getElementById('calc-est'),
            handStage: document.getElementById('hand-stage'),
            castStage: document.getElementById('cast-stage'),
            relicSlots: document.getElementById('relic-slots'),
            consumableSlots: document.getElementById('consumable-slots'),
            deckCountHud: document.getElementById('deck-count-hud'),
            btnCast: document.getElementById('btn-cast'),
            btnDiscard: document.getElementById('btn-discard'),
            btnRerollDice: document.getElementById('btn-reroll-dice'),
            dicePoly: document.getElementById('dice-poly'),
            diceLog: document.getElementById('dice-log'),
            diceGoldStatus: document.getElementById('dice-gold-status'),
            anteIndicator: document.getElementById('ante-indicator'),
            bossCurseBox: document.getElementById('boss-curse-box'),
            curseDesc: document.getElementById('curse-desc'),
            enemyTitle: document.getElementById('enemy-title'),
            enemyHpFill: document.getElementById('enemy-hp-fill'),
            victoryBanner: document.getElementById('victory-banner'),
            blindModal: document.getElementById('blind-modal'),
            shopModal: document.getElementById('shop-modal'),
            tomesModal: document.getElementById('tomes-modal'),
            codexModal: document.getElementById('codex-modal'),
            workbenchModal: document.getElementById('workbench-modal'),
            gameoverModal: document.getElementById('gameover-modal'),
            shopItemsRow: document.getElementById('shop-items-row'),
            shopPacksRow: document.getElementById('shop-packs-row'),
            shopGoldCounter: document.getElementById('shop-gold-counter'),
            tomesListContainer: document.getElementById('tomes-list-container'),
            blindSlotSmall: document.getElementById('blind-slot-small'),
            blindSlotBig: document.getElementById('blind-slot-big'),
            blindSlotBoss: document.getElementById('blind-slot-boss'),
            wbEquippedRelics: document.getElementById('workbench-equipped-relics'),
            wbEquippedCons: document.getElementById('workbench-equipped-consumables'),
            wbTablePool: document.getElementById('workbench-table-pool')
        };
    }

    bindEvents() {
        this.dom.btnStartGame.addEventListener('click', () => {
            this.dom.titleScreen.classList.add('hidden');
            SoundFX.getContext();
            this.startNewGame();
        });

        this.dom.btnCast.addEventListener('click', () => this.castTomeBalatroStyle());
        this.dom.btnDiscard.addEventListener('click', () => this.discardSelected());
        this.dom.btnRerollDice.addEventListener('click', () => this.forceRerollDice());

        document.getElementById('btn-sort-val').addEventListener('click', () => {
            this.state.hand.sort((a, b) => b.val - a.val);
            this.renderHand();
            SoundFX.playCardClick();
        });

        document.getElementById('btn-sort-suit').addEventListener('click', () => {
            this.state.hand.sort((a, b) => a.suit.localeCompare(b.suit) || b.val - a.val);
            this.renderHand();
            SoundFX.playCardClick();
        });

        // Modais Superiores
        document.getElementById('btn-open-tomes').addEventListener('click', () => this.openTomesModal());
        document.getElementById('btn-close-tomes').addEventListener('click', () => this.dom.tomesModal.classList.remove('active'));

        document.getElementById('btn-open-codex').addEventListener('click', () => this.openCodexModal());
        document.getElementById('btn-close-codex').addEventListener('click', () => this.dom.codexModal.classList.remove('active'));

        // Bancada / Pool Temporária
        document.getElementById('btn-open-workbench').addEventListener('click', () => this.openWorkbench());
        document.getElementById('btn-close-workbench').addEventListener('click', () => this.closeWorkbench());
        document.getElementById('btn-clear-pool').addEventListener('click', () => {
            this.state.workbenchPool = [];
            this.renderWorkbench();
        });

        // Blinds
        document.getElementById('btn-play-small').addEventListener('click', () => this.selectBlind('small'));
        document.getElementById('btn-skip-small').addEventListener('click', () => this.skipBlind('small'));

        document.getElementById('btn-play-big').addEventListener('click', () => this.selectBlind('big'));
        document.getElementById('btn-skip-big').addEventListener('click', () => this.skipBlind('big'));

        document.getElementById('btn-play-boss').addEventListener('click', () => this.selectBlind('boss'));

        // Loja
        document.getElementById('btn-leave-shop').addEventListener('click', () => {
            this.dom.shopModal.classList.remove('active');
            this.showBlindSelection();
        });

        document.getElementById('btn-reroll-shop').addEventListener('click', () => this.rerollShop());
        document.getElementById('btn-restart-game').addEventListener('click', () => this.startNewGame());
    }

    startNewGame() {
        this.dom.gameoverModal.classList.remove('active');
        this.dom.shopModal.classList.remove('active');
        this.dom.victoryBanner.classList.remove('active');
        this.state.ante = 1;
        this.state.blindStep = 0;
        this.state.gold = 4;
        this.state.permanentDiscardPenalty = 0;
        this.state.bossMultiplier = 1.0;
        this.state.isDiceGolden = false;
        this.state.relics = [];
        this.state.consumables = [];
        this.state.workbenchPool = [];
        this.state.deck = DeckManager.createStarterDeck();
        this.initLevels();

        // Dá 2 relíquias com efeito de ordem e sinergia
        RelicManager.addRelic(this.state, RELIC_CATALOG[0]); // Olho
        RelicManager.addRelic(this.state, RELIC_CATALOG[3]); // Condensador esquerdo

        this.generateShopStock();
        this.showBlindSelection();
    }

    showBlindSelection() {
        const ante = this.state.ante;
        document.getElementById('current-ante-display').textContent = ante;

        const base = Math.floor(300 * Math.pow(1.5, ante - 1));
        const smallScore = base;
        const bigScore = Math.floor(base * 1.5);
        const bossScore = Math.floor(base * 2.0 * this.state.bossMultiplier);

        document.getElementById('b-score-small').textContent = smallScore;
        document.getElementById('b-score-big').textContent = bigScore;
        document.getElementById('b-score-boss').textContent = bossScore;

        this.currentStigmaSmall = STIGMA_DATABASE[Math.floor(Math.random() * STIGMA_DATABASE.length)];
        this.currentStigmaBig = STIGMA_DATABASE[Math.floor(Math.random() * STIGMA_DATABASE.length)];

        document.getElementById('stigma-desc-small').textContent = `ESTIGMA: ${this.currentStigmaSmall.name} - ${this.currentStigmaSmall.desc}`;
        document.getElementById('stigma-desc-big').textContent = `ESTIGMA: ${this.currentStigmaBig.name} - ${this.currentStigmaBig.desc}`;

        if (!this.state.activeBoss) {
            this.state.activeBoss = BOSS_AFFLICTIONS[Math.floor(Math.random() * BOSS_AFFLICTIONS.length)];
        }
        document.getElementById('boss-curse-preview').textContent = `MALDIÇÃO: ${this.state.activeBoss.name} - ${this.state.activeBoss.desc}`;

        this.dom.blindSlotSmall.classList.add('locked');
        this.dom.blindSlotBig.classList.add('locked');
        this.dom.blindSlotBoss.classList.add('locked');

        if (this.state.blindStep === 0) this.dom.blindSlotSmall.classList.remove('locked');
        else if (this.state.blindStep === 1) this.dom.blindSlotBig.classList.remove('locked');
        else if (this.state.blindStep === 2) this.dom.blindSlotBoss.classList.remove('locked');

        this.dom.blindModal.classList.add('active');
    }

    skipBlind(type) {
        this.dom.blindModal.classList.remove('active');
        if (type === 'small') this.currentStigmaSmall.apply(this.state);
        else this.currentStigmaBig.apply(this.state);

        this.state.blindStep += 1;
        // Reestoca a loja automaticamente entre fases!
        this.generateShopStock();
        this.openShop();
    }

    selectBlind(type) {
        this.state.roundType = type;
        this.dom.blindModal.classList.remove('active');

        const base = Math.floor(300 * Math.pow(1.5, this.state.ante - 1));
        if (type === 'small') {
            this.state.targetScore = base;
            this.dom.anteIndicator.textContent = `SETOR ${this.state.ante} // ANOMALIA MENOR`;
            this.dom.enemyTitle.textContent = "ECO DE BIOMASSA DEGRADADA";
            this.dom.bossCurseBox.style.display = 'none';
        } else if (type === 'big') {
            this.state.targetScore = Math.floor(base * 1.5);
            this.dom.anteIndicator.textContent = `SETOR ${this.state.ante} // ANOMALIA MAIOR`;
            this.dom.enemyTitle.textContent = "CONSTRUTO BIOCIBERNÉTICO";
            this.dom.bossCurseBox.style.display = 'none';
        } else {
            this.state.targetScore = Math.floor(base * 2.0 * this.state.bossMultiplier);
            this.dom.anteIndicator.textContent = `SETOR ${this.state.ante} // ENTIDADE EXCOMUNGADA`;
            this.dom.enemyTitle.textContent = this.state.activeBoss.name;
            this.dom.bossCurseBox.style.display = 'block';
            this.dom.curseDesc.textContent = this.state.activeBoss.desc;
        }

        this.startRound();
    }

    startRound() {
        this.state.currentScore = 0;
        this.state.handsLeft = 4;
        this.state.discardsLeft = Math.max(1, 3 - this.state.permanentDiscardPenalty);
        this.state.selectedCards = [];

        if (this.state.roundType === 'boss' && this.state.activeBoss.onInitRound) {
            this.state.activeBoss.onInitRound(this.state);
        }

        this.state.drawPile = DeckManager.shuffle([...this.state.deck]);
        this.state.discardPile = [];
        this.state.hand = [];

        this.drawCards(this.state.handSize);
        // Toda nova rodada e nova mão roda o dado automaticamente!
        this.triggerHandDiceRoll();
        this.updateHUD();
    }

    drawCards(count) {
        while (this.state.hand.length < this.state.handSize && this.state.drawPile.length > 0) {
            this.state.hand.push(this.state.drawPile.pop());
        }
        this.renderHand();
    }

    // ROLAGEM AUTOMÁTICA DO DADO A CADA NOVA MÃO
    triggerHandDiceRoll() {
        SoundFX.playDiceRoll();
        this.dom.dicePoly.classList.add('rolling');
        setTimeout(() => {
            this.dom.dicePoly.classList.remove('rolling');
            const { val, message } = DiceRoller.rollForNewHand(this.state);
            this.dom.dicePoly.textContent = val;
            this.dom.diceLog.textContent = message;
            if (this.state.isDiceGolden) {
                this.dom.dicePoly.classList.add('golden-dice');
                this.dom.diceGoldStatus.style.display = 'inline';
            } else {
                this.dom.dicePoly.classList.remove('golden-dice');
                this.dom.diceGoldStatus.style.display = 'none';
            }
            this.updateScoringPreview();
        }, 300);
    }

    forceRerollDice() {
        if (this.state.discardsLeft <= 0) {
            alert("Necessário pelo menos 1 Descarte para forçar o reroll do Dado!");
            return;
        }
        this.state.discardsLeft -= 1;
        this.triggerHandDiceRoll();
        this.updateHUD();
    }

    // RENDERIZAÇÃO REAL DOS COMPONENTES (RATO, SAPO, RAM, DISQUETE, LÁPIDE)
    renderHand() {
        this.dom.handStage.innerHTML = '';
        this.state.hand.forEach(card => {
            const cardEl = this.createComponentElement(card);
            cardEl.addEventListener('click', () => this.toggleCardSelect(card));
            this.dom.handStage.appendChild(cardEl);
        });
        this.updateScoringPreview();
    }

    createComponentElement(card) {
        const wrapper = document.createElement('div');
        wrapper.className = 'component-wrapper';
        wrapper.setAttribute('data-suit', card.suit);
        wrapper.setAttribute('data-uid', card.uid);

        if (card.foil) wrapper.classList.add('foil');
        if (card.dourado) wrapper.classList.add('dourado');

        if (this.state.roundType === 'boss' && this.state.activeBoss && this.state.activeBoss.isCardDebuffed && this.state.activeBoss.isCardDebuffed(card)) {
            wrapper.classList.add('amaldicoado');
        }

        if (this.state.selectedCards.includes(card)) {
            wrapper.classList.add('selected');
        }

        const valStr = DeckManager.getCardDisplayValue(card.val);

        // INJETA O HTML REAL DE CADA OBJETO FÍSICO
        if (card.suit === 'roedor') {
            wrapper.innerHTML = `
                <div class="scale-rat-box">
                    <div class="dead-mouse-vertical">
                        <div class="tail"></div>
                        <div class="paw back left"></div>
                        <div class="paw back right"></div>
                        <div class="body">
                            <div class="scar-val">${valStr}</div>
                        </div>
                        <div class="paw front left"></div>
                        <div class="paw front right"></div>
                        <div class="ear left"></div>
                        <div class="ear right"></div>
                        <div class="head">
                            <div class="eye-dead left">✕</div>
                            <div class="eye-dead right">✕</div>
                            <div class="nose"></div>
                            <div class="whiskers left"></div>
                            <div class="whiskers right"></div>
                        </div>
                    </div>
                </div>
            `;
        } else if (card.suit === 'anfibio') {
            wrapper.innerHTML = `
                <div class="scale-frog-box">
                    <div class="dead-frog-final">
                        <div class="leg-back left"></div>
                        <div class="leg-back right"></div>
                        <div class="arm left"></div>
                        <div class="arm right"></div>
                        <div class="frog-body">
                            <div class="center-val">${valStr}</div>
                        </div>
                        <div class="frog-head">
                            <div class="dead-x left">✕</div>
                            <div class="dead-x right">✕</div>
                        </div>
                    </div>
                </div>
            `;
        } else if (card.suit === 'ram') {
            wrapper.innerHTML = `
                <div class="scale-ram-box">
                    <div class="ram-module-vertical">
                        <div class="pcb-board">
                            <div class="chips-container">
                                <div class="chip"></div>
                                <div class="chip"></div>
                                <div class="chip"></div>
                                <div class="chip"></div>
                                <div class="chip"></div>
                                <div class="chip"></div>
                            </div>
                            <div class="brand-val">${valStr}</div>
                        </div>
                        <div class="gold-pins-side"></div>
                    </div>
                </div>
            `;
        } else if (card.suit === 'disquete') {
            wrapper.innerHTML = `
                <div class="floppy-disk-vertical">
                    <div class="floppy-metal-shutter">
                        <div class="floppy-shutter-hole"></div>
                    </div>
                    <div class="floppy-sticker">
                        <div class="floppy-val">${valStr}</div>
                        <div class="floppy-label">CORROM знач</div>
                    </div>
                </div>
            `;
        } else { // Lápide
            wrapper.innerHTML = `
                <div class="tombstone-vertical">
                    <div class="tomb-cross">☥</div>
                    <div class="tomb-val">${valStr}</div>
                </div>
            `;
        }

        return wrapper;
    }

    toggleCardSelect(card) {
        SoundFX.playCardClick();
        const idx = this.state.selectedCards.indexOf(card);
        if (idx >= 0) {
            this.state.selectedCards.splice(idx, 1);
        } else {
            if (this.state.selectedCards.length < 5) {
                this.state.selectedCards.push(card);
            }
        }
        this.renderHand();
        document.getElementById('discard-count-btn').textContent = this.state.selectedCards.length;
    }

    updateScoringPreview() {
        if (this.state.selectedCards.length === 0) {
            this.dom.tomeName.textContent = "--- SELECIONE COMPONENTES ---";
            this.dom.tomeLevel.textContent = "LVL. 1";
            this.dom.calcChips.textContent = "0";
            this.dom.calcMult.textContent = "0";
            this.dom.calcEst.textContent = "0";
            return;
        }

        const res = TomeScorer.calculateScore(this.state.selectedCards, this.state);
        if (res && res.tome) {
            this.dom.tomeName.textContent = res.tome.name;
            this.dom.tomeLevel.textContent = `LVL. ${res.level}`;
            this.dom.calcChips.textContent = res.chips;
            this.dom.calcMult.textContent = res.mult;
            this.dom.calcEst.textContent = res.total;
        }
    }

    castTomeBalatroStyle() {
        if (this.state.selectedCards.length === 0 || this.state.handsLeft <= 0) return;

        const cardsToScore = [...this.state.selectedCards];
        this.dom.btnCast.disabled = true;
        this.dom.btnDiscard.disabled = true;

        this.dom.castStage.innerHTML = '';
        cardsToScore.forEach(card => {
            const el = this.createComponentElement(card);
            this.dom.castStage.appendChild(el);
        });

        this.state.hand = this.state.hand.filter(c => !cardsToScore.includes(c));
        this.renderHand();

        const res = TomeScorer.calculateScore(cardsToScore, this.state);
        const stageChildren = Array.from(this.dom.castStage.children);

        stageChildren.forEach((childEl, index) => {
            setTimeout(() => {
                childEl.classList.add('scoring-pop');
                SoundFX.playScorePing(index);

                if (cardsToScore[index] && cardsToScore[index].dourado) {
                    this.state.gold += 1;
                    this.updateHUD();
                }
            }, (index + 1) * 300);
        });

        const finishDelay = (stageChildren.length + 1) * 300;
        setTimeout(() => {
            SoundFX.playScorePing(6);
            this.state.currentScore += res.total;
            if (res.total > this.state.bestTomeScore) {
                this.state.bestTomeScore = res.total;
            }

            this.state.handsLeft -= 1;
            this.state.selectedCards = [];
            this.dom.btnCast.disabled = false;
            this.dom.btnDiscard.disabled = false;
            this.dom.castStage.innerHTML = '';

            this.updateHUD();

            if (this.state.currentScore >= this.state.targetScore) {
                this.triggerVictorySequence();
            } else if (this.state.handsLeft <= 0) {
                this.gameOver();
            } else {
                this.drawCards(this.state.handSize);
                // A cada nova mão que o jogador vai jogar, gira o d20 novamente!
                this.triggerHandDiceRoll();
            }
        }, finishDelay + 250);
    }

    discardSelected() {
        if (this.state.discardsLeft <= 0 || this.state.selectedCards.length === 0) return;

        SoundFX.playDiscard();
        this.state.discardsLeft -= 1;

        const selectedUIDs = this.state.selectedCards.map(c => c.uid);
        const cardElements = document.querySelectorAll('.component-wrapper.selected');

        cardElements.forEach(el => el.classList.add('discard-flying'));

        setTimeout(() => {
            this.state.hand = this.state.hand.filter(c => !selectedUIDs.includes(c.uid));
            this.state.selectedCards = [];
            this.drawCards(this.state.handSize);
            this.updateHUD();
            document.getElementById('discard-count-btn').textContent = 0;
        }, 400);
    }

    triggerVictorySequence() {
        SoundFX.playVictory();
        const earnedFrags = 3 + this.state.handsLeft;
        this.state.gold += earnedFrags;

        document.getElementById('victory-rewards-text').textContent = `+${earnedFrags} FRAGS RECEBIDOS`;
        this.dom.victoryBanner.classList.add('active');

        setTimeout(() => {
            this.dom.victoryBanner.classList.remove('active');

            if (this.state.roundType === 'boss') {
                this.state.ante += 1;
                this.state.blindStep = 0;
                this.state.activeBoss = null;
            } else {
                this.state.blindStep += 1;
            }

            // Reestoca os itens automaticamente!
            this.generateShopStock();
            this.openShop();
        }, 1600);
    }

    gameOver() {
        document.getElementById('final-ante-val').textContent = this.state.ante;
        document.getElementById('final-best-val').textContent = this.state.bestTomeScore;
        this.dom.gameoverModal.classList.add('active');
    }

    // LOJA
    openShop() {
        this.dom.shopGoldCounter.textContent = this.state.gold;
        this.renderShop();
        this.dom.shopModal.classList.add('active');
    }

    generateShopStock() {
        this.state.shopStock = ShopManager.generateFreshStock(this.state);
        this.state.packStock = ShopManager.generatePackStock();
    }

    renderShop() {
        this.dom.shopItemsRow.innerHTML = '';
        this.dom.shopPacksRow.innerHTML = '';

        this.state.shopStock.forEach((item, index) => {
            const el = document.createElement('div');
            el.className = `shop-card ${item.sold ? 'sold-out' : ''}`;
            el.innerHTML = `
                <div class="shop-card-icon">${item.icon}</div>
                <div class="shop-card-name">${item.name}</div>
                <div class="shop-card-desc">${item.desc}</div>
                <div class="shop-card-price">$${item.cost} Frags</div>
                <button class="cyber-btn btn-sm btn-primary btn-buy-item" ${item.sold ? 'disabled' : ''}>COMPRAR</button>
            `;
            if (!item.sold) {
                el.querySelector('.btn-buy-item').addEventListener('click', () => this.buyShopItem(item, index));
            }
            this.dom.shopItemsRow.appendChild(el);
        });

        this.state.packStock.forEach((pack, index) => {
            const el = document.createElement('div');
            el.className = `shop-card ${pack.sold ? 'sold-out' : ''}`;
            el.innerHTML = `
                <div class="shop-card-icon">${pack.icon}</div>
                <div class="shop-card-name">${pack.name}</div>
                <div class="shop-card-desc">${pack.desc}</div>
                <div class="shop-card-price">$${pack.cost} Frags</div>
                <button class="cyber-btn btn-sm btn-primary btn-buy-pack" ${pack.sold ? 'disabled' : ''}>COMPRAR</button>
            `;
            if (!pack.sold) {
                el.querySelector('.btn-buy-pack').addEventListener('click', () => this.buyPack(pack, index));
            }
            this.dom.shopPacksRow.appendChild(el);
        });
    }

    buyShopItem(item, index) {
        if (this.state.gold < item.cost) {
            alert("Fragmentos insuficientes!");
            return;
        }

        if (item.category === 'relic') {
            if (this.state.relics.length >= this.state.maxRelics) {
                alert("Rack de Implantes cheio (Máx: 5)! Mova para a Bancada para substituir.");
                return;
            }
            this.state.gold -= item.cost;
            RelicManager.addRelic(this.state, item);
            item.sold = true;
        } else if (item.category === 'consumable') {
            if (this.state.consumables.length >= this.state.maxConsumables) {
                alert("Rack de Rituais cheio (Máx: 2)!");
                return;
            }
            this.state.gold -= item.cost;
            RelicManager.addConsumable(this.state, item);
            item.sold = true;
        }

        this.dom.shopGoldCounter.textContent = this.state.gold;
        this.updateHUD();
        this.renderShop();
    }

    buyPack(pack, index) {
        if (this.state.gold < pack.cost) {
            alert("Fragmentos insuficientes!");
            return;
        }
        this.state.gold -= pack.cost;
        pack.sold = true;

        const targetSuits = pack.id === 'pack_bio' ? ['roedor', 'anfibio'] : ['ram', 'disquete'];
        for (let i = 0; i < 3; i++) {
            this.state.deck.push({
                uid: DeckManager.generateUID(),
                suit: targetSuits[Math.floor(Math.random() * targetSuits.length)],
                val: Math.floor(Math.random() * 9) + 2,
                bonusChips: 0,
                bonusMult: 0,
                foil: false,
                dourado: false
            });
        }
        alert("3 novos componentes anatômicos fundidos ao Códice!");
        this.dom.shopGoldCounter.textContent = this.state.gold;
        this.updateHUD();
        this.renderShop();
    }

    rerollShop() {
        if (this.state.gold < 4) {
            alert("Necessário 4 Frags para reabastecer!");
            return;
        }
        this.state.gold -= 4;
        this.generateShopStock();
        this.dom.shopGoldCounter.textContent = this.state.gold;
        this.renderShop();
    }

    // =========================================================================
    // A NOVA BANCADA / POOL TEMPORÁRIA: REORDENAÇÃO E SACRIFÍCIO
    // =========================================================================
    openWorkbench() {
        this.renderWorkbench();
        this.dom.workbenchModal.classList.add('active');
    }

    closeWorkbench() {
        // Ao fechar, tudo o que sobrou na Bancada Temporária é DESTRUÍDO E PURGADO!
        if (this.state.workbenchPool.length > 0) {
            const purgedNames = this.state.workbenchPool.map(i => i.name).join(', ');
            alert(`ITENS PURGADOS E DESTRUÍDOS DA MESA: ${purgedNames}`);
            this.state.workbenchPool = [];
        }
        this.dom.workbenchModal.classList.remove('active');
        this.updateHUD();
    }

    renderWorkbench() {
        this.dom.wbEquippedRelics.innerHTML = '';
        this.dom.wbEquippedCons.innerHTML = '';
        this.dom.wbTablePool.innerHTML = '';

        // Relíquias Equipadas
        this.state.relics.forEach((r, idx) => {
            const card = document.createElement('div');
            card.className = 'pool-item-card';
            card.title = `${r.name}: ${r.desc} (Clique para mover para a mesa)`;
            card.innerHTML = `<span>${r.icon}</span> <span>[#${idx+1}] ${r.name}</span>`;
            card.onclick = () => {
                // Remove do equipado e move para a pool da mesa
                const removed = this.state.relics.splice(idx, 1)[0];
                if (removed.onUnequip) removed.onUnequip(this.state);
                this.state.workbenchPool.push(removed);
                this.renderWorkbench();
            };
            this.dom.wbEquippedRelics.appendChild(card);
        });

        // Rituais Equipados
        this.state.consumables.forEach((c, idx) => {
            const card = document.createElement('div');
            card.className = 'pool-item-card';
            card.title = `${c.name}: ${c.desc} (Clique para mover para a mesa)`;
            card.innerHTML = `<span>${c.icon}</span> <span>${c.name}</span>`;
            card.onclick = () => {
                const removed = this.state.consumables.splice(idx, 1)[0];
                this.state.workbenchPool.push(removed);
                this.renderWorkbench();
            };
            this.dom.wbEquippedCons.appendChild(card);
        });

        // Itens na Mesa Temporária
        this.state.workbenchPool.forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = 'pool-item-card';
            card.style.borderColor = '#ff758f';
            card.title = `${item.name}: ${item.desc} (Clique para equipar de volta na última posição)`;
            card.innerHTML = `<span>${item.icon}</span> <span>${item.name}</span>`;
            card.onclick = () => {
                if (item.category === 'relic') {
                    if (this.state.relics.length >= this.state.maxRelics) {
                        alert("Rack de Implantes cheio!");
                        return;
                    }
                    this.state.workbenchPool.splice(idx, 1);
                    RelicManager.addRelic(this.state, item);
                } else {
                    if (this.state.consumables.length >= this.state.maxConsumables) {
                        alert("Rack de Rituais cheio!");
                        return;
                    }
                    this.state.workbenchPool.splice(idx, 1);
                    RelicManager.addConsumable(this.state, item);
                }
                this.renderWorkbench();
            };
            this.dom.wbTablePool.appendChild(card);
        });
    }

    openTomesModal() {
        this.dom.tomesListContainer.innerHTML = '';
        Object.values(SPELL_TOMES).forEach(tome => {
            const lvl = (this.state.tomeLevels[tome.id] && this.state.tomeLevels[tome.id].level) || 1;
            const curChips = tome.baseChips + ((lvl - 1) * tome.chipStep);
            const curMult = tome.baseMult + ((lvl - 1) * tome.multStep);

            const row = document.createElement('div');
            row.className = 'tome-row-item';
            row.innerHTML = `
                <div class="tome-row-left">
                    <div class="tome-row-title">${tome.name}</div>
                    <div class="tome-row-desc">${tome.desc}</div>
                </div>
                <div class="tome-row-right">
                    <span class="tome-lvl-badge">NÍVEL ${lvl}</span>
                    <span class="tome-chips-mult">${curChips} × ${curMult}</span>
                </div>
            `;
            this.dom.tomesListContainer.appendChild(row);
        });
        this.dom.tomesModal.classList.add('active');
    }

    openCodexModal() {
        document.getElementById('codex-total-num').textContent = this.state.deck.length;
        const grid = document.getElementById('codex-grid');
        grid.innerHTML = '';

        this.state.deck.forEach(card => {
            const el = this.createComponentElement(card);
            grid.appendChild(el);
        });

        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.onclick = (e) => {
                document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                const filter = e.target.getAttribute('data-filter');
                grid.innerHTML = '';
                const filtered = filter === 'all' ? this.state.deck : this.state.deck.filter(c => c.suit === filter);
                filtered.forEach(c => grid.appendChild(this.createComponentElement(c)));
            };
        });

        this.dom.codexModal.classList.add('active');
    }

    updateHUD() {
        this.dom.targetScore.textContent = this.state.targetScore;
        this.dom.currentScore.textContent = this.state.currentScore;
        this.dom.handsLeft.textContent = this.state.handsLeft;
        this.dom.discardsLeft.textContent = this.state.discardsLeft;
        this.dom.playerGold.textContent = this.state.gold;
        this.dom.deckCountHud.textContent = this.state.deck.length;

        const pct = Math.min(100, Math.floor((this.state.currentScore / this.state.targetScore) * 100));
        this.dom.enemyHpFill.style.width = `${pct}%`;

        this.dom.relicSlots.innerHTML = '';
        for (let i = 0; i < this.state.maxRelics; i++) {
            const relic = this.state.relics[i];
            const el = document.createElement('div');
            if (relic) {
                el.className = 'slot-item';
                el.title = `${relic.name}: ${relic.desc}`;
                el.innerHTML = `
                    <div class="slot-icon">${relic.icon}</div>
                    <div class="slot-name">${relic.name}</div>
                `;
            } else {
                el.className = 'slot-item slot-empty';
                el.textContent = '[SLOT VAZIO]';
            }
            this.dom.relicSlots.appendChild(el);
        }

        this.dom.consumableSlots.innerHTML = '';
        for (let i = 0; i < this.state.maxConsumables; i++) {
            const item = this.state.consumables[i];
            const el = document.createElement('div');
            if (item) {
                el.className = 'slot-item';
                el.title = `${item.name}: ${item.desc} (Clique para usar)`;
                el.innerHTML = `
                    <div class="slot-icon">${item.icon}</div>
                    <div class="slot-name">${item.name}</div>
                `;
                el.addEventListener('click', () => {
                    const success = RelicManager.useConsumable(this.state, i, this.state.selectedCards);
                    if (success) {
                        alert(`Ritual ${item.name} executado!`);
                        this.state.selectedCards = [];
                        this.renderHand();
                        this.updateHUD();
                    } else {
                        alert("Selecione os componentes necessários!");
                    }
                });
            } else {
                el.className = 'slot-item slot-empty';
                el.textContent = '[VAZIO]';
            }
            this.dom.consumableSlots.appendChild(el);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.gameEngine = new GrimoireEngine();
});
