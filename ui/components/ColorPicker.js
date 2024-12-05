import { DOMUtils } from "../../utils/DOMUtils.js";

export class ColorPicker {
    constructor(options = {}) {
        this.options = {
            label: options.label || '',
            initialColor: options.initialColor || 'rgb(208, 206, 196)',
            showAlpha: options.showAlpha || false,
            onChange: options.onChange || null,
            id: `cp-${Math.random().toString(36).substring(2, 9)}`
        };

        this.element = null;
        this.value = this.options.initialColor;
    }

    createElement() {
        const container = DOMUtils.createElement('div', 'color-picker-wrapper');
        
        if (this.options.label) {
            const label = DOMUtils.createElement('label', 'color-picker-label');
            label.textContent = this.options.label;
            container.appendChild(label);
        }

        const pickerContainer = DOMUtils.createElement('div', 'color-picker-container');
        
        // 创建取色器组件
        const saturation = document.createElement('toolcool-color-picker-saturation');
        const hue = document.createElement('toolcool-color-picker-hue');
        const alpha = document.createElement('toolcool-color-picker-alpha');
        const fields = document.createElement('toolcool-color-picker-fields');

        // 设置公共属性
        [saturation, hue, alpha, fields].forEach(component => {
            component.setAttribute('color', this.options.initialColor);
            component.setAttribute('cid', this.options.id);
        });

        pickerContainer.appendChild(saturation);
        pickerContainer.appendChild(hue);
        if (this.options.showAlpha) {
            pickerContainer.appendChild(alpha);
        }
        pickerContainer.appendChild(fields);

        container.appendChild(pickerContainer);
        this.element = container;

        this.bindEvents();

        return container;
    }

    bindEvents() {
        this.element.addEventListener('color-change', (event) => {
            this.value = event.detail.color;
            if (this.options.onChange) {
                this.options.onChange(this.value);
            }
        });
    }

    getValue() {
        return this.value;
    }

    setValue(color) {
        this.value = color;
        if (this.element) {
            const components = this.element.querySelectorAll('[cid]');
            components.forEach(component => {
                component.setAttribute('color', color);
            });
        }
    }
}
