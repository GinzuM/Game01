// GERENCIADOR DE IMPLANTES E CONSUMÍVEIS

class RelicManager {
    static addRelic(gameState, relic) {
        if (gameState.relics.length >= gameState.maxRelics) return false;
        const newRel = { ...relic };
        gameState.relics.push(newRel);
        if (newRel.onEquip) newRel.onEquip(gameState);
        return true;
    }

    static removeRelic(gameState, index) {
        if (index >= 0 && index < gameState.relics.length) {
            const removed = gameState.relics.splice(index, 1)[0];
            if (removed.onUnequip) removed.onUnequip(gameState);
            return true;
        }
        return false;
    }

    static addConsumable(gameState, item) {
        if (gameState.consumables.length >= gameState.maxConsumables) return false;
        gameState.consumables.push({ ...item });
        return true;
    }

    static useConsumable(gameState, index, selectedCards) {
        const item = gameState.consumables[index];
        if (!item) return false;

        const success = item.execute(selectedCards, gameState);
        if (success) {
            gameState.consumables.splice(index, 1);
            return true;
        }
        return false;
    }
}
