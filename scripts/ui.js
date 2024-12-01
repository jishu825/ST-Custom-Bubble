// scripts/ui.js

// scripts/ui.js

function addCustomBubbleButton() {
    const customBubbleContainer = document.createElement('div');
    customBubbleContainer.className = 'flex-container alignItemsBaseline';
    customBubbleContainer.style.marginTop = '10px';

    const customBubbleButton = document.createElement('div');
    customBubbleButton.className = 'menu_button';
    customBubbleButton.style.display = 'flex';
    customBubbleButton.style.alignItems = 'center';
    customBubbleButton.style.gap = '5px';
    customBubbleButton.style.width = '100%';
    customBubbleButton.innerHTML = '<i class="fa-solid fa-palette"></i><span>气泡样式设置</span>';
    customBubbleButton.addEventListener('click', toggleSettingsPanel);

    customBubbleContainer.appendChild(customBubbleButton);

    const themeElements = document.querySelector('div[name="themeElements"]');
    const avatarAndChatDisplay = themeElements.querySelector('div[name="AvatarAndChatDisplay"]');
    avatarAndChatDisplay.insertAdjacentElement('afterend', customBubbleContainer);
}

export function initializeUI() {
    // Add the custom bubble button to the interface
    addCustomBubbleButton();

    // Add settings panel to page (initially hidden)
    document.body.insertAdjacentHTML('beforeend', settingsHtml);
    const settingsPanel = document.getElementById('bubble-style-settings');
    settingsPanel.style.display = 'none';

    // Initialize panel functionality
    setupPanelDragging();
    setupControlEvents();
    refreshCharacterSelect();
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
