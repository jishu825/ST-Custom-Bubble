// scripts/colorPicker.js

export function initializeColorPickers() {
    setupColorPickers();
    setupColorEvents();
}

function setupColorPickers() {
    const colorPickers = [
        'bubble-background-picker',
        'border-color-picker',
        'main-text-color-picker',
        'italics-text-color-picker',
        'quote-text-color-picker',
        'decoration-color-picker'
    ];

    colorPickers.forEach(id => {
        const picker = document.getElementById(id);
        if (picker) {
            picker.addEventListener('change', updateBubbleStyles);
        }
    });
}

function setupColorEvents() {
    // Setup color-related event listeners
    const rangeInputs = [
        'border-width',
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left',
        'decoration-intensity',
        'quote-glow-intensity'
    ];

    rangeInputs.forEach(id => {
        const range = document.getElementById(id);
        if (range) {
            range.addEventListener('input', () => {
                updateRangeValue(id);
                updateBubbleStyles();
            });
        }
    });
}

export function updateBubbleStyles() {
    if (!currentAuthorUid) return;
    
    document.querySelectorAll(".mes").forEach(message => {
        const author = getMessageAuthor(message);
        if (author && author.uid === currentAuthorUid) {
            updateMessageStyles(message);
        }
    });
}

function updateMessageStyles(message) {
    const mesBlock = message.querySelector(".mes_block");
    const mesText = message.querySelector(".mes_text");
    if (!mesBlock || !mesText) return;

    updateBackgroundStyles(mesBlock);
    updateBorderStyles(mesBlock);
    updatePaddingStyles(mesText);
    updateTextStyles(mesText);
}

// [Additional color-related utility functions]
