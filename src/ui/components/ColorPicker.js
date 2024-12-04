import { BaseComponent } from './BaseComponent.js';
import { EventTypes } from '../../core/EventManager.js';

export class ColorPicker extends BaseComponent {
    constructor(eventManager, options = {}) {
        super(eventManager);
        this.options = {
            label: options.label || '',
            initialColor: options.initialColor || '#000000',
            showAlpha: options.showAlpha || false,
            id: options.id || `color-picker-${Math.random().toString(36).substr(2, 9)}`
        };
    }

    createElement() {
        const wrapper = document.createElement('div');
        wrapper.className = 'color-picker-wrapper';

        if (this.options.label) {
            const label = document.createElement('label');
            label.textContent = this.options.label;
            label.htmlFor = this.options.id;
            wrapper.appendChild(label);
        }

        const pickerContainer = document.createElement('div');
        pickerContainer.className = 'color-picker-container';

        const picker = document.createElement('input');
        picker.type = 'color';
        picker.id = this.options.id;
        picker.value = this.options.initialColor;

        if (this.options.showAlpha) {
            const alphaSlider = document.createElement('input');
            alphaSlider.type = 'range';
            alphaSlider.min = '0';
            alphaSlider.max = '100';
            alphaSlider.value = '100';
            alphaSlider.className = 'alpha-slider';
            pickerContainer.appendChild(alphaSlider);

            alphaSlider.addEventListener('input', this.handleAlphaChange.bind(this));
        }

        pickerContainer.appendChild(picker);
        wrapper.appendChild(pickerContainer);

        picker.addEventListener('input', this.handleColorChange.bind(this));
        picker.addEventListener('change', this.handleColorChange.bind(this));

        return wrapper;
    }

    handleColorChange(event) {
        const color = event.target.value;
        const alpha = this.getAlpha();
        this.eventManager.emit(EventTypes.UI_COLOR_CHANGED, {
            id: this.options.id,
            color,
            alpha
        });
    }

    handleAlphaChange(event) {
        const alpha = event.target.value / 100;
        this.eventManager.emit(EventTypes.UI_COLOR_CHANGED, {
            id: this.options.id,
            color: this.getColor(),
            alpha
        });
    }

    getColor() {
        return this.element.querySelector('input[type="color"]').value;
    }

    getAlpha() {
        const alphaSlider = this.element.querySelector('.alpha-slider');
        return alphaSlider ? alphaSlider.value / 100 : 1;
    }

    setValue(color, alpha) {
        const picker = this.element.querySelector('input[type="color"]');
        picker.value = color;

        const alphaSlider = this.element.querySelector('.alpha-slider');
        if (alphaSlider && alpha !== undefined) {
            alphaSlider.value = alpha * 100;
        }
    }
}
