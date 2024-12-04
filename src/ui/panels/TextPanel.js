import { DOMUtils } from "../../utils/DOMUtils.js";
import { ColorPicker } from "../components/ColorPicker.js";

export class TextPanel {
    constructor(options = {}) {
        this.options = {
            onChange: options.onChange || null,
            initialStyle: options.initialStyle || {}
        };

        this.element = null;
        this.colorPickers = new Map();
    }

    createElement() {
        const container = DOMUtils.createElement('div', 'text-panel');

        // 主要文本样式
        const mainTextSection = this.createMainTextSection();
        container.appendChild(mainTextSection);

        // 斜体文本样式
        const italicTextSection = this.createItalicTextSection();
        container.appendChild(italicTextSection);

        // 引用文本样式
        const quoteTextSection = this.createQuoteTextSection();
        container.appendChild(quoteTextSection);

        this.element = container;
        return container;
    }

    createMainTextSection() {
        const section = DOMUtils.createElement('div', 'style-section');
        
        // 标题
        const title = DOMUtils.createElement('h3', 'section-title');
        title.textContent = '主要文本';
        section.appendChild(title);

        // 颜色选择器
        const colorPicker = new ColorPicker({
            label: '文本颜色',
            initialColor: this.options.initialStyle.mainColor || '#000000',
            onChange: (color) => {
                if(this.options.onChange) {
                    this.options.onChange({
                        type: 'mainText',
                        value: { color }
                    });
                }
            }
        });
        this.colorPickers.set('mainTextColor', colorPicker);
        section.appendChild(colorPicker.createElement());

        return section;
    }

    createItalicTextSection() {
        const section = DOMUtils.createElement('div', 'style-section');
        
        // 标题
        const title = DOMUtils.createElement('h3', 'section-title');
        title.textContent = '斜体文本';
        section.appendChild(title);

        // 颜色选择器
        const colorPicker = new ColorPicker({
            label: '斜体颜色',
            initialColor: this.options.initialStyle.italicColor || '#666666',
            onChange: (color) => {
                if(this.options.onChange) {
                    this.options.onChange({
                        type: 'italicText',
                        value: { color }
                    });
                }
            }
        });
        this.colorPickers.set('italicTextColor', colorPicker);
        section.appendChild(colorPicker.createElement());

        return section;
    }

    createQuoteTextSection() {
        const section = DOMUtils.createElement('div', 'style-section');
        
        // 标题
        const title = DOMUtils.createElement('h3', 'section-title');
        title.textContent = '引用文本';
        section.appendChild(title);

        // 引用文本样式容器
        const quoteControls = DOMUtils.createElement('div', 'quote-controls');

        // 颜色选择器
        const colorPicker = new ColorPicker({
            label: '引用颜色',
            initialColor: this.options.initialStyle.quoteColor || '#3388ff',
            onChange: (color) => {
                if(this.options.onChange) {
                    this.options.onChange({
                        type: 'quoteText',
                        value: { color }
                    });
                }
            }
        });
        this.colorPickers.set('quoteTextColor', colorPicker);
        quoteControls.appendChild(colorPicker.createElement());

        // 荧光效果控制
        const glowControls = DOMUtils.createElement('div', 'glow-effect-controls');
        
        // 启用开关
        const glowToggle = DOMUtils.createElement('label', 'checkbox-label');
        glowToggle.innerHTML = `
            <input type="checkbox" 
                   ${this.options.initialStyle.quoteEffect?.enabled ? 'checked' : ''}/>
            <span>启用荧光效果</span>
        `;
        glowControls.appendChild(glowToggle);

        // 荧光颜色和强度控制
        const glowOptions = DOMUtils.createElement('div', 'glow-options');
        glowOptions.style.display = this.options.initialStyle.quoteEffect?.enabled ? 'block' : 'none';

        // 荧光颜色
        const glowColorPicker = new ColorPicker({
            label: '荧光颜色',
            initialColor: this.options.initialStyle.quoteEffect?.glowColor || '#3388ff',
            showAlpha: true,
            onChange: (color) => {
                if(this.options.onChange) {
                    this.options.onChange({
                        type: 'quoteGlow',
                        value: { 
                            enabled: true,
                            color: color 
                        }
                    });
                }
            }
        });
        this.colorPickers.set('quoteGlowColor', glowColorPicker);
        glowOptions.appendChild(glowColorPicker.createElement());

        // 荧光强度
        const glowIntensity = DOMUtils.createElement('div', 'glow-intensity');
        glowIntensity.innerHTML = `
            <label>荧光强度</label>
            <div class="slider-container">
                <input type="range" 
                       min="1" max="20" 
                       value="${this.options.initialStyle.quoteEffect?.radius || 2}" />
                <span class="slider-value">
                    ${this.options.initialStyle.quoteEffect?.radius || 2}px
                </span>
            </div>
        `;
        glowOptions.appendChild(glowIntensity);

        glowControls.appendChild(glowOptions);
        quoteControls.appendChild(glowControls);

        // 绑定事件
        glowToggle.querySelector('input').addEventListener('change', (e) => {
            glowOptions.style.display = e.target.checked ? 'block' : 'none';
            if(this.options.onChange) {
                this.options.onChange({
                    type: 'quoteGlow',
                    value: {
                        enabled: e.target.checked
                    }
                });
            }
        });

        glowIntensity.querySelector('input').addEventListener('input', (e) => {
            const value = e.target.value;
            glowIntensity.querySelector('.slider-value').textContent = `${value}px`;
            if(this.options.onChange) {
                this.options.onChange({
                    type: 'quoteGlow',
                    value: {
                        enabled: true,
                        radius: parseInt(value)
                    }
                });
            }
        });

        section.appendChild(quoteControls);
        return section;
    }

    getCurrentStyle() {
        if(!this.element) return null;

        return {
            mainColor: this.colorPickers.get('mainTextColor').getValue(),
            italicColor: this.colorPickers.get('italicTextColor').getValue(),
            quoteColor: this.colorPickers.get('quoteTextColor').getValue(),
            quoteEffect: {
                enabled: this.element.querySelector('.glow-effect-controls input[type="checkbox"]').checked,
                glowColor: this.colorPickers.get('quoteGlowColor').getValue(),
                radius: parseInt(this.element.querySelector('.glow-intensity input').value)
            }
        };
    }
}
