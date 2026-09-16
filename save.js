// save.js - Sistema de Extração e Injeção de Memória (Save/Load)

document.addEventListener('DOMContentLoaded', () => {
    const btnNewGame = document.getElementById('btn-new-game');
    const btnLoadGame = document.getElementById('btn-load-game');
    const fileInput = document.getElementById('save-file-input');
    const btnSaveGame = document.getElementById('btn-save-game');

    // Binds do Menu Principal
    if (btnNewGame) {
        btnNewGame.addEventListener('click', startNewGame);
    }
    
    if (btnLoadGame && fileInput) {
        btnLoadGame.addEventListener('click', () => {
            fileInput.click();
        });
        fileInput.addEventListener('change', importSave);
    }

    // Bind do HUD Global
    if (btnSaveGame) {
        btnSaveGame.addEventListener('click', exportSave);
    }
});

function startNewGame() {
    const globalHud = document.getElementById('global-hud');
    if (globalHud) {
        globalHud.classList.remove('hidden');
    }
    switchScreen('map-screen');
    console.log("Novo ciclo iniciado.");
}

function exportSave() {
    const saveData = {
        hp: GameState.hp,
        maxHp: GameState.maxHp,
        currency: GameState.currency,
        deck: GameState.deck,
        bag: GameState.bag
    };

    const jsonStr = JSON.stringify(saveData);
    const encodedStr = btoa(jsonStr); 

    const blob = new Blob([encodedStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_integridade_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    
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
            const encodedStr = e.target.result;
            const jsonStr = atob(encodedStr);
            const saveData = JSON.parse(jsonStr);

            GameState.hp = saveData.hp;
            GameState.maxHp = saveData.maxHp;
            GameState.currency = saveData.currency;
            GameState.deck = saveData.deck || [];
            GameState.bag = saveData.bag || [];

            updateHUD();
            
            const globalHud = document.getElementById('global-hud');
            if (globalHud) {
                globalHud.classList.remove('hidden');
            }
            
            switchScreen('map-screen');
            alert("Memória injetada com sucesso. Retornando ao labirinto.");
            
            event.target.value = ''; 
            
        } catch (error) {
            alert("ARQUIVO CORROMPIDO. A Entidade rejeitou os dados fornecidos.");
            console.error("Falha na decodificação do save:", error);
        }
    };
    reader.readAsText(file);
}
