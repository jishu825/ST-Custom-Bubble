// scripts/utils.js

// Default settings
export const defaultSettings = {
    background: {
        color: '#946D49',
        opacity: 1
    },
    border: {
        color: '#946D49',
        width: 1
    },
    text: {
        main: '#D0CEC4',
        italics: '#5FB4B4',
        quote: '#6699CC'
    },
    padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    },
    decoration: {
        type: 'none',
        color: '#946D49',
        intensity: 5
    },
    quoteGlow: {
        enabled: false,
        intensity: 5
    }
};

// Settings management
export function saveCurrentStyle() {
    if (!currentAuthorUid) {
        alert('请先选择一个角色！');
        return;
    }

    const style = collectCurrentStyles();
    saveStyleToSettings(style);
    alert('样式已保存！');
}

export function resetStyle() {
    if (!currentAuthorUid) {
        alert('请先选择一个角色！');
        return;
    }

    if (confirm('确定要重置当前角色的所有样式设置吗？')) {
        loadStyleToControls(defaultSettings);
        updateBubbleStyles();
    }
}

export function loadStyleToControls(style) {
    setColorPickerValues(style);
    setRangeValues(style);
    setCheckboxValues(style);
    updateRangeDisplayValues();
}

export function getMessageAuthor(message) {
    const avatarImg = message.querySelector(".mesAvatarWrapper > .avatar > img");
    if (!avatarImg) return null;

    const avatarSrc = avatarImg.getAttribute("src");
    const isUser = message.getAttribute("is_user") === "true";

    const nameElem = message.querySelector(".name_text");
    let characterName = nameElem ? nameElem.textContent.trim() : null;

    if (!characterName || characterName === "${characterName}" || characterName === "undefined") {
        return null;
    }

    return formatAuthorData(isUser, characterName, avatarSrc);
}

// Helper functions
function collectCurrentStyles() {
    return {
        background: {
            color: document.getElementById('bubble-background-picker').color
        },
        border: {
            color: document.getElementById('border-color-picker').color,
            width: parseInt(document.getElementById('border-width').value)
        },
        text: {
            main: document.getElementById('main-text-color-picker').color,
            italics: document.getElementById('italics-text-color-picker').color,
            quote: document.getElementById('quote-text-color-picker').color
        },
        padding: collectPaddingValues(),
        decoration: collectDecorationValues(),
        quoteGlow: collectQuoteGlowValues()
    };
}

function saveStyleToSettings(style) {
    if (!window.extension_settings[extensionName]) {
        window.extension_settings[extensionName] = {};
    }
    if (!window.extension_settings[extensionName].styles) {
        window.extension_settings[extensionName].styles = {};
    }
    
    window.extension_settings[extensionName].styles[currentAuthorUid] = style;

    if (window.saveSettingsDebounced) {
        window.saveSettingsDebounced();
    }
}

function formatAuthorData(isUser, characterName, avatarSrc) {
    const charType = isUser ? "persona" : "character";
    let avatarFileName = avatarSrc.split("/").pop();
    
    if (!isUser) {
        const match = avatarFileName.match(/\?type=avatar&file=(.*)/i);
        avatarFileName = match ? decodeURIComponent(match[1]) : avatarFileName;
    }

    return {
        type: charType,
        name: characterName,
        avatarName: avatarFileName,
        uid: `${charType}|${avatarFileName}`
    };
}

function updateRangeDisplayValues() {
    const rangeIds = [
        'border-width', 
        'padding-top', 
        'padding-right', 
        'padding-bottom', 
        'padding-left',
        'decoration-intensity', 
        'quote-glow-intensity'
    ];
    
    rangeIds.forEach(updateRangeValue);
}

export function updateRangeValue(rangeId) {
    const range = document.getElementById(rangeId);
    const value = document.getElementById(`${rangeId}-value`);
    if (range && value) {
        value.textContent = `${range.value}px`;
    }
}
