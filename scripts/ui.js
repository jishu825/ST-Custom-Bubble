// scripts/ui.js

export function initializeUI() {
    // Add the button after chat style selection and before theme colors
    const themeElements = document.querySelector('div[name="themeElements"]');
    const avatarAndChatDisplay = themeElements.querySelector('div[name="AvatarAndChatDisplay"]');
    
    // Create the button container
    const customBubbleContainer = document.createElement('div');
    customBubbleContainer.className = 'flex-container alignItemsBaseline';
    
    // Create the button
    const customBubbleButton = document.createElement('div');
    customBubbleButton.className = 'menu_button';
    customBubbleButton.innerHTML = '<i class="fa-solid fa-palette"></i> 气泡样式设置';
    customBubbleButton.addEventListener('click', toggleSettingsPanel);
    
    // Add info icon
    const infoIcon = document.createElement('div');
    infoIcon.className = 'fa-solid fa-circle-info opacity50p';
    infoIcon.title = '自定义聊天气泡的样式和特效';
    infoIcon.setAttribute('data-i18n', '[title]Customize chat bubble styles and effects');
    
    // Assemble the container
    customBubbleContainer.appendChild(customBubbleButton);
    customBubbleContainer.appendChild(infoIcon);
    
    // Insert after chat style selection
    avatarAndChatDisplay.insertAdjacentElement('afterend', customBubbleContainer);

    // Add settings panel to page (initially hidden)
    document.body.insertAdjacentHTML('beforeend', settingsHtml);
    const settingsPanel = document.getElementById('bubble-style-settings');
    settingsPanel.style.display = 'none';

    // Rest of the initialization code...
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
