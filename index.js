// index.js
import { EventEmitter } from "./lib/eventemitter.js";
import { extension_settings } from "./extensions.js";

const extensionName = "custom-bubble-style";
const defaultSettings = {
    enabled: true,
    // Add other default settings here
};

// Initialize extension settings
if (!extension_settings[extensionName]) {
    extension_settings[extensionName] = {};
}

Object.assign(extension_settings[extensionName], defaultSettings);

// Add extension button to extensions menu
jQuery(async () => {
    const settingsHtml = await $.get(`scripts/extensions/third-party/st-custom-bubble/bubble-settings.html`);
    
    const extensionsDiv = $("#extensions_settings2");
    extensionsDiv.append(settingsHtml);

    $("#custom-bubble-button").on("click", function() {
        $("#bubble-style-settings").toggle();
    });

    // Initialize other extension functionality
    setupColorPickers();
    setupEffects();
});
