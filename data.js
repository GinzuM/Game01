
{
"tomes": [
{
"id": "tome_001",
"name": "Página Euclidiana",
"description": "Rola 1xD4. O básico da sanidade matemática.",
"dice": "d4",
"baseMult": 1.0,
"effect": "none"
},
{
"id": "tome_002",
"name": "O Cântico de R'lyeh",
"description": "Rola 1xD12. Aumenta o multiplicador em x1.5 se jogado com outra carta cósmica.",
"dice": "d12",
"baseMult": 1.5,
"effect": "synergy_cosmic"
},
{
"id": "tome_003",
"name": "Relatório SCP-079",
"description": "Rola 1xD8. Puxa +2 cartas para a mão imediatamente após a rolagem.",
"dice": "d8",
"baseMult": 1.2,
"effect": "draw_2"
},
{
"id": "tome_004",
"name": "O Coração Delator",
"description": "Rola 2xD6. Se você não tomar dano na esquiva, dobra o resultado dos dados.",
"dice": "2d6",
"baseMult": 2.0,
"effect": "flawless_double"
},
{
"id": "tome_005",
"name": "Grimório de Carne",
"description": "Rola 1xD20. Custa 5% da sua integridade para ser jogado.",
"dice": "d20",
"baseMult": 3.0,
"effect": "self_damage_5"
}
 ],
"implants": [
{
"id": "imp_001",
"name": "O Dado de Carne",
"type": "joker",
"description": "Sempre que rolar um D8, drena 5% de HP, mas o resultado sempre será 8.",
"mechanic": "max_d8_blood"
},
{
"id": "imp_002",
"name": "Engrenagem Profana",
"type": "joker",
"description": "Tomar dano na fase de esquiva adiciona automaticamente um D4 extra no seu ritual.",
"mechanic": "damage_adds_d4"
},
{
"id": "imp_003",
"name": "Parasita do Fim dos Deuses",
"type": "joker",
"description": "Reduz o espaço de esquiva pela metade, mas todos os dados recebem x3 de multiplicador.",
"mechanic": "shrink_arena_mult_3"
},
{
"id": "imp_004",
"name": "Terceiro Braço Necrótico",
"type": "joker",
"description": "Adiciona 1xD20 grátis a cada ritual. Causa estática/glitch visual na tela de esquiva.",
"mechanic": "free_d20_glitch"
},
{
"id": "imp_005",
"name": "Familiar 'Ravena'",
"type": "joker",
"description": "Orbita o cursor absorvendo até 3 projéteis. Se quebrar, vomita ácido na sua arena.",
"mechanic": "shield_3_acid_penalty"
},
{
"id": "imp_006",
"name": "Triforce de Silício",
"type": "secret",
"description": "Secreto: Divide o cálculo de dano final em três instâncias simultâneas (Acerto Triplo).",
"mechanic": "triple_hit_calc"
}
 ],
"bosses": [
{
"id": "boss_001",
"name": "AM (O Ódio Absoluto)",
"hp": 250,
"bulletDensity": "high",
"bulletSpeed": "fast",
"mechanic": "invert_controls_at_30_hp",
"theme": "i_have_no_mouth"
},
{
"id": "boss_002",
"name": "SCP-682 (O Réptil)",
"hp": 500,
"bulletDensity": "medium",
"bulletSpeed": "slow",
"mechanic": "adapt_immunity",
"theme": "scp_foundation"
}
 ],
"events": [
{
"id": "evt_001",
"title": "A Máquina de Triturar Cartas",
"description": "Uma fenda dimensional emite um zumbido mecânico. Ela exige dados em troca de modificações corporais.",
"choices": [
{
"text": "Sacrificar 1 Tomo Aleatório",
"rewardType": "currency",
"rewardValue": 50,
"cost": "lose_1_card"
},
{
"text": "Inserir o Próprio Braço (-15% Integridade)",
"rewardType": "implant",
"rewardValue": "random_joker",
"cost": "hp_15"
},
{
"text": "Ignorar (Sair)",
"rewardType": "none",
"cost": "none"
}
]
},
{
"id": "evt_002",
"title": "A Esfinge de Código Aberto",
"description": "Um terminal antigo pisca no escuro. 'Para prosseguir, sacrifique 3 cartas de matemática básica, ou sofra a corrupção.'",
"choices": [
{
"text": "Sacrificar 3 Cartas (D4)",
"rewardType": "upgrade",
"rewardValue": "base_mult_up",
"cost": "lose_3_specific"
},
{
"text": "Recusar e Lutar",
"rewardType": "combat",
"rewardValue": "elite_enemy",
"cost": "none"
}
]
}
]
}

