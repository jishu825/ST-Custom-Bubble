export const EventTypes = {
    // 样式相关事件
    STYLE_CHANGED: 'style:changed',
    STYLE_APPLIED: 'style:applied',
    STYLE_RESET: 'style:reset',
    
    // UI相关事件
    UI_PANEL_OPENED: 'ui:panel:opened',
    UI_PANEL_CLOSED: 'ui:panel:closed',
    UI_TAB_CHANGED: 'ui:tab:changed',
    UI_PREVIEW_REQUESTED: 'ui:preview:requested',
    UI_STYLE_SAVED: 'ui:style:saved'
};

export class EventManager {
    constructor() {
        this.listeners = new Map();
    }

    on(eventType, listener, options = {}) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        
        this.listeners.get(eventType).add({
            callback: listener,
            options
        });
    }

    once(eventType, listener, options = {}) {
        const onceWrapper = (eventData) => {
            this.off(eventType, onceWrapper);
            listener(eventData);
        };
        
        this.on(eventType, onceWrapper, options);
    }

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
}
