// scripts/ui.js


function addCustomBubbleButton() {
    try {
        const themeElements = document.querySelector('div[name="themeElements"]');
        if (!themeElements) {
            console.error('Theme elements container not found');
            return;
        }

        const avatarAndChatDisplay = themeElements.querySelector('div[name="AvatarAndChatDisplay"]');
        if (!avatarAndChatDisplay) {
            console.error('Avatar and chat display container not found');
            return;
        }

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
        avatarAndChatDisplay.insertAdjacentElement('afterend', customBubbleContainer);

        console.log('Custom bubble button added successfully');
    } catch (error) {
        console.error('Error adding custom bubble button:', error);
    }
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
