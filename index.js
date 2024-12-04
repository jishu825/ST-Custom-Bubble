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
                        <label class="checkbox_label">
                            <input type="checkbox" id="chat-stylist-enabled">
                            <span>启用聊天样式</span>
                        </label>
                        <hr>
                        <div id="chat-stylist-button" class="menu_button">
                            <i class="fa-solid fa-palette"></i>
                            <span>打开样式编辑器</span>
                        </div>
                    </div>
                </div>
            </div>`;

        $('#extensions_settings2').append(html);

        // 绑定开关事件
        $('#chat-stylist-enabled').prop('checked', this.settings.enabled).on('change', (e) => {
            this.settings.enabled = !!e.target.checked;
            saveSettingsDebounced();
        });

        // 绑定编辑器按钮事件
        $('#chat-stylist-button').on('click', () => {
            // TODO: 打开样式编辑器
            console.log('Opening style editor...');
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
