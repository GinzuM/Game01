// MOTOR DE PONTUAÇÃO MATEMÁTICA V3 COM SINERGIA DE ORDEM/POSIÇÃO

class TomeScorer {
    static evaluateHand(selectedCards) {
        if (!selectedCards || selectedCards.length === 0) return null;

        const sorted = [...selectedCards].sort((a, b) => b.val - a.val);
        const len = sorted.length;

        const valCounts = {};
        const suitCounts = {};
        sorted.forEach(c => {
            valCounts[c.val] = (valCounts[c.val] || 0) + 1;
            suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
        });

        const counts = Object.values(valCounts).sort((a, b) => b - a);
        const isFlush = len >= 5 && Object.values(suitCounts).some(cnt => cnt >= 5);

        let isStraight = false;
        if (len >= 5) {
            const uniqueVals = [...new Set(sorted.map(c => c.val))].sort((a, b) => a - b);
            for (let i = 0; i <= uniqueVals.length - 5; i++) {
                if (uniqueVals[i+4] - uniqueVals[i] === 4) {
                    isStraight = true;
                    break;
                }
            }
        }

        if (isStraight && isFlush) return SPELL_TOMES.STRAIGHT_FLUSH;
        if (counts[0] >= 4) return SPELL_TOMES.FOUR_OF_A_KIND;
        if (counts[0] >= 3 && counts[1] >= 2) return SPELL_TOMES.FULL_HOUSE;
        if (isFlush) return SPELL_TOMES.FLUSH;
        if (isStraight) return SPELL_TOMES.STRAIGHT;
        if (counts[0] >= 3) return SPELL_TOMES.THREE_OF_A_KIND;
        if (counts[0] >= 2 && counts[1] >= 2) return SPELL_TOMES.TWO_PAIR;
        if (counts[0] >= 2) return SPELL_TOMES.PAIR;

        return SPELL_TOMES.SINGLE;
    }

    static calculateScore(selectedCards, gameState) {
        const tome = this.evaluateHand(selectedCards);
        if (!tome) return { tome: null, total: 0, chips: 0, mult: 0 };

        const lvlInfo = gameState.tomeLevels[tome.id] || { level: 1 };
        const levelBonusChips = (lvlInfo.level - 1) * tome.chipStep;
        const levelBonusMult = (lvlInfo.level - 1) * tome.multStep;

        let chips = tome.baseChips + levelBonusChips;
        let mult = tome.baseMult + levelBonusMult;

        // Bônus individuais acumulativos de cada componente físico
        selectedCards.forEach(card => {
            if (gameState.activeBoss && gameState.activeBoss.isCardDebuffed && gameState.activeBoss.isCardDebuffed(card)) {
                return;
            }

            chips += card.val;
            chips += (card.bonusChips || 0);
            mult += (card.bonusMult || 0);

            gameState.relics.forEach(relic => {
                if (relic.onCardScored) {
                    const res = relic.onCardScored(card);
                    if (res) {
                        chips += (res.chipsAdd || 0);
                        mult += (res.multAdd || 0);
                    }
                }
            });
        });

        // Efeitos de Relíquias avaliados DA ESQUERDA PARA A DIREITA (Relevância total de Ordem!)
        let multFactor = 1.0;
        for (let i = 0; i < gameState.relics.length; i++) {
            const relic = gameState.relics[i];
            
            // Sinergia posicional: Duplica o bônus do vizinho à esquerda
            if (relic.id === 'rel_neighbor_left' && i > 0) {
                const neighbor = gameState.relics[i - 1];
                if (neighbor.onScore) {
                    const nRes = neighbor.onScore({
                        tomeId: tome.id,
                        cards: selectedCards,
                        discardsLeft: gameState.discardsLeft,
                        handsLeft: gameState.handsLeft
                    });
                    if (nRes) {
                        chips += (nRes.chipsAdd || 0);
                        mult += (nRes.multAdd || 0);
                        multFactor *= (nRes.multFactor || 1);
                    }
                }
            }

            if (relic.onScore) {
                const res = relic.onScore({
                    tomeId: tome.id,
                    cards: selectedCards,
                    discardsLeft: gameState.discardsLeft,
                    handsLeft: gameState.handsLeft
                });
                if (res) {
                    chips += (res.chipsAdd || 0);
                    mult += (res.multAdd || 0);
                    multFactor *= (res.multFactor || 1);
                }
            }
        }

        // Bônus do Dado d20 ativo nesta mão
        if (gameState.tempDiceBonus) {
            chips += (gameState.tempDiceBonus.chips || 0);
            mult += (gameState.tempDiceBonus.mult || 0);
        }

        const finalMult = Math.floor(mult * multFactor);
        const total = chips * finalMult;

        return {
            tome,
            level: lvlInfo.level,
            chips,
            mult: finalMult,
            total
        };
    }
}
