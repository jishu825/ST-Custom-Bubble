import { extension_settings } from "../../../../extensions.js";
import { StyleConfig } from "../models/StyleConfig.js";

export class Settings {
    constructor() {
        this.defaultSettings = {
            enabled: true,
            styles: {},
            defaultStyle: new StyleConfig().toJSON()
        };

        this.settings = extension_settings.chat_stylist || this.defaultSettings;
        extension_settings.chat_stylist = this.settings;
    }

    get enabled() {
        return this.settings.enabled;
    }

    set enabled(value) {
        this.settings.enabled = value;
    }

    getDefaultStyle() {
        return new StyleConfig(this.settings.defaultStyle);
    }

    setDefaultStyle(style) {
        if (!(style instanceof StyleConfig)) {
            throw new Error('Invalid style configuration');
        }
        this.settings.defaultStyle = style.toJSON();
    }

    reset() {
        this.settings = structuredClone(this.defaultSettings);
        extension_settings.chat_stylist = this.settings;
    }
}
