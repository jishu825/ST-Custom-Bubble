import { saveSettingsDebounced } from "../../../../script.js";
import { StyleConfig } from "../models/StyleConfig.js";
import { EventTypes } from "./EventManager.js";

export class StyleManager {
    constructor(settings, eventManager) {
        this.settings = settings;
        this.eventManager = eventManager;
        
        // 缓存样式实例
        this.styleCache = new Map();
        
        this.initializeEvents();
    }

    initializeEvents() {
        // 监听事件示例
        this.eventManager.on(EventTypes.STYLE_CHANGED, (data) => {
            this.applyStyle(data.target, data.style);
        });

        this.eventManager.on(EventTypes.STYLE_RESET, () => {
            this.resetStyles();
        });
    }

    /**
     * 获取指定消息元素的样式配置
     * @param {HTMLElement} messageElement 
     * @returns {StyleConfig}
     */
    getStyleForMessage(messageElement) {
        const isUser = messageElement.getAttribute('is_user') === 'true';
        const isSystem = messageElement.getAttribute('is_system') === 'true';
        const characterId = messageElement.getAttribute('chid');

        let style;
        if (isUser) {
            style = this.settings.getUserStyle();
        } else if (isSystem) {
            style = this.settings.getSystemStyle();
        } else {
            style = this.settings.getCharacterStyle(characterId);
        }

        return style;
    }

    /**
     * 应用样式到指定消息元素
     * @param {HTMLElement} messageElement 
     * @param {StyleConfig} styleConfig 
     */
    applyStyleToMessage(messageElement, styleConfig) {
        const mesBlock = messageElement.querySelector('.mes_block');
        const mesText = messageElement.querySelector('.mes_text');
        
        if (!mesBlock || !mesText) return;

        // 应用气泡样式
        const bubble = styleConfig.bubble.data;
        
        // 背景样式
        if (bubble.background.type === 'solid') {
            mesBlock.style.background = ColorUtils.hexToRgba(
                bubble.background.color,
                bubble.background.opacity
            );
        } else {
            mesBlock.style.background = ColorUtils.createGradient(
                bubble.background.gradient.type,
                bubble.background.gradient.colors,
                bubble.background.gradient.positions,
                bubble.background.gradient.angle
            );
        }

        // 边框样式
        mesBlock.style.border = `${bubble.border.width}px ${bubble.border.style} ${bubble.border.color}`;
        
        // 内边距
        mesBlock.style.padding = `${bubble.padding.top}px ${bubble.padding.right}px ${bubble.padding.bottom}px ${bubble.padding.left}px`;

        // 圆角
        mesBlock.style.borderRadius = bubble.shape === 'round' ? '10px' : 
                                    bubble.shape === 'custom' ? bubble.customBorderRadius : '0';

        // 应用文本样式
        const text = styleConfig.text.data;
        
        // 主要文本颜色
        mesText.style.color = text.mainColor;

        // 斜体文本颜色
        mesText.querySelectorAll('em, i').forEach(em => {
            em.style.color = text.italicColor;
        });

        // 引用文本样式
        mesText.querySelectorAll('q').forEach(q => {
            q.style.color = text.quoteColor;
            if (text.quoteEffect.enabled) {
                q.style.textShadow = `0 0 ${text.quoteEffect.radius}px ${text.quoteEffect.glowColor}`;
            } else {
                q.style.textShadow = 'none';
            }
        });
    }

    /**
     * 应用样式到当前聊天中的所有消息
     */
    applyStylesToChat() {
        if (!this.settings.enabled) return;

        document.querySelectorAll('.mes').forEach(messageElement => {
            const style = this.getStyleForMessage(messageElement);
            this.applyStyleToMessage(messageElement, style);
        });
    }

    /**
     * 保存特定角色的样式
     * @param {string} characterId 
     * @param {StyleConfig} style 
     */
    saveCharacterStyle(characterId, style) {
        // 验证style是否合法
        if (!(style instanceof StyleConfig)) {
            throw new Error('Invalid style configuration');
        }

        this.settings.setCharacterStyle(characterId, style);
        saveSettingsDebounced();
        
        // 应用新样式并通知其他组件
        this.applyStylesToChat();
        this.eventManager.emit(EventTypes.STYLE_APPLIED, {
            characterId,
            style
        });
    }

    /**
     * 重置所有样式到默认状态
     */
    resetStyles() {
        this.settings.reset();
        saveSettingsDebounced();
        this.applyStylesToChat();
        this.eventManager.emit(EventTypes.STYLE_RESET);
    }

    /**
     * 导出当前所有样式配置
     * @returns {Object}
     */
    exportStyles() {
        return {
            defaultStyle: this.settings.getDefaultStyle().toJSON(),
            userStyle: this.settings.getUserStyle().toJSON(),
            systemStyle: this.settings.getSystemStyle().toJSON(),
            characterStyles: Object.fromEntries(
                Object.entries(this.settings.settings.characterStyles)
                    .map(([id, style]) => [id, new StyleConfig(style).toJSON()])
            )
        };
    }

    /**
     * 导入样式配置
     * @param {Object} data 
     */
    importStyles(data) {
        try {
            if (!data) throw new Error('No data to import');

            // 验证并转换数据
            const styles = {
                defaultStyle: new StyleConfig(data.defaultStyle),
                userStyle: data.userStyle ? new StyleConfig(data.userStyle) : null,
                systemStyle: data.systemStyle ? new StyleConfig(data.systemStyle) : null,
                characterStyles: {}
            };

            // 处理角色样式
            if (data.characterStyles) {
                for (const [id, style] of Object.entries(data.characterStyles)) {
                    styles.characterStyles[id] = new StyleConfig(style);
                }
            }

            // 更新设置
            this.settings.settings.defaultStyle = styles.defaultStyle.toJSON();
            this.settings.settings.userStyle = styles.userStyle?.toJSON() || null;
            this.settings.settings.systemStyle = styles.systemStyle?.toJSON() || null;
            this.settings.settings.characterStyles = Object.fromEntries(
                Object.entries(styles.characterStyles)
                    .map(([id, style]) => [id, style.toJSON()])
            );

            // 保存并应用更改
            saveSettingsDebounced();
            this.applyStylesToChat();
            this.eventManager.emit(EventTypes.STYLE_CHANGED, styles);

            return true;
        } catch (error) {
            console.error('Failed to import styles:', error);
            return false;
        }
    }
}
