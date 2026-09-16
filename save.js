// save.js - Sistema de Extração e Injeção de Memória (Save/Load)

document.addEventListener('DOMContentLoaded', () => {
// Binds do Menu Principal
document.getElementById('btn-new-game').addEventListener('click', startNewGame);

const loadBtn = document.getElementById('btn-load-game');
const fileInput = document.getElementById('save-file-input');

loadBtn.addEventListener('click', () => {
fileInput.click(); // Aciona o input de arquivo oculto
});

fileInput.addEventListener('change', importSave);

// Bind do Botão de Salvar no HUD
const saveBtn = document.getElementById('btn-save-game');
if (saveBtn) saveBtn.addEventListener('click', exportSave);
});

function startNewGame() {
// Revela o HUD e muda para o mapa
document.getElementById('global-hud').classList.remove('hidden');
switchScreen('map-screen');
console.log("Novo ciclo iniciado.");
}

function exportSave() {
// Extraímos apenas os dados dinâmicos do jogador, ignorando o banco de dados procedural
const saveData = {
hp: GameState.hp,
maxHp: GameState.maxHp,
currency: GameState.currency,
deck: GameState.deck,
bag: GameState.bag
};

// Converte para JSON e depois codifica em Base64 para estética de "código de máquina"
const jsonStr = JSON.stringify(saveData);
const encodedStr = btoa(jsonStr);

// Cria o arquivo virtual
const blob = new Blob([encodedStr], { type: 'text/plain' });
const url = URL.createObjectURL(blob);

// Força o download
const a = document.createElement('a');
a.href = url;
a.download = backup_integridade_${Date.now()}.txt;
document.body.appendChild(a);
a.click();

// Limpeza
document.body.removeChild(a);
URL.revokeObjectURL(url);

alert("Backup de Integridade extraído para o seu disco local.");
}

function importSave(event) {
const file = event.target.files[0];
if (!file) return;

const reader = new FileReader();
reader.onload = function(e) {
try {
// Decodifica o Base64 de volta para JSON
const encodedStr = e.target.result;
const jsonStr = atob(encodedStr);
const saveData = JSON.parse(jsonStr);

// Substitui o estado atual do jogo pela memória salva
GameState.hp = saveData.hp;
GameState.maxHp = saveData.maxHp;
GameState.currency = saveData.currency;
GameState.deck = saveData.deck || [];
GameState.bag = saveData.bag || [];

// Reinicializa a interface
updateHUD();
document.getElementById('global-hud').classList.remove('hidden');
switchScreen('map-screen');

alert("Memória injetada com sucesso. Retornando ao labirinto.");

// Limpa o input para permitir carregar o mesmo arquivo novamente
event.target.value = '';

} catch (error) {
alert("ARQUIVO CORROMPIDO. A Entidade rejeitou os dados fornecidos.");
console.error("Falha na decodificação do save:", error);
}
};
reader.readAsText(file);
}

