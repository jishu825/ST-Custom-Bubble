import { DOMUtils } from "../../utils/DOMUtils.js";

export class TabControl {
    constructor(options = {}) {
        this.options = {
            tabs: options.tabs || [], // [{id, label, icon}]
            onTabChanged: options.onTabChanged || null,
            activeTab: options.activeTab || null
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
            if(tab.id === this.activeTab) {
                button.classList.add('active');
            }

            if(tab.icon) {
                const icon = DOMUtils.createElement('i', tab.icon);
                button.appendChild(icon);
            }

            const label = document.createTextNode(tab.label);
            button.appendChild(label);
            button.dataset.tabId = tab.id;

            button.addEventListener('click', () => this.switchTab(tab.id));
            buttonsContainer.appendChild(button);
        });

        // 创建内容容器
        const contentContainer = DOMUtils.createElement('div', 'tab-content-container');
        this.options.tabs.forEach(tab => {
            const content = DOMUtils.createElement('div', 'tab-content');
            content.dataset.tabId = tab.id;
            if(tab.id === this.activeTab) {
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
        if(tabId === this.activeTab) return;

        const buttons = this.element.querySelectorAll('.tab-button');
        buttons.forEach(button => {
            button.classList.toggle('active', button.dataset.tabId === tabId);
        });

        const contents = this.element.querySelectorAll('.tab-content');
        contents.forEach(content => {
            content.classList.toggle('active', content.dataset.tabId === tabId);
        });

        this.activeTab = tabId;
        if(this.options.onTabChanged) {
            this.options.onTabChanged(tabId);
        }
    }

    getContentContainer(tabId) {
        return this.element.querySelector(`.tab-content[data-tab-id="${tabId}"]`);
    }

    setTabContent(tabId, content) {
        const container = this.getContentContainer(tabId);
        if(!container) return;

        // 清空现有内容
        container.innerHTML = '';
        
        // 添加新内容
        if(typeof content === 'string') {
            container.innerHTML = content;
        } else if(content instanceof Node) {
            container.appendChild(content);
        }
    }
}

// 使用示例:
/*
const tabs = new TabControl({
    tabs: [
        {id: 'bubble', label: '气泡样式', icon: 'fa-solid fa-message'},
        {id: 'text', label: '文本样式', icon: 'fa-solid fa-font'}
    ],
    onTabChanged: (tabId) => {
        console.log('Tab changed to:', tabId);
    }
});

const element = tabs.createElement();
document.body.appendChild(element);

// 设置标签页内容
tabs.setTabContent('bubble', bubblePanel.createElement());
tabs.setTabContent('text', textPanel.createElement());
*/
