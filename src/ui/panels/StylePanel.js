import { BaseComponent } from '../components/BaseComponent.js';
import { ColorPicker } from '../components/ColorPicker.js';
import { EventTypes } from '../../core/EventManager.js';

export class StylePanel extends BaseComponent {
    constructor(eventManager) {
        super(eventManager);
        this.colorPickers = new Map();
        this.activeTab = 'bubble';
    }

    createElement() {
        const panel = document.createElement('div');
        panel.className = 'style-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <div class="header-tabs">
                    <button class="tab-button active" data-tab="bubble">气泡样式</button>
                    <button class="tab-button" data-tab="text">文本样式</button>
                </div>
                <div class="panel-controls">
                    <button class="btn-save" title="保存样式">
                        <i class="fas fa-save"></i>
                    </button>
                    <button class="btn-reset" title="重置样式">
                        <i class="fas fa-undo"></i>
                    </button>
                    <button class="btn-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="panel-content">
                <div class="tab-content active" data-tab="bubble">
                    ${this.createBubbleTabContent()}
                </div>
                <div class="tab-content" data-tab="text">
                    ${this.createTextTabContent()}
                </div>
            </div>`;

        this.initializeEventListeners(panel);
        return panel;
    }

    createBubbleTabContent() {
        return `
            <div class="control-group">
                <label>背景颜色</label>
                <div id="background-color-picker"></div>
            </div>
            <div class="control-group">
                <label>边框</label>
                <div class="border-controls">
                    <div id="border-color-picker"></div>
                    <div class="border-width">
                        <label>宽度</label>
                        <input type="number" min="0" max="10" value="1" id="border-width">
                    </div>
                </div>
            </div>
            <div class="control-group">
                <label>内边距</label>
                <div class="padding-controls">
                    <input type="number" min="0" placeholder="上" id="padding-top">
                    <input type="number" min="0" placeholder="右" id="padding-right">
                    <input type="number" min="0" placeholder="下" id="padding-bottom">
                    <input type="number" min="0" placeholder="左" id="padding-left">
                </div>
            </div>`;
    }

    createTextTabContent() {
        return `
            <div class="control-group">
                <label>主要文本颜色</label>
                <div id="main-text-color-picker"></div>
            </div>
            <div class="control-group">
                <label>斜体文本颜色</label>
                <div id="italic-text-color-picker"></div>
            </div>
            <div class="control-group">
                <label>引用文本颜色</label>
                <div id="quote-text-color-picker"></div>
            </div>`;
    }

    afterRender() {
        // 初始化颜色选择器
        this.initializeColorPickers();
        
        // 初始化其他控件的值
        this.initializeControls();
    }

    initializeColorPickers() {
        const colorPickerConfigs = [
            { id: 'background-color-picker', label: '背景颜色', showAlpha: true },
            { id: 'border-color-picker', label: '边框颜色', showAlpha: false },
            { id: 'main-text-color-picker', label: '主要文本', showAlpha: false },
            { id: 'italic-text-color-picker', label: '斜体文本', showAlpha: false },
            { id: 'quote-text-color-picker', label: '引用文本', showAlpha: false }
        ];

        colorPickerConfigs.forEach(config => {
            const container = this.element.querySelector(`#${config.id}`);
            if (container) {
                const picker = new ColorPicker(this.eventManager, config);
                picker.render(container);
                this.colorPickers.set(config.id, picker);
            }
        });
    }

    initializeEventListeners(panel) {
        // 标签切换
        panel.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // 保存按钮
        panel.querySelector('.btn-save').addEventListener('click', () => {
            this.eventManager.emit(EventTypes.UI_SAVE_REQUESTED);
        });

        // 重置按钮
        panel.querySelector('.btn-reset').addEventListener('click', () => {
            this.eventManager.emit(EventTypes.UI_RESET_REQUESTED);
        });

        // 关闭按钮
        panel.querySelector('.btn-close').addEventListener('click', () => {
            this.eventManager.emit(EventTypes.UI_PANEL_CLOSE_REQUESTED);
        });

        // 数值输入框变化
        panel.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('change', () => {
                this.handleControlChange(input);
            });
        });
    }

    switchTab(tabName) {
        this.activeTab = tabName;
        
        // 更新标签按钮状态
        this.element.querySelectorAll('.tab-button').forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });

        // 更新内容区域显示
        this.element.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.tab === tabName);
        });

        this.eventManager.emit(EventTypes.UI_TAB_CHANGED, { tab: tabName });
    }

    handleControlChange(input) {
        this.eventManager.emit(EventTypes.UI_CONTROL_CHANGED, {
            id: input.id,
            value: input.value
        });
    }

    update(styleConfig) {
        // 更新颜色选择器
        if (styleConfig.bubble) {
            this.colorPickers.get('background-color-picker')?.setValue(
                styleConfig.bubble.background.color,
                styleConfig.bubble.background.opacity
            );
            this.colorPickers.get('border-color-picker')?.setValue(
                styleConfig.bubble.border.color
            );
        }

        if (styleConfig.text) {
            this.colorPickers.get('main-text-color-picker')?.setValue(
                styleConfig.text.mainColor
            );
            this.colorPickers.get('italic-text-color-picker')?.setValue(
                styleConfig.text.italicColor
            );
            this.colorPickers.get('quote-text-color-picker')?.setValue(
                styleConfig.text.quoteColor
            );
        }

        // 更新其他控件
        if (styleConfig.bubble) {
            const padding = styleConfig.bubble.padding;
            Object.entries(padding).forEach(([key, value]) => {
                const input = this.element.querySelector(`#padding-${key}`);
                if (input) input.value = value;
            });

            const borderWidth = this.element.querySelector('#border-width');
            if (borderWidth) borderWidth.value = styleConfig.bubble.border.width;
        }
    }
}
