import { extension_settings } from "../../../../extensions.js";
import { StyleConfig } from "../models/StyleConfig.js";

export class Settings {
    constructor() {
        this.defaultSettings = {
            enabled: true,
            defaultStyle: StyleConfig.createDefault().toJSON(),
            userStyle: null,
            systemStyle: null,
            characterStyles: {},
            templates: {}
        };

        // 初始化设置
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

    getUserStyle() {
        return this.settings.userStyle ? new StyleConfig(this.settings.userStyle) : this.getDefaultStyle();
    }

    getSystemStyle() {
        return this.settings.systemStyle ? new StyleConfig(this.settings.systemStyle) : this.getDefaultStyle();
    }

    getCharacterStyle(characterId) {
        return this.settings.characterStyles[characterId] 
            ? new StyleConfig(this.settings.characterStyles[characterId])
            : this.getDefaultStyle();
    }

    setCharacterStyle(characterId, style) {
        if (!(style instanceof StyleConfig)) {
            throw new Error('Invalid style configuration');
        }
        this.settings.characterStyles[characterId] = style.toJSON();
    }

    reset() {
        this.settings = structuredClone(this.defaultSettings);
        extension_settings.chat_stylist = this.settings;
    }
}
