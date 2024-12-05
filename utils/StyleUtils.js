export class StyleUtils {
    static objectToCssString(styleObject) {
        return Object.entries(styleObject)
            .map(([key, value]) => `${this.camelToDash(key)}: ${value};`)
            .join(' ');
    }

    static camelToDash(str) {
        return str.replace(/([A-Z])/g, '-$1').toLowerCase();
    }

    static mergeStyles(...styles) {
        return Object.assign({}, ...styles);
    }

    static createGradient(type, stops, angle = 90) {
        const stopString = stops
            .map(stop => `${stop.color} ${stop.position}%`)
            .join(', ');

        return type === 'linear'
            ? `linear-gradient(${angle}deg, ${stopString})`
            : `radial-gradient(circle, ${stopString})`;
    }

    static createShadow(color, blur = 0, spread = 0, x = 0, y = 0) {
        return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
    }

    static createTextShadow(color, blur = 0, x = 0, y = 0) {
        return `${x}px ${y}px ${blur}px ${color}`;
    }

    static createGlowEffect(color, intensity = 5) {
        return {
            textShadow: this.createTextShadow(color, intensity),
            filter: `drop-shadow(0 0 ${intensity}px ${color})`
        };
    }

    static isValidColor(color) {
        const s = new Option().style;
        s.color = color;
        return s.color !== '';
    }

    static getComputedStyle(element, property) {
        return window.getComputedStyle(element).getPropertyValue(property);
    }

    static supportsProperty(property) {
        return property in document.documentElement.style;
    }

    static addClasses(element, ...classNames) {
        element.classList.add(...classNames);
    }

    static removeClasses(element, ...classNames) {
        element.classList.remove(...classNames);
    }

    static toggleClasses(element, classMap) {
        Object.entries(classMap).forEach(([className, force]) => {
            element.classList.toggle(className, force);
        });
    }

    static setStyles(element, styles) {
        Object.assign(element.style, styles);
    }
}

    static createKeyframes(name, keyframes) {
        const keyframeRules = Object.entries(keyframes)
            .map(([key, value]) => {
                const cssText = this.objectToCssString(value);
                return `${key} { ${cssText} }`;
            })
            .join('\n');

        return `@keyframes ${name} { ${keyframeRules} }`;
    }

    static addStyleSheet() {
        const style = document.createElement('style');
        document.head.appendChild(style);
        return style.sheet;
    }

    static addCSSRule(sheet, selector, rules) {
        if('insertRule' in sheet) {
            sheet.insertRule(`${selector} { ${rules} }`, sheet.cssRules.length);
        }
        else if('addRule' in sheet) {
            sheet.addRule(selector, rules, sheet.cssRules.length);
        }
    }

    static removeCSSRule(sheet, index) {
        if('deleteRule' in sheet) {
            sheet.deleteRule(index);
        }
        else if('removeRule' in sheet) {
            sheet.removeRule(index);
        }
    }

    static getBackgroundColor(element) {
        let bg = window.getComputedStyle(element).backgroundColor;
        while (bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') {
            element = element.parentElement;
            if (!element) return 'rgb(255, 255, 255)';
            bg = window.getComputedStyle(element).backgroundColor;
        }
        return bg;
    }
}
