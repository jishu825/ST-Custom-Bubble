// 样式配置的类型定义
export const StyleType = {
    BUBBLE: 'bubble',
    TEXT: 'text'
};

// 背景类型
export const BackgroundType = {
    SOLID: 'solid',
    LINEAR_GRADIENT: 'linear',
    RADIAL_GRADIENT: 'radial'
};

// 气泡形状
export const BubbleShape = {
    ROUND: 'round',
    SQUARE: 'square',
    CUSTOM: 'custom'
};

// 边框样式
export const BorderStyle = {
    SOLID: 'solid',
    DASHED: 'dashed',
    DOTTED: 'dotted'
};

// 文本样式配置
export class TextStyle {
    constructor(data = {}) {
        this.mainColor = data.mainColor || '#000000';
        this.italicColor = data.italicColor || '#666666';
        this.quoteColor = data.quoteColor || '#3388ff';
        this.quoteEffect = {
            enabled: data.quoteEffect?.enabled || false,
            glowColor: data.quoteEffect?.glowColor || '#3388ff',
            glowIntensity: data.quoteEffect?.glowIntensity || 5
        };
    }

    toJSON() {
        return {
            mainColor: this.mainColor,
            italicColor: this.italicColor,
            quoteColor: this.quoteColor,
            quoteEffect: { ...this.quoteEffect }
        };
    }
}

// 气泡样式配置
export class BubbleStyle {
    constructor(data = {}) {
        this.shape = data.shape || BubbleShape.ROUND;
        this.background = {
            type: data.background?.type || BackgroundType.SOLID,
            color: data.background?.color || '#ffffff',
            gradient: data.background?.gradient || {
                colors: ['#ffffff', '#f0f0f0'],
                positions: [0, 100],
                angle: 90
            },
            opacity: data.background?.opacity || 1.0
        };
        this.border = {
            color: data.border?.color || '#e0e0e0',
            width: data.border?.width || 1,
            style: data.border?.style || BorderStyle.SOLID
        };
        this.padding = {
            top: data.padding?.top || 15,
            right: data.padding?.right || 20,
            bottom: data.padding?.bottom || 15,
            left: data.padding?.left || 20
        };
    }

    toJSON() {
        return {
            shape: this.shape,
            background: { ...this.background },
            border: { ...this.border },
            padding: { ...this.padding }
        };
    }
}

// 完整样式配置
export class StyleConfig {
    constructor(data = {}) {
        this.id = data.id || crypto.randomUUID();
        this.name = data.name || '';
        this.bubble = new BubbleStyle(data.bubble);
        this.text = new TextStyle(data.text);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            bubble: this.bubble.toJSON(),
            text: this.text.toJSON()
        };
    }
}
