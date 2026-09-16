// MECÂNICA DO DADO D20: GIRA A CADA MÃO + SUPORTE A DADO DOURADO

class DiceRoller {
    static roll(sides = 20) {
        return Math.floor(Math.random() * sides) + 1;
    }

    static rollForNewHand(gameState) {
        const val = this.roll(20);
        let bonus = null;
        let message = "";

        // Se o dado for dourado, bonifica em dinheiro
        if (gameState.isDiceGolden && val >= 10) {
            gameState.gold += 2;
            message += "[DADO DOURADO: +$2 Frags] ";
        }

        if (val === 20) {
            bonus = { chips: 150, mult: 10 };
            message += "CRÍTICO NATURAL [20]! +150 Chips & +10 Mult nesta mão!";
        } else if (val === 1) {
            bonus = { chips: -40, mult: -2 };
            message += "FALHA CRÍTICA [1]! A magia colapsou (-40 Chips, -2 Mult)!";
        } else if (val >= 15) {
            bonus = { chips: 40, mult: 3 };
            message += `ROLAGEM ALTA [${val}]: O pulso respondeu (+40 Chips & +3 Mult).`;
        } else {
            bonus = { chips: val * 2, mult: 1 };
            message += `ROLAGEM [${val}]: Estabilização básica (+${val * 2} Chips).`;
        }

        gameState.tempDiceBonus = bonus;
        return { val, message };
    }
}
