// 检查必要依赖
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

    // ... [其他代码保持不变]
})();

// 修改初始化方式
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
