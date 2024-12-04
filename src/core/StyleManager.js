import { EventTypes } from "./EventManager.js";
import { debounce } from "../utils/EventUtils.js";

export class StyleManager {
    constructor(eventManager) {
        this.eventManager = eventManager;
        
        // 订阅相关事件
        this.subscribeToEvents();
    }

    subscribeToEvents() {
        // 监听角色添加事件
        this.eventManager.on(EventTypes.CHARACTER_ADDED, this.handleCharacterAdded.bind(this));
        
        // 监听样式变更事件
        this.eventManager.on(EventTypes.STYLE_CHANGED, this.handleStyleChanged.bind(this));
        
        // 监听设置重置事件
        this.eventManager.on(EventTypes.SETTINGS_RESET, this.handleSettingsReset.bind(this));
    }

    @debounce(300)
    handleStyleChanged(eventData) {
        const { characterId, style } = eventData;
        this.saveCharacterStyle(characterId, style);
        this.eventManager.emit(EventTypes.STYLE_APPLIED, { characterId, style });
    }

    @asyncHandler()
    async handleCharacterAdded(eventData) {
        const { characterId, element } = eventData;
        const style = this.getCharacterStyle(characterId);
        if (style) {
            await this.applyStyle(characterId, style);
        }
    }

    handleSettingsReset() {
        this.styleCache.clear();
        this.loadStyles();
        this.eventManager.emit(EventTypes.STYLE_RESET);
    }
}
