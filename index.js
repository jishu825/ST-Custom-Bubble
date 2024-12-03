import { extension_settings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

const debug = {
    log: (...args) => console.log('[Chat Stylist]', ...args)
};

class ChatStylist {
    constructor() {
        this.settings = extension_settings.chat_stylist || {
            styles: {} 
        };
        extension_settings.chat_stylist = this.settings;
        this.panel = null;
        this.isDragging = false;
        this.isResizing = false;
        this.touchIdentifier = null;
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

        $('#chat-stylist-button').on('click', () => {
            this.showEditor();
        });
        
        debug.log('Settings added');
    }

    createEditorPanel() {
        if (this.panel) return;

        const panel = document.createElement('div');
        panel.id = 'chat-stylist-panel';
        panel.className = 'chat-stylist-panel';
        
        panel.innerHTML = `
            <div class="panel-header">
                <div class="header-tabs">
                    <button class="tab-button active" data-tab="bubble">气泡样式</button>
                    <button class="tab-button" data-tab="text">文本样式</button>
                </div>
                <div class="panel-controls">
                    <button class="btn-minimize">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <button class="btn-close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
            <div class="panel-content">
                <div class="control-group">
                    <label>选择角色 / Select Character</label>
                    <select id="character-select" class="form-control">
                        <option value="">选择角色...</option>
                    </select>
                </div>

                <div class="tab-content active" data-tab="bubble">
                    <div class="control-group">
                        <label>背景样式 / Background Style</label>
                        <div class="color-picker-wrapper">
                            <toolcool-color-picker id="background-color" color="rgba(254, 222, 169, 0.5)"></toolcool-color-picker>
                        </div>
                    </div>
                </div>

                <div class="tab-content" data-tab="text">
                    <div class="control-group">
                        <label>主要文本 / Main Text</label>
                        <div class="color-picker-wrapper">
                            <toolcool-color-picker id="main-text-color" color="rgba(208, 206, 196, 1)"></toolcool-color-picker>
                        </div>
                    </div>

                    <div class="control-group">
                        <label>斜体文本 / Italic Text</label>
                        <div class="color-picker-wrapper">
                            <toolcool-color-picker id="italics-text-color" color="rgba(183, 160, 255, 1)"></toolcool-color-picker>
                        </div>
                    </div>

                    <div class="control-group">
                        <label>引用文本 / Quote Text</label>
                        <div class="color-picker-wrapper">
                            <toolcool-color-picker id="quote-text-color" color="rgba(224, 159, 254, 1)"></toolcool-color-picker>
                        </div>
                    </div>
                </div>
            </div>
            <div class="panel-resize-handle"></div>`;

        document.body.appendChild(panel);
        this.panel = panel;
        this.initPanelEvents();
    }

    initPanelEvents() {
        const panel = this.panel;
        
        // 关闭按钮
        panel.querySelector('.btn-close').addEventListener('click', () => this.hidePanel());

        // 最小化按钮
        panel.querySelector('.btn-minimize').addEventListener('click', () => this.toggleMinimize());

        // 标签页切换
        panel.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                panel.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                panel.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                panel.querySelector(`.tab-content[data-tab="${tabName}"]`).classList.add('active');
            });
        });

        this.initDragAndResize();
    }

    initDragAndResize() {
        const panel = this.panel;
        const header = panel.querySelector('.panel-header');
        const resizeHandle = panel.querySelector('.panel-resize-handle');

        // 拖动处理
        const handleDragStart = (e) => {
            if (e.target.closest('.panel-controls')) return;
            this.isDragging = true;
            const touch = e.touches ? e.touches[0] : e;
            this.touchIdentifier = touch.identifier;
            
            const rect = panel.getBoundingClientRect();
            this.dragOffset = {
                x: (touch.clientX - rect.left),
                y: (touch.clientY - rect.top)
            };
            
            panel.classList.add('dragging');
        };

        const handleDragMove = (e) => {
            if (!this.isDragging) return;
            e.preventDefault();
            
            const touch = e.touches ? 
                Array.from(e.touches).find(t => t.identifier === this.touchIdentifier) : 
                e;
            if (!touch) return;

            let newX = touch.clientX - this.dragOffset.x;
            let newY = touch.clientY - this.dragOffset.y;

            const rect = panel.getBoundingClientRect();
            newX = Math.max(0, Math.min(window.innerWidth - rect.width, newX));
            newY = Math.max(0, Math.min(window.innerHeight - rect.height, newY));

            panel.style.left = `${newX}px`;
            panel.style.top = `${newY}px`;
        };

        const handleDragEnd = () => {
            if (!this.isDragging) return;
            this.isDragging = false;
            this.touchIdentifier = null;
            panel.classList.remove('dragging');
        };

        // 调整大小处理
        const handleResizeStart = (e) => {
            this.isResizing = true;
            const touch = e.touches ? e.touches[0] : e;
            this.touchIdentifier = touch.identifier;
            panel.classList.add('resizing');
        };

        const handleResizeMove = (e) => {
            if (!this.isResizing) return;
            e.preventDefault();
            
            const touch = e.touches ? 
                Array.from(e.touches).find(t => t.identifier === this.touchIdentifier) : 
                e;
            if (!touch) return;

            const rect = panel.getBoundingClientRect();
            const width = touch.clientX - rect.left;
            const height = touch.clientY - rect.top;

            panel.style.width = `${Math.max(300, width)}px`;
            panel.style.height = `${Math.max(200, height)}px`;
        };

        const handleResizeEnd = () => {
            if (!this.isResizing) return;
            this.isResizing = false;
            this.touchIdentifier = null;
            panel.classList.remove('resizing');
        };

        // 添加事件监听器
        // 鼠标事件
        header.addEventListener('mousedown', handleDragStart);
        resizeHandle.addEventListener('mousedown', handleResizeStart);
        document.addEventListener('mousemove', (e) => {
            handleDragMove(e);
            handleResizeMove(e);
        });
        document.addEventListener('mouseup', () => {
            handleDragEnd();
            handleResizeEnd();
        });

        // 触摸事件
        header.addEventListener('touchstart', handleDragStart, { passive: false });
        resizeHandle.addEventListener('touchstart', handleResizeStart, { passive: false });
        document.addEventListener('touchmove', (e) => {
            handleDragMove(e);
            handleResizeMove(e);
        }, { passive: false });
        document.addEventListener('touchend', () => {
            handleDragEnd();
            handleResizeEnd();
        });
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
        const minimizeBtn = this.panel.querySelector('.btn-minimize i');
        
        if (this.panel.classList.contains('minimized')) {
            content.style.display = 'block';
            minimizeBtn.className = 'fa-solid fa-minus';
            this.panel.classList.remove('minimized');
        } else {
            content.style.display = 'none';
            minimizeBtn.className = 'fa-solid fa-plus';
            this.panel.classList.add('minimized');
        }
    }
}

// 初始化扩展
jQuery(() => {
    window.chatStylist = new ChatStylist();
    window.chatStylist.addSettings();
});
