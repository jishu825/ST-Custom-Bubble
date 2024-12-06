import { DOMUtils } from "../../utils/DOMUtils.js";

export class TabControl {
    constructor(options = {}) {
        this.options = {
            tabs: options.tabs || [],
            onTabChanged: options.onTabChanged || null,
            activeTab: options.activeTab || null,
        };

        this.element = null;
        this.activeTab = this.options.activeTab || (this.options.tabs[0]?.id);
    }

    createElement() {
        const container = DOMUtils.createElement('div', 'tab-container');

        // 创建标签按钮
        const buttonsContainer = DOMUtils.createElement('div', 'tab-buttons');
        this.options.tabs.forEach(tab => {
            const button = DOMUtils.createElement('button', 'tab-button');
            button.textContent = tab.label;
            if (tab.id === this.activeTab) {
                button.classList.add('active');
            }
            button.dataset.tabId = tab.id;
            button.addEventListener('click', () => this.switchTab(tab.id));
            buttonsContainer.appendChild(button);
        });

        // 内容区域
        const contentContainer = DOMUtils.createElement('div', 'tab-content-container');
        this.options.tabs.forEach(tab => {
            const content = DOMUtils.createElement('div', 'tab-content', { 'data-tab-id': tab.id });
            if (tab.id === this.activeTab) {
                content.classList.add('active');
            }
            contentContainer.appendChild(content);
        });

        container.appendChild(buttonsContainer);
        container.appendChild(contentContainer);

        this.element = container;
        return container;
    }

    switchTab(tabId) {
        if (tabId === this.activeTab) return;

        const buttons = this.element.querySelectorAll('.tab-button');
        buttons.forEach(button => {
            button.classList.toggle('active', button.dataset.tabId === tabId);
        });

        const contents = this.element.querySelectorAll('.tab-content');
        contents.forEach(content => {
            content.classList.toggle('active', content.dataset.tabId === tabId);
        });

        this.activeTab = tabId;

        if (this.options.onTabChanged) {
            this.options.onTabChanged(tabId);
        }
    }

    setTabContent(tabId, content) {
        const container = this.element.querySelector(`.tab-content[data-tab-id="${tabId}"]`);
        if (!container) {
            console.error(`Tab content not found for tabId: ${tabId}`);
            return;
        }
        container.innerHTML = '';
        if (content instanceof Node) {
            container.appendChild(content);
        } else {
            container.innerHTML = content;
        }
    }

    getContentContainer(tabId) {
        if (!this.element) {
            console.error('TabControl element not initialized');
            return null;
        }
        return this.element.querySelector(`.tab-content[data-tab-id="${tabId}"]`);
    }

        // 清空现有内容
        container.innerHTML = '';

        // 添加新内容
        if (typeof content === 'string') {
            container.innerHTML = content;
        } else if (content instanceof Node) {
            container.appendChild(content);
        }
}
}
