import { DOMUtils } from "../../utils/DOMUtils.js";
import { ColorPicker } from "../components/ColorPicker.js";

export class BubblePanel {
    constructor(options = {}) {
        this.options = {
            onChange: options.onChange || null,
            initialStyle: options.initialStyle || {}
        };

        this.element = null;
        this.colorPickers = new Map();
    }

    createElement() {
        const container = DOMUtils.createElement('div', 'bubble-panel');

        // 背景样式区域
        const backgroundSection = this.createBackgroundSection();
        container.appendChild(backgroundSection);

        // 边框样式区域
        const borderSection = this.createBorderSection();
        container.appendChild(borderSection);

        // 内边距区域
        const paddingSection = this.createPaddingSection();
        container.appendChild(paddingSection);

        this.element = container;
        return container;
    }

    createBackgroundSection() {
        const section = DOMUtils.createElement('div', 'style-section');
        
        // 添加标题
        const title = DOMUtils.createElement('h3', 'section-title');
        title.textContent = '背景样式';
        section.appendChild(title);

        // 背景类型选择
        const typeSelect = DOMUtils.createElement('select', 'style-select');
        typeSelect.innerHTML = `
            <option value="solid">纯色</option>
            <option value="gradient">渐变</option>
        `;
        section.appendChild(typeSelect);

        // 纯色选择器
        const solidColorPicker = new ColorPicker({
            label: '背景颜色',
            initialColor: this.options.initialStyle.background?.color || '#ffffff',
            showAlpha: true,
            onChange: (color) => {
                if(this.options.onChange) {
                    this.options.onChange({
                        type: 'background',
                        value: {
                            type: 'solid',
                            color: color
                        }
                    });
                }
            }
        });
        this.colorPickers.set('backgroundColor', solidColorPicker);
        section.appendChild(solidColorPicker.createElement());

        return section;
    }

    createBorderSection() {
        const section = DOMUtils.createElement('div', 'style-section');
        
        // 添加标题
        const title = DOMUtils.createElement('h3', 'section-title');
        title.textContent = '边框样式';
        section.appendChild(title);

        // 边框控制器容器
        const borderControls = DOMUtils.createElement('div', 'border-controls');

        // 边框颜色
        const colorPicker = new ColorPicker({
            label: '边框颜色',
            initialColor: this.options.initialStyle.border?.color || '#e0e0e0',
            onChange: (color) => {
                if(this.options.onChange) {
                    this.options.onChange({
                        type: 'border',
                        value: {
                            color: color
                        }
                    });
                }
            }
        });
        this.colorPickers.set('borderColor', colorPicker);
        borderControls.appendChild(colorPicker.createElement());

        // 边框宽度
        const widthControl = DOMUtils.createElement('div', 'border-width-control');
        widthControl.innerHTML = `
            <label>宽度</label>
            <input type="number" min="0" max="10" value="${this.options.initialStyle.border?.width || 1}" />
        `;
        borderControls.appendChild(widthControl);

        // 边框样式
        const styleSelect = DOMUtils.createElement('select', 'style-select');
        styleSelect.innerHTML = `
            <option value="solid">实线</option>
            <option value="dashed">虚线</option>
            <option value="dotted">点线</option>
        `;
        borderControls.appendChild(styleSelect);

        section.appendChild(borderControls);
        return section;
    }

    createPaddingSection() {
        const section = DOMUtils.createElement('div', 'style-section');
        
        // 添加标题
        const title = DOMUtils.createElement('h3', 'section-title');
        title.textContent = '内边距';
        section.appendChild(title);

        // 内边距控制器
        const paddingControls = DOMUtils.createElement('div', 'padding-controls');
        
        // 四个方向的内边距输入
        const directions = [
            {name: 'top', label: '上'},
            {name: 'right', label: '右'},
            {name: 'bottom', label: '下'},
            {name: 'left', label: '左'}
        ];

        directions.forEach(dir => {
            const control = DOMUtils.createElement('div', 'padding-input');
            control.innerHTML = `
                <label>${dir.label}</label>
                <input type="number" 
                       min="0" 
                       value="${this.options.initialStyle.padding?.[dir.name] || 15}" />
            `;
            paddingControls.appendChild(control);
        });

        section.appendChild(paddingControls);
        return section;
    }

    getCurrentStyle() {
        if(!this.element) return null;

        return {
            background: {
                type: this.element.querySelector('.style-select').value,
                color: this.colorPickers.get('backgroundColor').getValue(),
                opacity: 1.0 // 从颜色值中提取
            },
            border: {
                color: this.colorPickers.get('borderColor').getValue(),
                width: parseInt(this.element.querySelector('.border-width-control input').value),
                style: this.element.querySelector('.style-select').value
            },
            padding: {
                top: parseInt(this.element.querySelector('.padding-controls input:nth-child(1)').value),
                right: parseInt(this.element.querySelector('.padding-controls input:nth-child(2)').value),
                bottom: parseInt(this.element.querySelector('.padding-controls input:nth-child(3)').value),
                left: parseInt(this.element.querySelector('.padding-controls input:nth-child(4)').value)
            }
        };
    }
}
