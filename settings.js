// settings.js - Motor de Configurações, Escala GUI e Suporte Mobile

document.addEventListener('DOMContentLoaded', () => {
    // Referências dos Modais e Botões
    const settingsModal = document.getElementById('settings-modal');
    const btnOpenSettingsMenu = document.getElementById('btn-open-settings-menu');
    const btnOpenSettingsHud = document.getElementById('btn-open-settings-hud');
    const btnCloseSettings = document.getElementById('close-settings');
    const btnToggleMobile = document.getElementById('btn-toggle-mobile');
    
    // Binds de Abertura/Fechamento (Ativáveis tanto pelo Menu quanto pelo HUD)
    if (btnOpenSettingsMenu) {
        btnOpenSettingsMenu.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    }
    if (btnOpenSettingsHud) {
        btnOpenSettingsHud.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    }
    if (btnCloseSettings) {
        btnCloseSettings.addEventListener('click', () => settingsModal.classList.add('hidden'));
    }

    // Bind do Toggle Mobile
    if (btnToggleMobile) {
        btnToggleMobile.addEventListener('click', () => {
            SettingsState.mobileMode = !SettingsState.mobileMode;
            btnToggleMobile.innerText = SettingsState.mobileMode ? "Modo Celular: ATIVADO" : "Ativar Modo Celular";
            
            // Troca o estilo do botão para indicar estado
            if (SettingsState.mobileMode) {
                btnToggleMobile.classList.remove('btn-outline');
                btnToggleMobile.classList.add('btn-green');
                btnToggleMobile.style.backgroundColor = "var(--metal-gray)";
            } else {
                btnToggleMobile.classList.remove('btn-green');
                btnToggleMobile.classList.add('btn-outline');
                btnToggleMobile.style.backgroundColor = "transparent";
            }
            
            // Exibe ou oculta os controles sobre o canvas de combate
            const controls = document.getElementById('mobile-controls');
            if (controls) {
                if (SettingsState.mobileMode) {
                    controls.classList.remove('hidden');
                } else {
                    controls.classList.add('hidden');
                }
            }
        });
    }

    // Binds dos Sliders (Atualização em tempo real e alteração de Variáveis CSS)
    const rangeVol = document.getElementById('range-vol');
    if (rangeVol) {
        rangeVol.addEventListener('input', (e) => {
            SettingsState.volume = e.target.value;
            document.getElementById('val-vol').innerText = SettingsState.volume;
        });
    }

    const rangeGui = document.getElementById('range-gui');
    if (rangeGui) {
        rangeGui.addEventListener('input', (e) => {
            SettingsState.guiScale = parseFloat(e.target.value);
            document.getElementById('val-gui').innerText = SettingsState.guiScale.toFixed(1);
            // Aplica a escala na raiz do CSS (--gui-scale)
            document.documentElement.style.setProperty('--gui-scale', SettingsState.guiScale);
        });
    }

    const rangeSens = document.getElementById('range-sens');
    if (rangeSens) {
        rangeSens.addEventListener('input', (e) => {
            SettingsState.sens = parseFloat(e.target.value);
            document.getElementById('val-sens').innerText = SettingsState.sens.toFixed(1);
        });
    }

    const rangeCtrl = document.getElementById('range-ctrl');
    if (rangeCtrl) {
        rangeCtrl.addEventListener('input', (e) => {
            SettingsState.ctrlScale = parseFloat(e.target.value);
            document.getElementById('val-ctrl').innerText = SettingsState.ctrlScale.toFixed(1);
            // Aplica a escala na raiz do CSS (--ctrl-scale)
            document.documentElement.style.setProperty('--ctrl-scale', SettingsState.ctrlScale);
        });
    }
});
