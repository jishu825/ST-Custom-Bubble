// index.js
import { EventManager } from './src/core/EventManager.js';
import { StyleManager } from './src/core/StyleManager.js';
import { UIManager } from './src/ui/UIManager.js';
import { Settings } from './src/core/Settings.js';

class ChatStylist {
    constructor() {
        this.eventManager = new EventManager();
        this.settings = new Settings();
        this.styleManager = new StyleManager(this.eventManager);
        this.uiManager = new UIManager(this.eventManager);
        
        this.initialize();
    }

    initialize() {
        // 注册全局事件处理
        this.registerEventHandlers();
        
        // 加载保存的样式
        this.loadSavedStyles();
        
        // 应用初始样式
        this.applyInitialStyles();
    }

    registerEventHandlers() {
        // 样式变更处理
        this.eventManager.on(EventTypes.UI_COLOR_CHANGED, (data) => {
            const { id, color, alpha } = data;
            const currentCharId = this.styleManager.getCurrentCharacterId();
            if (currentCharId) {
                this.styleManager.updateStyleProperty(currentCharId, id, { color, alpha });
            }
        });

        // 样式保存处理
        this.eventManager.on(EventTypes.UI_SAVE_REQUESTED, () => {
            this.styleManager.saveCurrentStyle();
        });

        // 样式重置处理
        this.eventManager.on(EventTypes.UI_RESET_REQUESTED, () => {
            if (confirm('确定要重置当前样式吗？')) {
                this.styleManager.resetCurrentStyle();
            }
        });

        // 实时预览处理
        this.eventManager.on(EventTypes.UI_PREVIEW_REQUESTED, (styleConfig) => {
            const currentCharId = this.styleManager.getCurrentCharacterId();
            if (currentCharId) {
                this.styleManager.previewStyle(currentCharId, styleConfig);
            }
        });
    }

    loadSavedStyles() {
        const savedStyles = this.settings.getAllStyles();
        for (const [charId, style] of Object.entries(savedStyles)) {
            this.styleManager.loadStyle(charId, style);
        }
    }

    applyInitialStyles() {
        // 应用默认样式到现有消息
        document.querySelectorAll('.mes').forEach(message => {
            const characterId = message.dataset.character;
            if (characterId) {
                const style = this.styleManager.getCharacterStyle(characterId);
                if (style) {
                    this.styleManager.applyStyle(characterId, style);
                }
            }
        });
    }
}

// 初始化扩展
jQuery(() => {
    window.chatStylist = new ChatStylist();
});
