// scripts/ui.js

export function initializeUI() {
    // Add button to the extension settings area
    const extensionSettings = document.getElementById('extensions_settings');
    const settingsButton = document.createElement('div');
    settingsButton.className = 'custom-bubble-settings-button menu_button';
    settingsButton.innerHTML = 'Custom Bubble Settings';
    settingsButton.addEventListener('click', toggleSettingsPanel);
    extensionSettings.appendChild(settingsButton);

    // Add settings panel to page (initially hidden)
    document.body.insertAdjacentHTML('beforeend', settingsHtml);
    const settingsPanel = document.getElementById('bubble-style-settings');
    settingsPanel.style.display = 'none';

    // Rest of the initialization code...
}

function toggleSettingsPanel() {
    const settingsPanel = document.getElementById('bubble-style-settings');
    settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
}

export const settingsHtml = `[Previous HTML template code]`;

export function initializeUI() {
    // Add settings panel to page
    document.body.insertAdjacentHTML('beforeend', settingsHtml);
    
    // Setup panel dragging
    setupPanelDragging();
    
    // Initialize controls
    setupControlEvents();
    
    // Refresh character selection
    refreshCharacterSelect();
}

function setupPanelDragging() {
    // [Previous panel dragging code]
}

function setupControlEvents() {
    // [Previous control events setup code]
}

function refreshCharacterSelect() {
    // [Previous character select refresh code]
}

// [Other UI-related functions]
