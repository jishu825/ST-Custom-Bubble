import { extension_settings } from "../../extensions.js";
import { saveSettingsDebounced } from "../../../script.js";

// 初始化设置
const defaultSettings = {
    enabled: true,
    styles: {},
    defaultStyle: {
        background: {
            type: 'solid',
            color: 'rgba(254, 222, 169, 0.5)'
        },
        text: {
            main: 'rgba(0, 0, 0, 1)',
            italics: 'rgba(128, 128, 128, 1)',
            quote: '#3388ff'
        }
    }
};

// 添加扩展设置
function addSettings() {
    const html = `
        <div id="chat-stylist-settings">
            <div class="inline-drawer">
                <div class="inline-drawer-toggle inline-drawer-header">
                    <b>Chat Stylist</b>
                    <div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div>
                </div>
                <div class="inline-drawer-content">
                    <div class="chat-stylist-toggle">
                        <label class="checkbox_label">
                            <input type="checkbox" id="chat-stylist-enabled">
                            <span>启用聊天样式</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>`;

    $('#extensions_settings2').append(html);

    // 加载设置
    extension_settings.chat_stylist = extension_settings.chat_stylist || defaultSettings;

    // 绑定事件
    $('#chat-stylist-enabled').prop('checked', extension_settings.chat_stylist.enabled).on('change', function() {
        extension_settings.chat_stylist.enabled = !!$(this).prop('checked');
        saveSettingsDebounced();
    });
}

// 初始化扩展
jQuery(async () => {
    addSettings();
    console.log('Chat Stylist initialized');
});
