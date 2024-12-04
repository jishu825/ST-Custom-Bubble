import { extension_settings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";
import { power_user } from "../../../power-user.js";
import { eventSource, event_types } from "../../../../script.js";

// 定义默认样式配置
const defaultStyle = {
    bubble: {
        shape: 'round',
        background: {
            type: 'solid',
            color: '#ffffff',
            opacity: 1.0
        },
        border: {
            color: '#e0e0e0',
            width: 1,
            style: 'solid'
        },
        padding: {
            top: 15,
            right: 20,
            bottom: 15,
            left: 20
        }
    },
    text: {
        mainColor: '#000000',
        italicColor: '#666666',
        quoteColor: '#3388ff',
        quoteEffect: {
            enabled: false,
            glowColor: '#3388ff',
            glowRadius: 2
        }
    }
};

class ChatStylist {
    constructor() {
        // 初始化设置
        this.settings = extension_settings.chat_stylist || {
            enabled: true,
            styles: {},
            defaultStyle: defaultStyle
        };
        extension_settings.chat_stylist = this.settings;

        this.addSettings();
        this.bindEvents();
    }

addSettings() {
    const html = `
        <div id="chat-stylist-settings">
            <div class="inline-drawer">
                <div class="inline-drawer-toggle inline-drawer-header">
                    <b>Chat Stylist</b>
                    <div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div>
                </div>
                <div class="inline-drawer-content">
                    <div class="chat-stylist-controls">
                        <button id="chat-stylist-button" class="menu_button">
                            <i class="fa-solid fa-palette"></i>
                            <span>样式编辑器</span>
                        </button>
                        <button id="chat-stylist-defaults" class="menu_button" title="重置为默认样式">
                            <i class="fa-solid fa-rotate-left"></i>
                        </button>
                    </div>
                    <div class="chat-stylist-info">
                        <small class="chat-stylist-status">已应用样式：默认</small>
                    </div>
                </div>
            </div>
        </div>`;

    $('#extensions_settings2').append(html);

    // 绑定编辑器按钮事件
    $('#chat-stylist-button').on('click', () => {
        this.toggleEditor();
    });

    // 绑定重置按钮事件
    $('#chat-stylist-defaults').on('click', () => {
        if(confirm('确定要重置为默认样式吗？')) {
            this.resetStyles();
        }
    });
}

    bindEvents() {
        // 监听聊天变更事件
        eventSource.on(event_types.CHAT_CHANGED, () => {
            if (this.settings.enabled) {
                this.applyStylesToChat();
            }
        });
    }

    applyStylesToChat() {
        // TODO: 应用样式到当前聊天
        console.log('Applying styles to chat...');
    }
}

// 初始化扩展
jQuery(() => {
    window.chatStylist = new ChatStylist();
});
