// settings.js - Motor de Configurações, Escala GUI e Suporte Mobile

document.addEventListener('DOMContentLoaded', () => {
// Referências dos Modais
const settingsModal = document.getElementById('settings-modal');

// Binds de Abertura/Fechamento
document.getElementById('btn-open-settings-menu').addEventListener('click', () => settingsModal.classList.remove('hidden'));
document.getElementById('btn-open-settings-hud').addEventListener('click', () => settingsModal.classList.remove('hidden'));
document.getElementById('close-settings').addEventListener('click', () => settingsModal.classList.add('hidden'));

// Binds do Toggle Mobile
const btnMobile = document.getElementById('btn-toggle-mobile');
btnMobile.addEventListener('click', () => {
SettingsState.mobileMode = !SettingsState.mobileMode;
btnMobile.innerText = SettingsState.mobileMode ? "Modo Celular: ATIVADO" : "Ativar Modo Celular";
btnMobile.style.borderColor = SettingsState.mobileMode ? "var(--flesh-red)" : "var(--corrupt-green)";

const controls = document.getElementById('mobile-controls');
if (SettingsState.mobileMode) {
controls.classList.remove('hidden');
} else {
controls.classList.add('hidden');
}
});

// Binds dos Sliders (Atualização em tempo real)
document.getElementById('range-vol').addEventListener('input', (e) => {
SettingsState.volume = e.target.value;
document.getElementById('val-vol').innerText = SettingsState.volume;
// Futuro hook de áudio (AudioContext)
});

document.getElementById('range-gui').addEventListener('input', (e) => {
SettingsState.guiScale = parseFloat(e.target.value);
document.getElementById('val-gui').innerText = SettingsState.guiScale.toFixed(1);
document.documentElement.style.setProperty('--gui-scale', SettingsState.guiScale);
});

document.getElementById('range-sens').addEventListener('input', (e) => {
SettingsState.sens = parseFloat(e.target.value);
document.getElementById('val-sens').innerText = SettingsState.sens.toFixed(1);
});

document.getElementById('range-ctrl').addEventListener('input', (e) => {
SettingsState.ctrlScale = parseFloat(e.target.value);
document.getElementById('val-ctrl').innerText = SettingsState.ctrlScale.toFixed(1);
document.documentElement.style.setProperty('--ctrl-scale', SettingsState.ctrlScale);
});
});

