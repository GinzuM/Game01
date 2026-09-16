// ARQUIVO CENTRAL DE DADOS V3: 5 REINOS FÍSICOS E CÁLCULOS MATEMÁTICOS PRECISOS

// 5 REINOS COM MODELAGEM REAL
const SUITS = {
    roedor: {
        id: "roedor",
        name: "Carcaça de Rato",
        icon: "🐀",
        desc: "Rato morto com cicatriz gravada no dorso."
    },
    anfibio: {
        id: "anfibio",
        name: "Sapo em Formol",
        icon: "🐸",
        desc: "Anfíbio rígido com inscrição fúnebre no ventre."
    },
    ram: {
        id: "ram",
        name: "Pente de Memória RAM",
        icon: "💾",
        desc: "Placa PCB verde com chips de silício e trilho dourado."
    },
    disquete: {
        id: "disquete",
        name: "Disquete Retrô 3.5",
        icon: "📼",
        desc: "Mídia magnética cinza com janela metálica."
    },
    lapide: {
        id: "lapide",
        name: "Lápide Fúnebre",
        icon: "🪦",
        desc: "Pedra sepulcral com cruz de sangue e número entalhado."
    }
};

// GRIMÓRIO DE TOMOS
const SPELL_TOMES = {
    SINGLE: {
        id: "SINGLE",
        name: "Componente Isolado",
        baseChips: 5,
        baseMult: 1,
        chipStep: 10,
        multStep: 1,
        desc: "Um único componente canalizado no vácuo."
    },
    PAIR: {
        id: "PAIR",
        name: "Sussurro Duplo",
        baseChips: 10,
        baseMult: 2,
        chipStep: 15,
        multStep: 1,
        desc: "Dois componentes com o mesmo valor rúnico."
    },
    TWO_PAIR: {
        id: "TWO_PAIR",
        name: "Dupla Ressonância",
        baseChips: 20,
        baseMult: 2,
        chipStep: 20,
        multStep: 1,
        desc: "Dois pares distintos de componentes idênticos."
    },
    THREE_OF_A_KIND: {
        id: "THREE_OF_A_KIND",
        name: "Pacto Tríplice",
        baseChips: 30,
        baseMult: 3,
        chipStep: 20,
        multStep: 2,
        desc: "Três componentes portando o mesmo valor."
    },
    STRAIGHT: {
        id: "STRAIGHT",
        name: "Sequência Proibida",
        baseChips: 35,
        baseMult: 4,
        chipStep: 25,
        multStep: 2,
        desc: "5 componentes em sequência numérica consecutiva (ex: A,2,3,4,5)."
    },
    FLUSH: {
        id: "FLUSH",
        name: "Invocação Incidiosa",
        baseChips: 35,
        baseMult: 4,
        chipStep: 25,
        multStep: 2,
        desc: "5 componentes do mesmo Reino (ex: 5 Ratos ou 5 pentes de RAM)."
    },
    FULL_HOUSE: {
        id: "FULL_HOUSE",
        name: "Círculo Oculto",
        baseChips: 40,
        baseMult: 4,
        chipStep: 25,
        multStep: 2,
        desc: "Um Pacto Tríplice somado a um Sussurro Duplo."
    },
    FOUR_OF_A_KIND: {
        id: "FOUR_OF_A_KIND",
        name: "Tetralogia Macabra",
        baseChips: 60,
        baseMult: 7,
        chipStep: 30,
        multStep: 3,
        desc: "Quatro componentes de valor idêntico."
    },
    STRAIGHT_FLUSH: {
        id: "STRAIGHT_FLUSH",
        name: "Apocalipse Cíclico",
        baseChips: 100,
        baseMult: 8,
        chipStep: 40,
        multStep: 4,
        desc: "5 componentes em sequência numérica do mesmo Reino."
    }
};

// IMPLANTES BIO-CIBERNÉTICOS (CORINGAS) COM SINERGIAS POSICIONAIS
const RELIC_CATALOG = [
    {
        id: "rel_eye",
        name: "Olho Bicameral Protético",
        icon: "🧿",
        cost: 4,
        desc: "+4 Mult garantido em cada conjuração.",
        onScore: (ctx) => ({ multAdd: 4, chipsAdd: 0, multFactor: 1 })
    },
    {
        id: "rel_bio_engine",
        name: "Reator de Vísceras Podres",
        icon: "🫀",
        cost: 6,
        desc: "Ratos e Sapos concedem +25 Chips cada ao pontuar.",
        onCardScored: (card) => {
            if (card.suit === 'roedor' || card.suit === 'anfibio') {
                return { chipsAdd: 25, multAdd: 0 };
            }
            return null;
        }
    },
    {
        id: "rel_silicon_brain",
        name: "Processador Quântico Neomorto",
        icon: "🧠",
        cost: 7,
        desc: "Módulos de RAM e Disquetes concedem +2 Mult cada.",
        onCardScored: (card) => {
            if (card.suit === 'ram' || card.suit === 'disquete') {
                return { chipsAdd: 0, multAdd: 2 };
            }
            return null;
        }
    },
    {
        id: "rel_neighbor_left",
        name: "Condensador Sináptico Esquerdo",
        icon: "🔋",
        cost: 6,
        desc: "Duplica o multiplicador do Implante posicionado imediatamente à sua ESQUERDA!",
        isPositional: true
    },
    {
        id: "rel_toxic_valve",
        name: "Válvula de Formol Puro",
        icon: "🧪",
        cost: 8,
        desc: "X1.75 Mult se o Tomo for 'Invocação Incidiosa' (Flush).",
        onScore: (ctx) => {
            if (ctx.tomeId === 'FLUSH' || ctx.tomeId === 'STRAIGHT_FLUSH') {
                return { chipsAdd: 0, multAdd: 0, multFactor: 1.75 };
            }
            return null;
        }
    },
    {
        id: "rel_golden_die_mod",
        name: "Acoplador Dourado de Poliedro",
        icon: "🎲",
        cost: 7,
        desc: "Transforma o Dado d20 em DOURADO: todo número rolado acima de 10 concede +$2 Frags imediatos!",
        onEquip: (gameState) => { gameState.isDiceGolden = true; },
        onUnequip: (gameState) => { gameState.isDiceGolden = false; }
    }
];

