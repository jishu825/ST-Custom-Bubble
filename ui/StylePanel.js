import { TabControl } from "./components/TabControl.js";
import { BubblePanel } from "./panels/BubblePanel.js";
import { TextPanel } from "./panels/TextPanel.js";
import { DOMUtils } from "../utils/DOMUtils.js";

export class StylePanel {
    constructor(options = {}) {
        this.options = {
            onSave: options.onSave || null,
            onReset: options.onReset || null,
            onClose: options.onClose || null,
            initialStyle: options.initialStyle || null,
        };

        this.element = null;
        this.tabControl = null;
        this.bubblePanel = null;
        this.textPanel = null;
        this.currentStyle = structuredClone(this.options.initialStyle) || {};
    }

    createElement() {
        const panel = DOMUtils.createElement("div", "chat-stylist-editor");

        // 添加标题栏
        const header = this.createHeader();
        panel.appendChild(header);

        // 添加标签页控制器
        this.tabControl = new TabControl({
            tabs: [
                { id: "bubble", label: "气泡样式", icon: "fa-solid fa-message" },
                { id: "text", label: "文本样式", icon: "fa-solid fa-font" },
            ],
            onTabChanged: (tabId) => this.handleTabChange(tabId),
        });
        panel.appendChild(this.tabControl.createElement());

        // 创建气泡样式面板
        this.bubblePanel = new BubblePanel({
            initialStyle: this.currentStyle.bubble,
            onChange: (change) => this.handleStyleChange("bubble", change),
        });

        // 创建文本样式面板
        this.textPanel = new TextPanel({
            initialStyle: this.currentStyle.text,
            onChange: (change) => this.handleStyleChange("text", change),
        });

        // 添加面板内容
        this.tabControl.setTabContent("bubble", this.bubblePanel.createElement());
        this.tabControl.setTabContent("text", this.textPanel.createElement());

        // 添加底部预览和按钮
        const footer = this.createFooter();
        panel.appendChild(footer);

        // 添加拖拽和缩放功能
        this.makeDraggable(panel, header);
        panel.style.resize = "both";

        this.element = panel;
        return panel;
    }

    createHeader() {
        const header = DOMUtils.createElement("div", "editor-header");
        const title = DOMUtils.createElement("span", "editor-title");
        title.textContent = "样式设置面板";

        const buttonContainer = DOMUtils.createElement("div", "editor-buttons");

        // 顶部按钮
        const saveButton = DOMUtils.createButton("", this.handleSave.bind(this), "action-button save");
        saveButton.innerHTML = `<i class="fa-solid fa-save"></i> 保存`;
        const resetButton = DOMUtils.createButton("", this.reset.bind(this), "action-button reset");
        resetButton.innerHTML = `<i class="fa-solid fa-rotate-left"></i> 重置`;
        const minimizeButton = DOMUtils.createButton("", this.handleMinimize.bind(this), "action-button minimize");
        minimizeButton.innerHTML = `<i class="fa-solid fa-window-minimize"></i> 最小化`;
        const closeButton = DOMUtils.createButton("", this.handleClose.bind(this), "action-button close");
        closeButton.innerHTML = `<i class="fa-solid fa-times"></i> 关闭`;

        buttonContainer.append(saveButton, resetButton, minimizeButton, closeButton);
        header.append(title, buttonContainer);

        return header;
    }

    createFooter() {
        const footer = DOMUtils.createElement("div", "editor-footer");

        const preview = DOMUtils.createElement("div", "style-preview");
        preview.innerHTML = `
            <div class="preview-message">
                <div class="preview-bubble">
                    这是预览文本
                    <em>这是斜体文本</em>
                    <q>这是引用文本</q>
                </div>
            </div>
        `;

        footer.appendChild(preview);
        return footer;
    }

    makeDraggable(panel, handle) {
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        handle.addEventListener("mousedown", (e) => {
            isDragging = true;
            offsetX = e.clientX - panel.offsetLeft;
            offsetY = e.clientY - panel.offsetTop;

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        });

        const onMouseMove = (e) => {
            if (isDragging) {
                panel.style.left = `${e.clientX - offsetX}px`;
                panel.style.top = `${e.clientY - offsetY}px`;
            }
        };

        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };
    }

    handleStyleChange(type, change) {
        if (type === "bubble") {
            this.currentStyle.bubble = {
                ...this.currentStyle.bubble,
                ...change,
            };
        } else if (type === "text") {
            this.currentStyle.text = {
                ...this.currentStyle.text,
                ...change,
            };
        }
        this.updatePreview();
    }

    handleTabChange(tabId) {
        this.updatePreview();
    }

    handleSave() {
        this.options.onSave && this.options.onSave(this.currentStyle);
    }

    reset() {
        this.options.onReset && this.options.onReset();
    }

    handleMinimize() {
        const content = this.element.querySelector(".editor-footer");
        content.style.display = content.style.display === "none" ? "block" : "none";
    }

    handleClose() {
        this.options.onClose && this.options.onClose();
        this.element.remove();
    }

    updatePreview() {
        const previewBubble = this.element.querySelector(".preview-bubble");
        if (!previewBubble) return;

        // 更新样式预览
        const { bubble, text } = this.currentStyle;

        if (bubble.background.type === "solid") {
            previewBubble.style.backgroundColor = bubble.background.color;
            previewBubble.style.opacity = bubble.background.opacity;
        } else {
            // TODO: 更新渐变预览
        }

        previewBubble.style.color = text.mainColor;
    }

    show() {
        if (!this.element) {
            document.body.appendChild(this.createElement());
        }
        this.element.classList.add("show");
    }

    hide() {
        if (this.element) {
            this.element.classList.remove("show");
        }
    }
}
