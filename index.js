import { extension_settings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

class ChatStylist {
    constructor() {
        this.settings = extension_settings.chat_stylist || {
            styles: {} 
        };
        extension_settings.chat_stylist = this.settings;
        this.panel = null;
    }

    addSettings() {
        const html = `
            <div id="chat-stylist-settings">
                <div class="inline-drawer">
                    <div class="inline-drawer-toggle inline-drawer-header">
                        <b>Chat Stylist</b>
                        <div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div>
                    </div>
                    <div class="inline-drawer-content">
                        <div id="chat-stylist-button" class="menu_button">
                            <i class="fa-solid fa-palette"></i>
                            <span class="chat-stylist-label">聊天样式编辑器 / Chat Style Editor</span>
                        </div>
                    </div>
                </div>
            </div>`;

        $('#extensions_settings2').append(html);

        // 绑定编辑器按钮事件
        $('#chat-stylist-button').on('click', () => {
            this.showEditor();
        });
        
        debug.log('Settings added and events bound');
    }

    createEditorPanel() {
        // 如果面板已存在，则不重复创建
        if (this.panel) return;

        const panel = document.createElement('div');
        panel.id = 'chat-stylist-panel';
        panel.className = 'chat-stylist-panel';
        
        panel.innerHTML = `
            <div class="panel-header">
                <span>Chat Style Editor</span>
                <div class="panel-controls">
                    <button class="btn-minimize" title="最小化">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <button class="btn-close" title="关闭">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
            <div class="panel-content">
                <!-- 角色选择 -->
                <div class="style-section">
                    <label>选择角色 / Select Character</label>
                    <select id="style-character-select">
                        <option value="">--请选择--</option>
                    </select>
                </div>

                <!-- 主设置面板 -->
                <div class="style-section">
                    <div class="section-row">
                        <div class="style-item">
                            <label>气泡背景色 / Bubble Background</label>
                            <input type="color" id="style-bubble-color">
                            <input type="range" id="style-bubble-opacity" min="0" max="100" value="100">
                            <span class="opacity-value">100%</span>
                        </div>
                    </div>
                    
                    <div class="section-row">
                        <div class="style-item">
                            <label>文本颜色 / Text Color</label>
                            <input type="color" id="style-text-color">
                        </div>
                    </div>
                </div>
            </div>`;

        this.panel = panel;
        document.body.appendChild(panel);
        this.initPanelEvents();
    }

    initPanelEvents() {
        // 关闭按钮
        this.panel.querySelector('.btn-close').addEventListener('click', () => {
            this.hidePanel();
        });

        // 最小化按钮
        this.panel.querySelector('.btn-minimize').addEventListener('click', () => {
            this.toggleMinimize();
        });

        // 使面板可拖动
        this.makeElementDraggable(this.panel);
    }

    makeElementDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const header = element.querySelector('.panel-header');

        header.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    showEditor() {
        if (!this.panel) {
            this.createEditorPanel();
        }
        this.panel.style.display = 'block';
    }

    hidePanel() {
        if (this.panel) {
            this.panel.style.display = 'none';
        }
    }

    toggleMinimize() {
        const content = this.panel.querySelector('.panel-content');
        if (content.style.display === 'none') {
            content.style.display = 'block';
            this.panel.classList.remove('minimized');
        } else {
            content.style.display = 'none';
            this.panel.classList.add('minimized');
        }
    }
}

// 初始化扩展
jQuery(() => {
    window.chatStylist = new ChatStylist();
    window.chatStylist.addSettings();
});
