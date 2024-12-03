import { extension_settings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

const debug = {
    log: (...args) => console.log('[Chat Stylist]', ...args)
};

class ChatStylist {
    constructor() {
        this.settings = extension_settings.chat_stylist || {
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
                        <div id="chat-stylist-button" class="menu_button">
                            <i class="fa-solid fa-palette"></i>
                            <span class="chat-stylist-label">聊天样式编辑器 / Chat Style Editor</span>
                        </div>
                    </div>
                </div>
            </div>`;

        $('#extensions_settings2').append(html);

        // 绑定编辑器按钮事件
        $('#chat-stylist-button').on('click', () => {
            this.showEditor();
        });
        
        debug.log('Settings added and events bound');
    }

    showEditor() {
        debug.log('Opening editor...');
        alert('编辑器功能即将推出!');
    }
}

// 初始化扩展
jQuery(() => {
    debug.log('Initializing Chat Stylist');
    window.chatStylist = new ChatStylist();
    window.chatStylist.addSettings();
});
