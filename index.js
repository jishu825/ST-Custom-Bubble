// index.js

import { StyleManager } from './src/core/StyleManager.js';
import { EventManager } from './src/core/EventManager.js';
import { ColorManager } from './src/core/ColorManager.js';
import { extension_settings } from '../../../extensions.js';

const MODULE_NAME = 'chat-stylist';

// Initialize extension settings
if (!window.extension_settings[MODULE_NAME]) {
    window.extension_settings[MODULE_NAME] = {
        styles: {},
        defaultStyle: {
            background: {
                color: 'rgba(254, 222, 169, 0.5)',
                gradient: null
            },
            text: {
                main: 'rgba(208, 206, 196, 1)',
                italics: 'rgba(183, 160, 255, 1)',
                quote: 'rgba(224, 159, 254, 1)'
            },
            quoteEffects: {
                glow: {
                    enabled: false,
                    color: 'rgba(224, 159, 254, 0.8)',
                    intensity: 5
                }
            },
            padding: {
                top: 10,
                right: 15,
                bottom: 10,
                left: 15
            }
        }
    };
}

class ChatStylist {
    constructor() {
        this.styleManager = new StyleManager();
        this.eventManager = new EventManager();
        this.colorManager = new ColorManager();
        this.settings = extension_settings[MODULE_NAME];
    }

    async initialize() {
        // Load HTML template
        const response = await fetch(`/scripts/extensions/third-party/${MODULE_NAME}/chat-stylist.html`);
        const html = await response.text();
        document.body.insertAdjacentHTML('beforeend', html);

        // Initialize managers
        await this.styleManager.initialize();
        await this.eventManager.initialize();
        await this.colorManager.initialize();

        // Setup UI event listeners
        this.setupEventListeners();

        // Apply existing styles
        this.applyExistingStyles();
    }

    setupEventListeners() {
        // Style panel controls
        document.getElementById('save-style').addEventListener('click', () => this.saveCurrentStyle());
        document.getElementById('reset-style').addEventListener('click', () => this.resetStyle());
        document.getElementById('export-styles').addEventListener('click', () => this.exportStyles());
        document.getElementById('import-styles').addEventListener('click', () => this.importStyles());

        // Character selection
        document.getElementById('character-select').addEventListener('change', (e) => {
            this.styleManager.loadCharacterStyle(e.target.value);
        });
    }

    saveCurrentStyle() {
        const currentStyle = this.styleManager.getCurrentStyle();
        this.settings.styles[this.styleManager.getCurrentCharacter()] = currentStyle;
        this.saveSettings();
    }

    resetStyle() {
        this.styleManager.resetCurrentStyle();
    }

    exportStyles() {
        const styles = JSON.stringify(this.settings.styles, null, 2);
        const blob = new Blob([styles], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chat-styles.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }

    async importStyles() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            const text = await file.text();
            const styles = JSON.parse(text);
            
            this.settings.styles = styles;
            this.saveSettings();
            this.applyExistingStyles();
        };
        
        input.click();
    }

    applyExistingStyles() {
        Object.entries(this.settings.styles).forEach(([character, style]) => {
            this.styleManager.applyStyle(character, style);
        });
    }

    saveSettings() {
        extension_settings[MODULE_NAME] = this.settings;
        saveSettingsDebounced();
    }
}

// Initialize the extension
jQuery(async () => {
    const chatStylist = new ChatStylist();
    await chatStylist.initialize();
});
