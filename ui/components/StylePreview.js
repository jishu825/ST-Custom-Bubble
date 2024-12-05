import { StyleManager } from "../../core/StyleManager.js";
import { StylePanel } from "../components/StylePanel.js";
import { DOMUtils } from "../../utils/DOMUtils.js";
import { BubblePanel } from "../panels/BubblePanel.js";
import { TextPanel } from "../panels/TextPanel.js";
import { TabControl } from "./TabControl.js";

export class StylePanel {
    constructor(options = {}) {
        this.options = {
            onSave: options.onSave || null,
            onClose: options.onClose || null,
            initialStyle: options.initialStyle || null
        };

        this.element = null;
        this.tabControl = null;
        this.bubblePanel = null;
        this.textPanel = null;
        this.currentStyle = structuredClone(this.options.initialStyle) || {};
    }

    createElement() {
        const panel = DOMUtils.createElement('div', 'chat-stylist-editor');

        // 角色选择部分
        const characterSelect = this.createCharacterSelect();
        panel.appendChild(characterSelect);

        // 创建标签页控制器
        this.tabControl = new TabControl({
            tabs: [
                {id: 'bubble', label: '气泡样式', icon: 'fa-solid fa-message'},
                {id: 'text', label: '文本样式', icon: 'fa-solid fa-font'}
            ],
            onTabChanged: (tabId) => this.handleTabChange(tabId)
        });
        panel.appendChild(this.tabControl.createElement());

        // 创建气泡样式面板
        this.bubblePanel = new BubblePanel({
            initialStyle: this.currentStyle.bubble,
            onChange: (change) => this.handleStyleChange('bubble', change)
        });

        // 创建文本样式面板
        this.textPanel = new TextPanel({
            initialStyle: this.currentStyle.text,
            onChange: (change) => this.handleStyleChange('text', change)
        });

        // 添加面板内容
        this.tabControl.setTabContent('bubble', this.bubblePanel.createElement());
        this.tabControl.setTabContent('text', this.textPanel.createElement());

        // 底部预览和按钮
        const footer = this.createFooter();
        panel.appendChild(footer);

        // 添加拖动功能
        this.makeDraggable(panel);

        this.element = panel;
        return panel;
    }

    createCharacterSelect() {
        const container = DOMUtils.createElement('div', 'character-select-container');

        const select = DOMUtils.createElement('select', 'character-select');
        select.innerHTML = `
            <option value="default">默认样式</option>
            <option value="user">用户样式</option>
            <option value="system">系统样式</option>
            <optgroup label="角色样式" id="characterStyleOptions">
            </optgroup>
        `;

        // 工具按钮组
        const toolButtons = DOMUtils.createElement('div', 'tool-buttons');
        toolButtons.innerHTML = `
            <button title="导入样式" class="tool-button">
                <i class="fa-solid fa-file-import"></i>
            </button>
            <button title="导出样式" class="tool-button">
                <i class="fa-solid fa-file-export"></i>
            </button>
            <button title="保存为模板" class="tool-button">
                <i class="fa-solid fa-save"></i>
            </button>
        `;

        container.append(select, toolButtons);
        return container;
    }

    createFooter() {
        const footer = DOMUtils.createElement('div', 'editor-footer');

        // 预览区域
        const preview = DOMUtils.createElement('div', 'style-preview');
        preview.innerHTML = `
            <div class="preview-message">
                <div class="preview-bubble">
                    这是预览文本
                    <em>这是斜体文本</em>
                    <q>这是引用文本</q>
                </div>
            </div>
        `;

        // 操作按钮
        const actions = DOMUtils.createElement('div', 'editor-actions');
        actions.innerHTML = `
            <button class="action-button cancel">取消</button>
            <button class="action-button apply">应用</button>
            <button class="action-button save primary">保存</button>
        `;

        // 绑定事件
        actions.querySelector('.cancel').addEventListener('click', () => this.handleClose());
        actions.querySelector('.apply').addEventListener('click', () => this.handleApply());
        actions.querySelector('.save').addEventListener('click', () => this.handleSave());

        footer.append(preview, actions);
        return footer;
    }

    makeDraggable(panel) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        const dragStart = (e) => {
            if (e.target.closest('.editor-actions, .tool-buttons, select, button')) return;
            
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === panel || e.target.closest('.character-select-container')) {
                isDragging = true;
                panel.classList.add('dragging');
            }
        };

        const dragEnd = () => {
            isDragging = false;
            panel.classList.remove('dragging');
        };

        const drag = (e) => {
            if (!isDragging) return;

            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            panel.style.transform = `translate(${currentX}px, ${currentY}px)`;
        };

        panel.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
    }

    // 事件处理方法
    handleTabChange(tabId) {
        this.updatePreview();
    }

    handleStyleChange(type, change) {
        if (type === 'bubble') {
            this.currentStyle.bubble = {
                ...this.currentStyle.bubble,
                ...change
            };
        } else if (type === 'text') {
            this.currentStyle.text = {
                ...this.currentStyle.text,
                ...change.value
            };
        }
        this.updatePreview();
    }

    handleClose() {
        if (this.options.onClose) {
            this.options.onClose();
        }
    }

    handleApply() {
        this.updatePreview();
        // 临时应用样式但不保存
    }

    handleSave() {
        if (this.options.onSave) {
            this.options.onSave(this.getCurrentStyle());
        }
    }

    getCurrentStyle() {
        return {
            bubble: this.bubblePanel.getCurrentStyle(),
            text: this.textPanel.getCurrentStyle()
        };
    }

    updatePreview() {
        const style = this.getCurrentStyle();
        const previewBubble = this.element.querySelector('.preview-bubble');
        if (!previewBubble) return;

        // 应用预览样式
        const { bubble, text } = style;

        // 气泡样式
        if (bubble.background.type === 'solid') {
            previewBubble.style.background = bubble.background.color;
            previewBubble.style.opacity = bubble.background.opacity;
        } else {
            // 渐变背景
            // ...
        }

        previewBubble.style.border = `${bubble.border.width}px ${bubble.border.style} ${bubble.border.color}`;
        previewBubble.style.padding = `${bubble.padding.top}px ${bubble.padding.right}px ${bubble.padding.bottom}px ${bubble.padding.left}px`;

        // 文本样式
        previewBubble.style.color = text.mainColor;
        
        const italicText = previewBubble.querySelector('em');
        if (italicText) {
            italicText.style.color = text.italicColor;
        }

        const quoteText = previewBubble.querySelector('q');
        if (quoteText) {
            quoteText.style.color = text.quoteColor;
            if (text.quoteEffect.enabled) {
                quoteText.style.textShadow = `0 0 ${text.quoteEffect.radius}px ${text.quoteEffect.glowColor}`;
            } else {
                quoteText.style.textShadow = 'none';
            }
        }
    }

    show() {
        if (!this.element) {
            document.body.appendChild(this.createElement());
        }
        this.element.classList.add('show');
        this.updatePreview();
    }

    hide() {
        if (this.element) {
            this.element.classList.remove('show');
        }
    }
}
