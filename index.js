import { extension_settings } from "../../../extensions.js";

// 简单的调试日志
const debug = {
    log: (...args) => console.log('[Chat Stylist]', ...args)
};

// 最基础的扩展结构
class ChatStylist {
    constructor() {
        this.settings = extension_settings.chat_stylist || {
            enabled: false
        };
        extension_settings.chat_stylist = this.settings;
    }

    addSettings() {
        const html = `
            <div id="chat-stylist-settings">
                <div class="inline-drawer">
                    <div class="inline-drawer-toggle inline-drawer-header">
                        <b>Chat Stylist</b>
                    </div>
                    <div class="inline-drawer-content">
                        <label class="checkbox_label">
                            <input type="checkbox" id="chat-stylist-enabled">
                            <span>启用样式编辑器</span>
                        </label>
                    </div>
                </div>
            </div>`;

        $('#extensions_settings2').append(html);
        debug.log('Settings added');
    }
}

// 初始化
jQuery(() => {
    debug.log('Initializing Chat Stylist');
    window.chatStylist = new ChatStylist();
    window.chatStylist.addSettings();
});
