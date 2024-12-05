export class DOMUtils {
    static createElement(tag, className, attributes = {}) {
        const element = document.createElement(tag);
        if (className) {
            element.className = className;
        }
        
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        
        return element;
    }

    static createButton(text, onClick, className = '') {
        const button = this.createElement('button', className);
        button.textContent = text;
        button.addEventListener('click', onClick);
        return button;
    }

    static createIcon(iconClass) {
        return this.createElement('i', iconClass);
    }

    static appendChildren(parent, ...children) {
        children.forEach(child => parent.appendChild(child));
        return parent;
    }

    static removeElement(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    static isVisible(element) {
        return element && 
               element.style.display !== 'none' && 
               element.style.visibility !== 'hidden';
    }
}
