// 在文件顶部的导入部分更新
import { extension_settings } from "../../../extensions.js";
import { saveSettingsDebounced, getContext } from "../../../../script.js";

// 获取 ST 上下文
const { eventSource, event_types } = getContext();

class ChatStylist {
    constructor() {
        // 初始化设置
        this.settings = extension_settings.chat_stylist || {
            styles: {},
            defaultStyle: {
                background: {
                    type: 'solid',
                    color: 'rgba(254, 222, 169, 0.5)',
                    gradient: {
                        colors: ['rgba(254, 222, 169, 0.5)', 'rgba(255, 255, 255, 0.5)'],
                        positions: [0, 100],
                        angle: 90
                    }
                },
                text: {
                    main: 'rgba(208, 206, 196, 1)',
                    italics: 'rgba(183, 160, 255, 1)',
                    quote: {
                        color: 'rgba(224, 159, 254, 1)',
                        glow: {
                            enabled: false,
                            color: 'rgba(224, 159, 254, 0.8)',
                            intensity: 5
                        }
                    }
                },
                padding: {
                    top: 10,
                    right: 15,
                    bottom: 10,
                    left: 15
                }
            }
        };
        extension_settings.chat_stylist = this.settings;
        this.panel = null;
        this.isDragging = false;
        this.isResizing = false;
        this.touchIdentifier = null;
        this.setupCharacterObserver(); // 初始化角色变化监听器
this.characterUpdateDebounced = this.debounce(this.updateCharacterList.bind(this), 500); // 防抖函数
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

    // 更改为 extensions_settings2
    const container = document.querySelector('#extensions_settings2');
    if (container) {
        container.insertAdjacentHTML('beforeend', html);
        
        // 绑定点击事件
        document.getElementById('chat-stylist-button')?.addEventListener('click', () => {
            this.showEditor();
        });
        
        debug.log('Settings added');
    } else {
        console.error('Cannot find #extensions_settings2 container');
    }
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
                    <button class="btn-save" title="保存样式">
                        <i class="fa-solid fa-save"></i>
                    </button>
                    <button class="btn-reset" title="重置样式">
                        <i class="fa-solid fa-rotate-left"></i>
                    </button>
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
                        <select id="background-type" class="form-control">
                            <option value="solid">纯色 / Solid</option>
                            <option value="linear">线性渐变 / Linear Gradient</option>
                            <option value="radial">径向渐变 / Radial Gradient</option>
                        </select>

                        <div id="solid-background" class="background-settings">
                            <div class="color-picker-wrapper">
                                <toolcool-color-picker id="background-color" color="rgba(254, 222, 169, 0.5)"></toolcool-color-picker>
                            </div>
                        </div>

                        <div id="gradient-background" class="background-settings" style="display: none;">
                            <div class="color-stop-container">
                                <div class="color-stop">
                                    <toolcool-color-picker class="gradient-color" color="rgba(254, 222, 169, 0.5)"></toolcool-color-picker>
                                    <div class="gradient-position-control">
                                        <label>位置 / Position (%)</label>
                                        <input type="number" class="gradient-position" value="0" min="0" max="100">
                                    </div>
                                </div>
                            </div>
                            <button class="add-color-stop">+ 添加颜色节点 / Add Color Stop</button>
                            <div class="gradient-angle">
                                <label>渐变角度 / Angle: <span class="angle-value">90°</span></label>
                                <input type="range" class="gradient-angle-slider" min="0" max="360" value="90">
                            </div>
                        </div>
                    </div>

                    <div class="control-group">
                        <label>内边距 / Padding (px)</label>
                        <div class="padding-controls">
                            <div class="padding-input">
                                <label>上 / Top</label>
                                <input type="number" id="padding-top" value="10" min="0">
                            </div>
                            <div class="padding-input">
                                <label>右 / Right</label>
                                <input type="number" id="padding-right" value="15" min="0">
                            </div>
                            <div class="padding-input">
                                <label>下 / Bottom</label>
                                <input type="number" id="padding-bottom" value="10" min="0">
                            </div>
                            <div class="padding-input">
                                <label>左 / Left</label>
                                <input type="number" id="padding-left" value="15" min="0">
                            </div>
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
                        
                        <div class="quote-glow-settings">
                            <label class="checkbox-label">
                                <input type="checkbox" id="quote-glow-enabled">
                                启用荧光效果 / Enable Glow Effect
                            </label>
                            <div id="quote-glow-controls" style="display: none;">
                                <div class="color-picker-wrapper">
                                    <label>荧光颜色 / Glow Color</label>
                                    <toolcool-color-picker id="quote-glow-color" color="rgba(224, 159, 254, 0.8)"></toolcool-color-picker>
                                </div>
                                <div class="glow-intensity">
                                    <label>荧光强度 / Intensity: <span class="intensity-value">5</span></label>
                                    <input type="range" id="quote-glow-intensity" min="0" max="20" value="5">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="panel-resize-handle"></div>`;

        document.body.appendChild(panel);
        this.panel = panel;
        this.initPanelEvents();
        this.initStyleControls();
    }

    initPanelEvents() {
        const panel = this.panel;
        
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

        // 控制按钮
        panel.querySelector('.btn-close').addEventListener('click', () => this.hidePanel());
        panel.querySelector('.btn-minimize').addEventListener('click', () => this.toggleMinimize());
        panel.querySelector('.btn-save').addEventListener('click', () => this.saveStyles());
        panel.querySelector('.btn-reset').addEventListener('click', () => this.resetStyles());

        // 背景类型切换
        panel.querySelector('#background-type').addEventListener('change', (e) => {
            panel.querySelector('#solid-background').style.display = 
                e.target.value === 'solid' ? 'block' : 'none';
            panel.querySelector('#gradient-background').style.display = 
                e.target.value !== 'solid' ? 'block' : 'none';
        });

        // 引用文本荧光效果切换
        panel.querySelector('#quote-glow-enabled').addEventListener('change', (e) => {
            panel.querySelector('#quote-glow-controls').style.display = 
                e.target.checked ? 'block' : 'none';
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
        header.addEventListener('mousedown', handleDragStart);
        header.addEventListener('touchstart', handleDragStart, { passive: false });

        resizeHandle.addEventListener('mousedown', handleResizeStart);
        resizeHandle.addEventListener('touchstart', handleResizeStart, { passive: false });

        document.addEventListener('mousemove', (e) => {
            handleDragMove(e);
            handleResizeMove(e);
        });
        document.addEventListener('touchmove', (e) => {
            handleDragMove(e);
            handleResizeMove(e);
        }, { passive: false });

        document.addEventListener('mouseup', () => {
            handleDragEnd();
            handleResizeEnd();
        });
        document.addEventListener('touchend', () => {
            handleDragEnd();
            handleResizeEnd();
        });
    }

    initStyleControls() {
        const panel = this.panel;

        // 颜色选择器变化事件
        panel.querySelectorAll('toolcool-color-picker').forEach(picker => {
            picker.addEventListener('change', () => this.updateStyles());
        });

        // 数字输入框变化事件
        panel.querySelectorAll('input[type="number"]').forEach(input => {
            input.addEventListener('change', () => this.updateStyles());
        });

        // 范围滑块变化事件
        panel.querySelectorAll('input[type="range"]').forEach(input => {
            input.addEventListener('input', (e) => {
                const valueDisplay = e.target.parentElement.querySelector('.intensity-value');
                if (valueDisplay) {
                    valueDisplay.textContent = e.target.value;
                }
                this.updateStyles();
            });
        });

        // 添加渐变色停止点
        panel.querySelector('.add-color-stop')?.addEventListener('click', () => {
            const container = panel.querySelector('.color-stop-container');
            const newStop = container.querySelector('.color-stop').cloneNode(true);
            container.appendChild(newStop);
            
            // 重新初始化新添加的控件
            const newPicker = newStop.querySelector('toolcool-color-picker');
            newPicker.addEventListener('change', () => this.updateStyles());
            
            const newPosition = newStop.querySelector('.gradient-position');
            newPosition.value = '100';
            newPosition.addEventListener('change', () => this.updateStyles());
        });
    }

    showEditor() {
        if (!this.panel) {
            this.createEditorPanel();
        }
        this.panel.style.display = 'block';
        
        // 计算合适的初始位置
        const rect = this.panel.getBoundingClientRect();
        const initialTop = Math.max(60, (window.innerHeight - rect.height) / 2);
        const initialLeft = Math.max(10, (window.innerWidth - rect.width) / 2);
        
        this.panel.style.top = `${initialTop}px`;
        this.panel.style.left = `${initialLeft}px`;
        
        this.refreshCharacterList();
        this.loadCurrentStyles();
    }

    hidePanel() {
        if (this.panel) {
            this.panel.style.display = 'none';
        }
    }

    toggleMinimize() {
        const content = this.panel.querySelector('.panel-content');
        const minimizeBtn = this.panel.querySelector('.btn-minimize i');
        const panel = this.panel;

        if (panel.classList.contains('minimized')) {
            content.style.display = 'block';
            minimizeBtn.className = 'fa-solid fa-minus';
            panel.classList.remove('minimized');
            if (panel.dataset.originalHeight) {
                panel.style.height = panel.dataset.originalHeight;
            }
        } else {
            content.style.display = 'none';
            minimizeBtn.className = 'fa-solid fa-plus';
            panel.classList.add('minimized');
            panel.dataset.originalHeight = panel.style.height;
            // 直接设置最小化时的高度为header的高度
            panel.style.height = panel.querySelector('.panel-header').offsetHeight + 'px';
        }
    }

    updateCharacterList() {
    const characterSelect = this.panel.querySelector('#character-select');
    const currentValue = characterSelect.value; // 当前选中的值
    const characters = new Map();

    // 获取所有消息中的角色
    document.querySelectorAll('.mes').forEach(message => {
        const nameElem = message.querySelector('.name_text');
        if (!nameElem) return;

        const name = nameElem.textContent.trim();
        const isUser = message.getAttribute('is_user') === 'true';
        const avatar = message.querySelector('.avatar img');

        if (name && name !== '${characterName}' && avatar) {
            const id = `${isUser ? 'user' : 'char'}_${name}`;
            if (!characters.has(id)) {
                characters.set(id, {
                    id,
                    name,
                    isUser,
                    avatar: avatar.src
                });
            }
        }
    });

    // 更新选择框选项
    characterSelect.innerHTML = '<option value="">选择角色...</option>';
    [...characters.values()].forEach(char => {
        const option = document.createElement('option');
        option.value = char.id;
        option.textContent = `${char.name} (${char.isUser ? '用户' : 'AI'})`;
        characterSelect.appendChild(option);
    });

    // 保持之前选中的值
    if (currentValue && [...characters.keys()].includes(currentValue)) {
        characterSelect.value = currentValue;
    }
}

    getCurrentCharacterId() {
        return this.panel.querySelector('#character-select').value;
    }

    getStylesForCharacter(charId) {
        return this.settings.styles[charId] || structuredClone(this.settings.defaultStyle);
    }

    loadStyles(charId) {
        const style = this.getStylesForCharacter(charId);
        const panel = this.panel;

        // 背景样式
        panel.querySelector('#background-type').value = style.background.type;
        panel.querySelector('#solid-background').style.display = 
            style.background.type === 'solid' ? 'block' : 'none';
        panel.querySelector('#gradient-background').style.display = 
            style.background.type !== 'solid' ? 'block' : 'none';

        if (style.background.type === 'solid') {
            panel.querySelector('#background-color').setAttribute('color', style.background.color);
        } else {
            // 渐变色设置
            const container = panel.querySelector('.color-stop-container');
            container.innerHTML = '';
            style.background.gradient.colors.forEach((color, index) => {
                const stop = this.createColorStop(color, style.background.gradient.positions[index]);
                container.appendChild(stop);
            });
            panel.querySelector('.gradient-angle-slider').value = style.background.gradient.angle;
            panel.querySelector('.angle-value').textContent = `${style.background.gradient.angle}°`;
        }

        // 内边距
        panel.querySelector('#padding-top').value = style.padding.top;
        panel.querySelector('#padding-right').value = style.padding.right;
        panel.querySelector('#padding-bottom').value = style.padding.bottom;
        panel.querySelector('#padding-left').value = style.padding.left;

        // 文本样式
        panel.querySelector('#main-text-color').setAttribute('color', style.text.main);
        panel.querySelector('#italics-text-color').setAttribute('color', style.text.italics);
        panel.querySelector('#quote-text-color').setAttribute('color', style.text.quote.color);

        // 引用文本荧光效果
        const glowEnabled = panel.querySelector('#quote-glow-enabled');
        glowEnabled.checked = style.text.quote.glow.enabled;
        panel.querySelector('#quote-glow-controls').style.display = 
            style.text.quote.glow.enabled ? 'block' : 'none';
        panel.querySelector('#quote-glow-color').setAttribute('color', style.text.quote.glow.color);
        panel.querySelector('#quote-glow-intensity').value = style.text.quote.glow.intensity;
        panel.querySelector('.intensity-value').textContent = style.text.quote.glow.intensity;

        this.updateStyles();
    }

    createColorStop(color, position) {
        const stop = document.createElement('div');
        stop.className = 'color-stop';
        stop.innerHTML = `
            <toolcool-color-picker class="gradient-color" color="${color}"></toolcool-color-picker>
            <div class="gradient-position-control">
                <label>位置 / Position (%)</label>
                <input type="number" class="gradient-position" value="${position}" min="0" max="100">
            </div>`;
        
        // 绑定事件
        stop.querySelector('toolcool-color-picker').addEventListener('change', () => this.updateStyles());
        stop.querySelector('.gradient-position').addEventListener('change', () => this.updateStyles());
        
        return stop;
    }

    getCurrentStyles() {
        const panel = this.panel;
        const backgroundType = panel.querySelector('#background-type').value;

        const style = {
            background: {
                type: backgroundType,
                color: panel.querySelector('#background-color').getAttribute('color'),
                gradient: {
                    colors: [],
                    positions: [],
                    angle: parseInt(panel.querySelector('.gradient-angle-slider').value)
                }
            },
            text: {
                main: panel.querySelector('#main-text-color').getAttribute('color'),
                italics: panel.querySelector('#italics-text-color').getAttribute('color'),
                quote: {
                    color: panel.querySelector('#quote-text-color').getAttribute('color'),
                    glow: {
                        enabled: panel.querySelector('#quote-glow-enabled').checked,
                        color: panel.querySelector('#quote-glow-color').getAttribute('color'),
                        intensity: parseInt(panel.querySelector('#quote-glow-intensity').value)
                    }
                }
            },
            padding: {
                top: parseInt(panel.querySelector('#padding-top').value),
                right: parseInt(panel.querySelector('#padding-right').value),
                bottom: parseInt(panel.querySelector('#padding-bottom').value),
                left: parseInt(panel.querySelector('#padding-left').value)
            }
        };

        if (backgroundType !== 'solid') {
            panel.querySelectorAll('.color-stop').forEach(stop => {
                style.background.gradient.colors.push(
                    stop.querySelector('.gradient-color').getAttribute('color')
                );
                style.background.gradient.positions.push(
                    parseInt(stop.querySelector('.gradient-position').value)
                );
            });
        }

        return style;
    }

    updateStyles() {
        const charId = this.getCurrentCharacterId();
        if (!charId) return;

        const style = this.getCurrentStyles();
        this.settings.styles[charId] = style;
        this.applyStylesToMessages(charId, style);
        saveSettingsDebounced();
    }

    applyStylesToMessages(charId, style) {
        document.querySelectorAll('.mes').forEach(message => {
            const name = message.querySelector('.name_text')?.textContent?.trim();
            const isUser = message.getAttribute('is_user') === 'true';
            const thisCharId = `${isUser ? 'user' : 'char'}_${name}`;
            
            if (thisCharId === charId) {
                const mesBlock = message.querySelector('.mes_block');
                const mesText = message.querySelector('.mes_text');
                
                // 应用背景样式
                if (style.background.type === 'solid') {
                    mesBlock.style.background = style.background.color;
                } else {
                    const gradType = style.background.type === 'linear' ? 'linear-gradient' : 'radial-gradient';
                    const gradString = style.background.gradient.colors.map((color, i) => 
                        `${color} ${style.background.gradient.positions[i]}%`).join(', ');
                    const angle = style.background.type === 'linear' ? `${style.background.gradient.angle}deg, ` : '';
                    mesBlock.style.background = `${gradType}(${angle}${gradString})`;
                }

                // 应用内边距
                mesBlock.style.padding = 
                    `${style.padding.top}px ${style.padding.right}px ${style.padding.bottom}px ${style.padding.left}px`;

                // 应用文本样式
                mesText.style.color = style.text.main;

                // 斜体文本
                mesText.querySelectorAll('em, i').forEach(el => {
                    el.style.color = style.text.italics;
                });

                // 引用文本及其荧光效果
                mesText.querySelectorAll('q').forEach(el => {
                    el.style.color = style.text.quote.color;
                    if (style.text.quote.glow.enabled) {
                        el.style.textShadow = `0 0 ${style.text.quote.glow.intensity}px ${style.text.quote.glow.color}`;
                    } else {
                        el.style.textShadow = 'none';
                    }
                });
            }
        });
    }

    saveStyles() {
        const charId = this.getCurrentCharacterId();
        if (!charId) return;

        this.updateStyles();
        debug.log('Styles saved for:', charId);
    }

    resetStyles() {
        const charId = this.getCurrentCharacterId();
        if (!charId) return;

        if (confirm('确定要重置当前角色的样式吗？')) {
            delete this.settings.styles[charId];
            this.loadStyles(charId);
            debug.log('Styles reset for:', charId);
        }
    }

    // 添加角色变化观察器
setupCharacterObserver() {
    const chatContainer = document.getElementById('chat');
    if (!chatContainer) return;

    const config = {
        childList: true,
        subtree: true,
        characterData: true
    };

    const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;

        for (const mutation of mutations) {
            if (mutation.type === 'childList' &&
                (mutation.target.classList.contains('mes') ||
                 mutation.target.closest('.mes'))) {
                shouldUpdate = true;
                break;
            }
        }

        if (shouldUpdate) {
            this.characterUpdateDebounced();
        }
    });

    observer.observe(chatContainer, config);

    // 确保 eventSource 和 event_types 存在
    if (eventSource && event_types) {
        eventSource.on(event_types.CHAT_CHANGED, () => {
            this.characterUpdateDebounced();
        });
    } else {
        console.warn('Event system not initialized');
    }
}

    debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
}

// 初始化扩展
jQuery(async () => {
    try {
        window.chatStylist = new ChatStylist();
        window.chatStylist.addSettings();
    } catch (err) {
        console.error('Failed to initialize Chat Stylist:', err);
    }
});
