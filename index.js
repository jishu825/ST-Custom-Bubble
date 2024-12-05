// 检查必要依赖
if (typeof jQuery === 'undefined') {
    console.error('Chat Stylist: jQuery is required but not loaded');
    throw new Error('jQuery is required for Chat Stylist extension');
}

class ChatStylist {
    constructor() {
        try {
            this.MODULE_NAME = 'chat_stylist';
            this.settings = this.initSettings();
            this.styleManager = this.initStyleManager();
            
            this.initialize();
            console.debug('ChatStylist: Initialized successfully');
        } catch (error) {
            console.error('ChatStylist initialization failed:', error);
            throw error;
        }
    }

    initSettings() {
        const defaultSettings = {
            enabled: true,
            styles: {},
            themeStyles: {},
            chatStyles: {}
        };

        // 初始化设置
        if (!extension_settings[this.MODULE_NAME]) {
            extension_settings[this.MODULE_NAME] = defaultSettings;
        }
        return extension_settings[this.MODULE_NAME];
    }

    initStyleManager() {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'chat-stylist-styles';
        document.head.appendChild(styleSheet);
        return styleSheet;
    }

    initialize() {
        console.debug('ChatStylist: Initializing...');
        try {
            this.addSettingsUI();
            this.bindEvents();
            console.debug('ChatStylist: Initialization complete');
        } catch (error) {
            console.error('ChatStylist: Initialization failed', error);
        }
    }

    addSettingsUI() {
        const settingsHtml = `
            <div id="chat-stylist-settings">
                <div class="inline-drawer">
                    <div class="inline-drawer-toggle inline-drawer-header">
                        <b>Chat Stylist</b>
                        <div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div>
                    </div>
                    <div class="inline-drawer-content">
                        <div class="chat-stylist-controls">
                            <button id="chat-stylist-editor" class="menu_button">
                                <i class="fa-solid fa-palette"></i>
                                <span>样式编辑器</span>
                            </button>
                            <div class="flex-container">
                                <button id="chat-stylist-import" class="menu_button" title="导入样式">
                                    <i class="fa-solid fa-file-import"></i>
                                </button>
                                <button id="chat-stylist-export" class="menu_button" title="导出样式">
                                    <i class="fa-solid fa-file-export"></i>
                                </button>
                                <button id="chat-stylist-reset" class="menu_button" title="重置样式">
                                    <i class="fa-solid fa-rotate-left"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        $('#extensions_settings2').append(settingsHtml);
        this.bindSettingsControls();
    }

    bindSettingsControls() {
        $('#chat-stylist-editor').on('click', () => {
            this.showStyleEditor();
        });

        $('#chat-stylist-import').on('click', () => {
            this.importStyles();
        });

        $('#chat-stylist-export').on('click', () => {
            this.exportStyles();
        });

        $('#chat-stylist-reset').on('click', () => {
            if (confirm('确定要重置所有样式设置吗？')) {
                this.resetStyles();
            }
        });
    }

    bindEvents() {
        eventSource.on(event_types.CHAT_CHANGED, () => {
            console.debug('ChatStylist: Chat changed');
            this.applyStylesToChat();
        });

        eventSource.on(event_types.SETTINGS_UPDATED, () => {
            this.applyStylesToChat();
        });
    }

    applyStylesToChat() {
        if (!this.settings.enabled) return;

        let styles = '';
        // 应用样式逻辑
        this.styleManager.textContent = styles;
    }

    showStyleEditor() {
        console.log('Style editor clicked');
    }

    importStyles() {
        console.log('Import clicked');
    }

    exportStyles() {
        console.log('Export clicked');
    }

    resetStyles() {
        this.settings = this.initSettings();
        this.applyStylesToChat();
        saveSettingsDebounced();
    }
}

// 初始化扩展
jQuery(async () => {
    try {
        window.chatStylist = new ChatStylist();
    } catch (error) {
        console.error('Failed to initialize Chat Stylist:', error);
    }
});
