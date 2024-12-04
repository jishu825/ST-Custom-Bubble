import { extension_settings } from "../../../../extensions.js";
import { StyleConfig } from "../models/StyleConfig.js";

export class StyleManager {
    constructor() {
        // 初始化设置
        this.settings = extension_settings.chat_stylist || {
            styles: {},
            defaultStyle: new StyleConfig().toJSON()
        };

        extension_settings.chat_stylist = this.settings;
        
        // 缓存当前样式
        this.styleCache = new Map();
        // 加载样式
        this.loadStyles();
    }

    // 加载所有保存的样式
    loadStyles() {
        for (const [id, styleData] of Object.entries(this.settings.styles)) {
            this.styleCache.set(id, new StyleConfig(styleData));
        }
    }

    // 获取角色样式
    getCharacterStyle(characterId) {
        if (!this.styleCache.has(characterId)) {
            // 如果没有找到样式，使用默认样式
            return new StyleConfig(this.settings.defaultStyle);
        }
        return this.styleCache.get(characterId);
    }

    // 保存角色样式
    saveCharacterStyle(characterId, style) {
        // 验证style是否为StyleConfig实例
        if (!(style instanceof StyleConfig)) {
            throw new Error('Invalid style configuration');
        }

        // 更新缓存
        this.styleCache.set(characterId, style);
        
        // 更新存储
        this.settings.styles[characterId] = style.toJSON();
        
        // 应用样式
        this.applyStyle(characterId, style);
    }

    // 删除角色样式
    deleteCharacterStyle(characterId) {
        this.styleCache.delete(characterId);
        delete this.settings.styles[characterId];
    }

    // 应用样式到DOM
    applyStyle(characterId, style) {
        const messages = document.querySelectorAll(`.mes[data-character="${characterId}"]`);
        
        messages.forEach(message => {
            const mesBlock = message.querySelector('.mes_block');
            const mesText = message.querySelector('.mes_text');
            
            if (mesBlock && mesText) {
                // 应用气泡样式
                this.applyBubbleStyle(mesBlock, style.bubble);
                
                // 应用文本样式
                this.applyTextStyle(mesText, style.text);
            }
        });
    }

    // 应用气泡样式
    applyBubbleStyle(element, bubbleStyle) {
        // 设置形状
        element.style.borderRadius = 
            bubbleStyle.shape === 'round' ? '15px' : 
            bubbleStyle.shape === 'square' ? '0' : 
            bubbleStyle.shape; // custom value

        // 设置背景
        if (bubbleStyle.background.type === 'solid') {
            element.style.background = bubbleStyle.background.color;
            element.style.opacity = bubbleStyle.background.opacity;
        } else {
            const gradient = bubbleStyle.background.gradient;
            const gradientString = gradient.colors.map((color, i) => 
                `${color} ${gradient.positions[i]}%`
            ).join(', ');
            
            element.style.background = 
                `${bubbleStyle.background.type}-gradient(${gradient.angle}deg, ${gradientString})`;
            element.style.opacity = bubbleStyle.background.opacity;
        }

        // 设置边框
        element.style.borderColor = bubbleStyle.border.color;
        element.style.borderWidth = `${bubbleStyle.border.width}px`;
        element.style.borderStyle = bubbleStyle.border.style;

        // 设置内边距
        element.style.padding = `${bubbleStyle.padding.top}px ${bubbleStyle.padding.right}px ${bubbleStyle.padding.bottom}px ${bubbleStyle.padding.left}px`;
    }

    // 应用文本样式
    applyTextStyle(element, textStyle) {
        // 设置主要文本颜色
        element.style.color = textStyle.mainColor;

        // 设置斜体文本颜色
        element.querySelectorAll('em, i').forEach(el => {
            el.style.color = textStyle.italicColor;
        });

        // 设置引用文本样式
        element.querySelectorAll('q').forEach(el => {
            el.style.color = textStyle.quoteColor;
            
            if (textStyle.quoteEffect.enabled) {
                el.style.textShadow = `0 0 ${textStyle.quoteEffect.glowIntensity}px ${textStyle.quoteEffect.glowColor}`;
            } else {
                el.style.textShadow = 'none';
            }
        });
    }
}
