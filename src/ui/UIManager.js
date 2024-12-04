import { StylePanel } from './panels/StylePanel.js';
import { EventTypes } from '../core/EventManager.js';

export class UIManager {
    constructor(eventManager) {
        this.eventManager = eventManager;
        this.stylePanel = null;
        
        this.initializeUI();
        this.bindEvents();
    }

    initializeUI() {
        // 创建样式面板
        this.stylePanel = new StylePanel(this.eventManager);
        
        // 添加触发按钮到工具栏
        this.addToolbarButton();
    }

    addToolbarButton() {
        const button = document.createElement('button');
        button.className = 'menu_button';
        button.innerHTML = '<i class="fas fa-paint-brush"></i> 聊天样式';
        
        button.addEventListener('click', () => {
            this.toggleStylePanel();
        });

        // 添加到工具栏
        const toolbar = document.querySelector('#toolbar-advanced-settings');
        if (toolbar) {
            toolbar.appendChild(button);
        }
    }

    toggleStylePanel() {
        if (!this.stylePanel.element) {
            const container = document.createElement('div');
            container.id = 'style-panel-container';
            document.body.appendChild(container);
            this.stylePanel.render(container);
        } else {
            const isVisible = this.stylePanel.element.style.display !== 'none';
            this.stylePanel.element.style.display = isVisible ? 'none' : 'block';
        }
    }

    bindEvents() {
        // 监听样式变更事件
        this.eventManager.on(EventTypes.STYLE_CHANGED, (data) => {
            this.stylePanel.update(data);
        });

        // 监听面板关闭请求
        this.eventManager.on(EventTypes.UI_PANEL_CLOSE_REQUESTED, () => {
            this.toggleStylePanel();
        });

        // 监听设置重置事件
        this.eventManager.on(EventTypes.SETTINGS_RESET, () => {
            this.stylePanel.update(this.defaultStyle);
        });
    }

    updatePreview(styleConfig) {
        // 实时预览逻辑
        this.eventManager.emit(EventTypes.UI_PREVIEW_REQUESTED, styleConfig);
    }
}
