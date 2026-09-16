// LOJA DE SUCATA COM REESTOQUE AUTOMÁTICO

class ShopManager {
    static generateFreshStock(gameState) {
        const stock = [];
        
        // Relíquias disponíveis
        const availableRelics = RELIC_CATALOG.filter(r => !gameState.relics.some(owned => owned.id === r.id));
        const shuffledRelics = DeckManager.shuffle(availableRelics);
        if (shuffledRelics.length > 0) stock.push({ ...shuffledRelics[0], category: 'relic', sold: false });
        if (shuffledRelics.length > 1) stock.push({ ...shuffledRelics[1], category: 'relic', sold: false });

        // Rituais e Glifos
        const shuffledCons = DeckManager.shuffle(CONSUMABLE_CATALOG);
        if (shuffledCons.length > 0) stock.push({ ...shuffledCons[0], category: 'consumable', sold: false });
        if (shuffledCons.length > 1) stock.push({ ...shuffledCons[1], category: 'consumable', sold: false });

        return stock;
    }

    static generatePackStock() {
        return [
            {
                id: 'pack_bio',
                name: 'Lote de Espécimes Mortos',
                cost: 4,
                desc: 'Adiciona 3 peças aleatórias de Ratos ou Sapos ao Códice.',
                category: 'pack',
                icon: '☣️',
                sold: false
            },
            {
                id: 'pack_tech',
                name: 'Lote de Memória & Mídia',
                cost: 4,
                desc: 'Adiciona 3 módulos de RAM ou Disquetes magnéticos ao Códice.',
                category: 'pack',
                icon: '💾',
                sold: false
            }
        ];
    }
}
