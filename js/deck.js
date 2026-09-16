// GERAÇÃO ESTRUTURADA DE EXATAMENTE 50 COMPONENTES FÍSICOS

class DeckManager {
    static generateUID() {
        return 'comp_' + Math.random().toString(36).substr(2, 9);
    }

    // Cria o Códice Perfeito com 50 Peças:
    // 5 Reinos x 10 Valores Contíguos: A(14), 2, 3, 4, 5, 6, 7, 8, 9, 10
    // Isso garante Straights (Sequências) e Flushes matematicamente perfeitos!
    static createStarterDeck() {
        const suits = ['roedor', 'anfibio', 'ram', 'disquete', 'lapide'];
        const deck = [];

        suits.forEach(suit => {
            // Valores de 2 a 10 + Ás (14) = 10 cartas por reino
            const values = [14, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            values.forEach(val => {
                deck.push({
                    uid: this.generateUID(),
                    suit: suit,
                    val: val,
                    bonusChips: 0,
                    bonusMult: 0,
                    foil: false,
                    dourado: false
                });
            });
        });

        return this.shuffle(deck); // 5 x 10 = 50 cartas exatas!
    }

    static shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    static getCardDisplayValue(val) {
        if (val === 14) return 'A';
        return val.toString();
    }
}
