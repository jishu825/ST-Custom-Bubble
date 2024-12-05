if (typeof jQuery === 'undefined') {
    console.error('Chat Stylist: jQuery is required but not loaded');
    throw new Error('jQuery is required for Chat Stylist extension');
}

// ST框架导入
import { saveSettingsDebounced, eventSource, event_types } from "../../../../script.js";
import { extension_settings } from "../../../extensions.js";

const ChatStylist = (function() {
    const MODULE_NAME = 'chat_stylist';
    let styleManager;
    let settings;

    // 默认设置
    const defaultSettings = {
        enabled: true,
        styles: {},
        themeStyles: {},
        chatStyles: {}
    };

    class Settings {
        constructor() {
            // 初始化设置
            this.settings = extension_settings[MODULE_NAME] || defaultSettings;
            extension_settings[MODULE_NAME] = this.settings;
        }

        save() {
            extension_settings[MODULE_NAME] = this.settings;
            saveSettingsDebounced();
        }
    }

    class StyleManager {
        constructor(settings) {
            this.settings = settings;
            this.styleSheet = null;
            this.initialize();
        }

        initialize() {
            this.styleSheet = document.createElement('style');
            this.styleSheet.id = 'chat-stylist-styles';
            document.head.appendChild(this.styleSheet);
            this.applyStylesToChat();
        }

        applyStylesToChat() {
            if (!this.settings.settings.enabled) return;

            // 应用样式逻辑
            let styles = '';
            
            // 全局样式
            Object.entries(this.settings.settings.styles).forEach(([name, style]) => {
                if (!style.disabled) {
                    styles += `/* ${name} */\n${style.css}\n\n`;
                }
            });

            // 主题相关样式
            if (power_user.theme) {
                const themeStyles = this.settings.settings.themeStyles[power_user.theme] || {};
                Object.entries(themeStyles).forEach(([name, style]) => {
                    if (!style.disabled) {
                        styles += `/* Theme: ${power_user.theme} - ${name} */\n${style.css}\n\n`;
                    }
                });
            }

            // 聊天相关样式
            const chatId = getCurrentChatId();
            if (chatId) {
                const chatStyles = this.settings.settings.chatStyles[chatId] || {};
                Object.entries(chatStyles).forEach(([name, style]) => {
                    if (!style.disabled) {
                        styles += `/* Chat: ${chatId} - ${name} */\n${style.css}\n\n`;
                    }
                });
            }

            this.styleSheet.textContent = styles;
        }
    }

    function addSettingsUI() {
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
        
        // 绑定事件
        $('#chat-stylist-editor').on('click', showStyleEditor);
        $('#chat-stylist-import').on('click', importStyles);
        $('#chat-stylist-export').on('click', exportStyles);
        $('#chat-stylist-reset').on('click', () => {
            if (confirm('确定要重置所有样式设置吗？')) {
                resetStyles();
            }
        });
    }

    function showStyleEditor() {
        // TODO: 实现样式编辑器
        console.log('Style editor clicked');
    }

    function importStyles() {
        // TODO: 实现样式导入
        console.log('Import clicked');
    }

    function exportStyles() {
        // TODO: 实现样式导出
        console.log('Export clicked');
    }

    function resetStyles() {
        // TODO: 实现样式重置
        console.log('Reset clicked');
    }

    async function initialize() {
        settings = new Settings();
        styleManager = new StyleManager(settings);
        
        addSettingsUI();

        // 绑定事件
        eventSource.on(event_types.CHAT_CHANGED, () => {
            styleManager.applyStylesToChat();
        });

        eventSource.on(event_types.SETTINGS_UPDATED, () => {
            styleManager.applyStylesToChat();
        });
    }

    return {
        initialize
    };
})();

// 初始化扩展
jQuery(async () => {
    try {
        window.chatStylist = new ChatStylist();
        
        eventSource.once(event_types.APP_READY, () => {
            chatStylist.styleManager.applyStylesToChat();
        });
    } catch (error) {
        console.error('Failed to initialize Chat Stylist:', error);
    }
});
