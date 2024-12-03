import { extension_settings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

// Debug utilities 
const debug = {
    log: (...args) => console.log('[Chat Stylist]', ...args)
};

class ChatStylist {
    constructor() {
        // 初始化设置
        this.settings = extension_settings.chat_stylist || {
            enabled: false,
            styles: {} 
        };
        extension_settings.chat_stylist = this.settings;
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
                            <input type="checkbox" id="chat-stylist-enabled" ${this.settings.enabled ? 'checked' : ''}>
                            <span>启用聊天气泡样式编辑器</span>
                        </label>
                        <div id="chat-stylist-button" class="menu_button" style="display: none">
                            <i class="fa-solid fa-palette"></i>
                            <span>打开样式编辑器</span>
                        </div>
                    </div>
                </div>
            </div>`;

        $('#extensions_settings2').append(html);

        // 绑定启用开关事件
        $('#chat-stylist-enabled').on('change', () => {
            this.settings.enabled = $('#chat-stylist-enabled').prop('checked');
            $('#chat-stylist-button').toggle(this.settings.enabled);
            saveSettingsDebounced();
        });

        // 绑定编辑器按钮事件
        $('#chat-stylist-button').on('click', () => {
            if(this.settings.enabled) {
                this.showEditor();
            }
        });

        // 初始显示状态
        $('#chat-stylist-button').toggle(this.settings.enabled);
        
        debug.log('Settings added and events bound');
    }

    showEditor() {
        debug.log('Opening editor...');
        // TODO: 编辑器功能将在下一步添加
        alert('编辑器功能即将推出!');
    }
}

// 初始化扩展
jQuery(() => {
    debug.log('Initializing Chat Stylist');
    window.chatStylist = new ChatStylist();
    window.chatStylist.addSettings();
});
