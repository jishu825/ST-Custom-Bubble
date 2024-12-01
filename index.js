import { initializeUI } from "./scripts/ui.js";
import { setupEffects } from "./scripts/effects.js";
import { initializeColorPickers } from "./scripts/colorPicker.js";
import { setupUtils } from "./scripts/utils.js";

(function() {
    setupUtils();
    initializeColorPickers();
    setupEffects();
    initializeUI();
})();
