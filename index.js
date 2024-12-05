import { saveSettingsDebounced, eventSource, event_types } from "../../../../script.js";
import { extension_settings } from "../../../extensions.js";

// 修改本地模块导入 
import { Settings } from "./core/Settings.js";
import { StyleManager } from "./core/StyleManager.js";
import { EventManager } from "./core/EventManager.js";
import { StylePanel } from "./ui/components/StylePreview.js";
import { StyleConfig } from "./models/StyleConfig.js";

class ChatStylist {
    constructor() {
        try {
            // 初始化核心组件
            this.eventManager = new EventManager();
            this.settings = new Settings();
            this.styleManager = new StyleManager(this.settings, this.eventManager);
            this.stylePanel = null;

            // 初始化
            this.initialize();
            console.debug('ChatStylist: Initialized successfully');
        } catch (error) {
            console.error('ChatStylist initialization failed:', error);
            throw error;
        }
    }

    initialize() {
        console.debug('ChatStylist: Initializing...');
        try {
            // 添加设置UI
            this.addSettings();
            
            // 绑定事件 
            this.bindEvents();

            console.debug('ChatStylist: Initialization complete');
        } catch (error) {
            console.error('ChatStylist: Initialization failed', error);
        }
    }

    addSettings() {
        // 创建设置面板HTML
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
        // 编辑器按钮
        $('#chat-stylist-editor').on('click', () => {
            this.showStyleEditor();
        });

        // 导入按钮
        $('#chat-stylist-import').on('click', () => {
            this.importStyles();
        });

        // 导出按钮
        $('#chat-stylist-export').on('click', () => {
            this.exportStyles();
        });

        // 重置按钮 
        $('#chat-stylist-reset').on('click', () => {
            if (confirm('确定要重置所有样式设置吗？')) {
                this.resetStyles();
            }
        });
    }

    bindEvents() {
        // 监听聊天变更
        eventSource.on(event_types.CHAT_CHANGED, () => {
            console.debug('ChatStylist: Chat changed');
            this.styleManager.applyStylesToChat();
        });

        // 监听消息事件
        eventSource.on(event_types.MESSAGE_SENT, () => {
            this.styleManager.applyStylesToChat();
        });
        eventSource.on(event_types.MESSAGE_RECEIVED, () => {
            this.styleManager.applyStylesToChat();
        });
    }

    showStyleEditor() {
        if (!this.stylePanel) {
            this.stylePanel = new StylePanel({
                onSave: (style) => this.handleStyleSave(style),
                onClose: () => this.hideStyleEditor()
            });
        }
        this.stylePanel.show();
    }

    hideStyleEditor() {
        if (this.stylePanel) {
            this.stylePanel.hide();
        }
    }

    handleStyleSave(style) {
        // 保存样式设置
        const currentCharacterId = this.stylePanel.getCurrentCharacterId();
        this.styleManager.saveCharacterStyle(currentCharacterId, style);
        
        // 应用新样式
        this.styleManager.applyStylesToChat();
        
        // 关闭编辑器
        this.hideStyleEditor();
    }

    async importStyles() {
        // 创建文件选择器
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                // 导入样式
                if (this.styleManager.importStyles(data)) {
                    toastr.success('样式导入成功');
                }
            } catch (error) {
                console.error('Failed to import styles:', error);
                toastr.error('样式导入失败');
            }
        };

        input.click();
    }

    exportStyles() {
        const data = this.styleManager.exportStyles();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // 创建下载链接
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-styles-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        // 清理
        URL.revokeObjectURL(url);
    }

    resetStyles() {
        this.styleManager.resetStyles();
        toastr.success('样式已重置');
    }
}

// 初始化扩展
jQuery(async () => {
    try {
        window.chatStylist = new ChatStylist();
        
        // 等待APP就绪
        eventSource.once(event_types.APP_READY, () => {
            chatStylist.styleManager.applyStylesToChat();
        });
    } catch (error) {
        console.error('Failed to initialize Chat Stylist:', error);
    }
});
