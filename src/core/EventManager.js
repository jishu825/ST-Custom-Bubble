/**
 * 事件类型枚举
 */
export const EventTypes = {
    // 样式相关事件
    STYLE_CHANGED: 'style:changed',
    STYLE_APPLIED: 'style:applied',
    STYLE_RESET: 'style:reset',
    
    // 角色相关事件
    CHARACTER_SELECTED: 'character:selected',
    CHARACTER_ADDED: 'character:added',
    CHARACTER_REMOVED: 'character:removed',
    
    // UI相关事件
    UI_PANEL_OPENED: 'ui:panel:opened',
    UI_PANEL_CLOSED: 'ui:panel:closed',
    UI_TAB_CHANGED: 'ui:tab:changed',
    UI_PREVIEW_REQUESTED: 'ui:preview:requested',
    
    // 设置相关事件
    SETTINGS_SAVED: 'settings:saved',
    SETTINGS_LOADED: 'settings:loaded',
    SETTINGS_RESET: 'settings:reset'
};

/**
 * 事件管理器类
 */
export class EventManager {
    constructor() {
        // 存储事件监听器
        this.listeners = new Map();
        
        // 存储一次性事件监听器
        this.onceListeners = new Map();
        
        // 初始化DOM观察器
        this.initDOMObserver();
    }

    /**
     * 添加事件监听器
     * @param {string} eventType - 事件类型
     * @param {Function} listener - 监听器函数
     * @param {Object} options - 配置选项
     */
    on(eventType, listener, options = {}) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        
        const listenerWrapper = {
            callback: listener,
            options
        };
        
        this.listeners.get(eventType).add(listenerWrapper);
    }

    /**
     * 添加一次性事件监听器
     * @param {string} eventType - 事件类型
     * @param {Function} listener - 监听器函数
     * @param {Object} options - 配置选项
     */
    once(eventType, listener, options = {}) {
        const onceWrapper = (eventData) => {
            this.off(eventType, onceWrapper);
            listener(eventData);
        };
        
        this.on(eventType, onceWrapper, options);
    }

    /**
     * 移除事件监听器
     * @param {string} eventType - 事件类型
     * @param {Function} listener - 监听器函数
     */
    off(eventType, listener) {
        if (!this.listeners.has(eventType)) return;
        
        const listeners = this.listeners.get(eventType);
        for (const listenerWrapper of listeners) {
            if (listenerWrapper.callback === listener) {
                listeners.delete(listenerWrapper);
                break;
            }
        }
        
        if (listeners.size === 0) {
            this.listeners.delete(eventType);
        }
    }

    /**
     * 触发事件
     * @param {string} eventType - 事件类型
     * @param {*} eventData - 事件数据
     */
    emit(eventType, eventData = null) {
        if (!this.listeners.has(eventType)) return;
        
        const listeners = this.listeners.get(eventType);
        for (const {callback, options} of listeners) {
            try {
                if (options.async) {
                    Promise.resolve().then(() => callback(eventData));
                } else {
                    callback(eventData);
                }
            } catch (error) {
                console.error(`Error in event listener for ${eventType}:`, error);
            }
        }
    }

    /**
     * 初始化DOM观察器
     */
    initDOMObserver() {
        const config = {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'data-character']
        };

        this.observer = new MutationObserver((mutations) => {
            this.handleDOMMutations(mutations);
        });

        // 开始观察聊天容器
        const chatContainer = document.getElementById('chat');
        if (chatContainer) {
            this.observer.observe(chatContainer, config);
        }
    }

    /**
     * 处理DOM变更
     * @param {MutationRecord[]} mutations - 变更记录
     */
    handleDOMMutations(mutations) {
        for (const mutation of mutations) {
            // 处理新增的消息
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.classList?.contains('mes')) {
                        const characterId = node.dataset.character;
                        if (characterId) {
                            this.emit(EventTypes.CHARACTER_ADDED, {
                                characterId,
                                element: node
                            });
                        }
                    }
                });

                mutation.removedNodes.forEach(node => {
                    if (node.classList?.contains('mes')) {
                        const characterId = node.dataset.character;
                        if (characterId) {
                            this.emit(EventTypes.CHARACTER_REMOVED, {
                                characterId,
                                element: node
                            });
                        }
                    }
                });
            }
        }
    }

    /**
     * 清理资源
     */
    dispose() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.listeners.clear();
        this.onceListeners.clear();
    }
}