// RITUAIS & GLIFOS
const CONSUMABLE_CATALOG = [
    {
        id: "rit_foil_plating",
        name: "Ritual: Banho Cromado",
        type: "ritual",
        icon: "✨",
        cost: 3,
        desc: "Aplica [FOIL] no componente (+50 Chips). Acumula com tudo!",
        execute: (selectedCards, gameState) => {
            if (selectedCards.length === 1) {
                selectedCards[0].foil = true;
                selectedCards[0].bonusChips = (selectedCards[0].bonusChips || 0) + 50;
                return true;
            }
            return false;
        }
    },
    {
        id: "rit_golden_touch",
        name: "Ritual: Infusão Dourada",
        type: "ritual",
        icon: "👑",
        cost: 4,
        desc: "Aplica [DOURADO] no componente (+3 Mult e gera +$1 Frag sempre que pontuar).",
        execute: (selectedCards, gameState) => {
            if (selectedCards.length === 1) {
                selectedCards[0].dourado = true;
                selectedCards[0].bonusMult = (selectedCards[0].bonusMult || 0) + 3;
                return true;
            }
            return false;
        }
    },
    {
        id: "rit_convert_ram",
        name: "Ritual: Solda de Silício",
        type: "ritual",
        icon: "💾",
        cost: 3,
        desc: "Converte até 2 componentes selecionados em Pentes de Memória RAM.",
        execute: (selectedCards, gameState) => {
            if (selectedCards.length > 0 && selectedCards.length <= 2) {
                selectedCards.forEach(c => c.suit = 'ram');
                return true;
            }
            return false;
        }
    },
    {
        id: "gly_pair",
        name: "Glifo: Sussurro Primordial",
        type: "glyph",
        icon: "🌘",
        cost: 3,
        desc: "Evolui Sussurro Duplo (Par): +15 Chips e +1 Mult para sempre.",
        execute: (selectedCards, gameState) => {
            gameState.tomeLevels['PAIR'].level += 1;
            return true;
        }
    },
    {
        id: "gly_straight",
        name: "Glifo: Linha Temporal Proibida",
        type: "glyph",
        icon: "⏳",
        cost: 3,
        desc: "Evolui Sequência Proibida (Straight): +25 Chips e +2 Mult.",
        execute: (selectedCards, gameState) => {
            gameState.tomeLevels['STRAIGHT'].level += 1;
            return true;
        }
    }
];

// ESTIGMAS DE SKIP
const STIGMA_DATABASE = [
    {
        name: "Pacto de Avareza",
        desc: "Ganhe +16 Frags imediatos, mas perca 1 Descarte neste setor.",
        apply: (gameState) => {
            gameState.gold += 16;
            gameState.permanentDiscardPenalty = (gameState.permanentDiscardPenalty || 0) + 1;
        }
    },
    {
        name: "Sobrecarga de Silício",
        desc: "Ganha 1 Implante gratuito, mas o próximo Chefe requer +25% de pontos.",
        apply: (gameState) => {
            const rel = RELIC_CATALOG[Math.floor(Math.random() * RELIC_CATALOG.length)];
            RelicManager.addRelic(gameState, rel);
            gameState.bossMultiplier = (gameState.bossMultiplier || 1.0) * 1.25;
        }
    },
    {
        name: "Comunhão dos Ratos",
        desc: "Receba +10 Frags e eleva o nível do Sussurro Duplo (Par) em +1.",
        apply: (gameState) => {
            gameState.gold += 10;
            gameState.tomeLevels['PAIR'].level += 1;
        }
    }
];

// CHEFES E MALDIÇÕES
const BOSS_AFFLICTIONS = [
    {
        id: "boss_no_rodent",
        name: "Exterminador de Roedores",
        desc: "Todas as Carcaças de Rato são desativadas nesta batalha.",
        isCardDebuffed: (card) => card.suit === 'roedor'
    },
    {
        id: "boss_emp",
        name: "Pulso Eletromagnético Profano",
        desc: "Toda Memória RAM e Disquetes perdem o poder nesta batalha.",
        isCardDebuffed: (card) => card.suit === 'ram' || card.suit === 'disquete'
    },
    {
        id: "boss_strangle",
        name: "Asfixia Biomecânica",
        desc: "Você começa esta batalha com apenas 1 Descarte.",
        onInitRound: (gameState) => {
            gameState.discardsLeft = 1;
        }
    }
];
