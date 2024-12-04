// 修改外部依赖的导入路径
import { extension_settings } from "../../../extensions.js";
import { saveSettingsDebounced, eventSource, event_types } from "../../../../script.js";

// 修改本地模块的导入路径
import { Settings } from "./src/core/Settings.js";
import { StyleManager } from "./src/core/StyleManager.js";
import { EventManager } from "./src/core/EventManager.js";
import { StylePanel } from "./src/ui/components/StylePreview.js";
import { StyleConfig } from "./src/models/StyleConfig.js";

class ChatStylist {
    constructor() {
        // 初始化核心组件
        this.eventManager = new EventManager();
        this.settings = new Settings();
        this.styleManager = new StyleManager(this.settings, this.eventManager);
        this.stylePanel = null;

        // 初始化
        this.initialize();
    }

    initialize() {
        // 添加设置UI
        this.addSettings();
        
        // 绑定ST的事件监听
        this.bindEvents();

        console.log('Chat Stylist initialized');
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
            this.styleManager.applyStylesToChat();
        });

        // 监听新消息
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
jQuery(() => {
    window.chatStylist = new ChatStylist();
});
