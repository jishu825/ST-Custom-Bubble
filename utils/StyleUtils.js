// src/utils/StyleUtils.js

export class StyleUtils {
    /**
     * 将样式对象转换为CSS样式字符串
     * @param {Object} styleObject 
     * @returns {string}
     */
    static objectToCssString(styleObject) {
        return Object.entries(styleObject)
            .map(([key, value]) => `${this.camelToDash(key)}: ${value};`)
            .join(' ');
    }

    /**
     * 驼峰命名转换为破折号命名
     * @param {string} str 
     * @returns {string}
     */
    static camelToDash(str) {
        return str.replace(/([A-Z])/g, '-$1').toLowerCase();
    }

    /**
     * 合并多个样式对象
     * @param {...Object} styles 
     * @returns {Object}
     */
    static mergeStyles(...styles) {
        return Object.assign({}, ...styles);
    }

    /**
     * 生成渐变背景样式
     * @param {string} type - 'linear' 或 'radial'
     * @param {Array<{color: string, position: number}>} stops - 颜色断点
     * @param {number} angle - 渐变角度(仅用于linear)
     * @returns {string}
     */
    static createGradient(type, stops, angle = 90) {
        const stopString = stops
            .map(stop => `${stop.color} ${stop.position}%`)
            .join(', ');

        return type === 'linear'
            ? `linear-gradient(${angle}deg, ${stopString})`
            : `radial-gradient(circle, ${stopString})`;
    }

    /**
     * 生成阴影效果
     * @param {string} color - 阴影颜色
     * @param {number} blur - 模糊半径
     * @param {number} spread - 扩散半径
     * @param {number} x - X偏移
     * @param {number} y - Y偏移
     * @returns {string}
     */
    static createShadow(color, blur = 0, spread = 0, x = 0, y = 0) {
        return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
    }

    /**
     * 生成文本阴影效果
     * @param {string} color - 阴影颜色
     * @param {number} blur - 模糊半径
     * @param {number} x - X偏移
     * @param {number} y - Y偏移
     * @returns {string}
     */
    static createTextShadow(color, blur = 0, x = 0, y = 0) {
        return `${x}px ${y}px ${blur}px ${color}`;
    }

    /**
     * 创建荧光效果样式
     * @param {string} color - 荧光颜色
     * @param {number} intensity - 强度
     * @returns {Object}
     */
    static createGlowEffect(color, intensity = 5) {
        return {
            textShadow: this.createTextShadow(color, intensity),
            filter: `drop-shadow(0 0 ${intensity}px ${color})`
        };
    }

    /**
     * 检查颜色值是否合法
     * @param {string} color 
     * @returns {boolean}
     */
    static isValidColor(color) {
        const s = new Option().style;
        s.color = color;
        return s.color !== '';
    }

    /**
     * 获取元素计算后的样式值
     * @param {HTMLElement} element 
     * @param {string} property 
     * @returns {string}
     */
    static getComputedStyle(element, property) {
        return window.getComputedStyle(element).getPropertyValue(property);
    }

    /**
     * 检查浏览器是否支持某个CSS属性
     * @param {string} property 
     * @returns {boolean}
     */
    static supportsProperty(property) {
        return property in document.documentElement.style;
    }

    /**
     * 为元素添加多个类名
     * @param {HTMLElement} element 
     * @param {...string} classNames 
     */
    static addClasses(element, ...classNames) {
        element.classList.add(...classNames);
    }

    /**
     * 从元素移除多个类名
     * @param {HTMLElement} element 
     * @param {...string} classNames 
     */
    static removeClasses(element, ...classNames) {
        element.classList.remove(...classNames);
    }

    /**
     * 切换元素的多个类名
     * @param {HTMLElement} element 
     * @param {Object<string, boolean>} classMap 
     */
    static toggleClasses(element, classMap) {
        Object.entries(classMap).forEach(([className, force]) => {
            element.classList.toggle(className, force);
        });
    }

    /**
     * 设置元素的多个样式
     * @param {HTMLElement} element 
     * @param {Object} styles 
     */
    static setStyles(element, styles) {
        Object.assign(element.style, styles);
    }

    /**
     * 创建动画关键帧
     * @param {string} name 动画名称
     * @param {Object} keyframes 关键帧对象
     * @returns {string}
     */
    static createKeyframes(name, keyframes) {
        const keyframeRules = Object.entries(keyframes)
            .map(([key, value]) => {
                const cssText = this.objectToCssString(value);
                return `${key} { ${cssText} }`;
            })
            .join('\n');

        return `@keyframes ${name} { ${keyframeRules} }`;
    }

    /**
     * 计算适配的文本颜色(黑色或白色)
     * @param {string} backgroundColor 
     * @returns {string}
     */
    static getContrastColor(backgroundColor) {
        // 移除开头的#号
        const hex = backgroundColor.replace('#', '');
        
        // 将颜色转换为RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // 计算亮度
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        
        // 根据亮度返回黑色或白色
        return brightness > 128 ? '#000000' : '#FFFFFF';
    }
}
