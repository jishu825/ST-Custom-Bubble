/**
 * UI组件的基础类
 */
export class BaseComponent {
    constructor(eventManager) {
        this.eventManager = eventManager;
        this.element = null;
    }

    /**
     * 创建组件的DOM元素
     * @returns {HTMLElement}
     */
    createElement() {
        throw new Error('createElement method must be implemented');
    }

    /**
     * 渲染组件
     * @param {HTMLElement} container 
     */
    render(container) {
        if (!this.element) {
            this.element = this.createElement();
        }
        container.appendChild(this.element);
        this.afterRender();
    }

    /**
     * 组件渲染后的回调
     */
    afterRender() {
        // 子类可以重写此方法
    }

    /**
     * 更新组件
     * @param {*} data 
     */
    update(data) {
        // 子类可以重写此方法
    }

    /**
     * 移除组件
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}
