// index.js

// Import required modules
import { initializeUI } from "./scripts/ui.js";
import { setupEffects } from "./scripts/effects.js";
import { initializeColorPickers } from "./scripts/colorPicker.js";
import { setupUtils } from "./scripts/utils.js";

// Wait for SillyTavern to be ready
window.addEventListener('load', () => {
    // Initialize extension when the app is ready
    const interval = setInterval(() => {
        const themeElements = document.querySelector('div[name="themeElements"]');
        if (themeElements) {
            clearInterval(interval);
            initializeExtension();
        }
    }, 100);
});

function initializeExtension() {
    setupUtils();
    initializeColorPickers();
    setupEffects();
    initializeUI();
}
