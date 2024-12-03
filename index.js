// Check if toolcool-color-picker is defined
if (!customElements.get('toolcool-color-picker')) {
    console.error('toolcool-color-picker component is not loaded. Please ensure the component is properly included.');
}

// Initialize required objects
if (!window.extension_settings) {
    window.extension_settings = {};
}

const MODULE_NAME = 'chat-stylist';

// Initialize module settings
if (!window.extension_settings[MODULE_NAME]) {
    window.extension_settings[MODULE_NAME] = {
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
                quote: 'rgba(224, 159, 254, 1)'
            },
            effects: {
                quoteGlow: {
                    enabled: false,
                    color: 'rgba(224, 159, 254, 0.8)',
                    intensity: 5
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
}

class ChatStylist {
    constructor() {
        this.settings = window.extension_settings[MODULE_NAME];
        this.currentCharacter = null;
        this.panel = null;
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        this.resizeStart = { width: 0, height: 0, x: 0, y: 0 };
    }

    init() {
    // 重要：等待扩展设置面板准备就绪
    const settingsReady = () => {
        if (!document.getElementById('extensions_settings2')) {
            setTimeout(settingsReady, 100);
            return;
        }

        // 添加扩展按钮到设置面板
        const extensionHtml = `
            <div id="chat-stylist-settings" class="extension-settings">
                <div class="inline-drawer">
                    <div class="inline-drawer-toggle inline-drawer-header">
                        <b class="inline-drawer-title">聊天气泡样式编辑器</b>
                        <div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div>
                    </div>
                    <div class="inline-drawer-content">
                        <div class="chat-stylist-control">
                            <div id="chat-stylist-button" class="menu_button">
                                <i class="fa-solid fa-palette"></i>
                                <span class="button-label">打开样式编辑器</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        $('#extensions_settings2').append(extensionHtml);

        // 添加按钮点击事件
        $('#chat-stylist-button').on('click', () => {
            if (!this.panel) {
                this.createEditorPanel();
                this.initEventListeners();
            }
            this.showPanel();
        });
    };

    // 开始检查设置面板是否就绪
    settingsReady();

    // 初始化样式
    this.initStyles();
}

    initStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .style-editor-panel {
            position: fixed;
            top: 50px;
            right: 20px;
            width: 320px;
            min-width: 320px;
            min-height: 200px;
            background: #2d2d2d;
            border: 1px solid #444;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
            z-index: 10000;
            resize: both;
            overflow: hidden;
            font-family: Arial, sans-serif;
            color: #fff;
        }

        .panel-content {
            padding: 15px;
            height: calc(100% - 50px);
            overflow-y: auto;
        }
    `;
    document.head.appendChild(styleSheet);
}

createEditorPanel() {
    // Create the panel element
    const panel = document.createElement('div');
    panel.id = 'style-editor-panel';
    panel.className = 'style-editor-panel';
    panel.style.display = 'none';

    // Define the panel's HTML content
    panel.innerHTML = `
        <div class="panel-header">
            <div class="header-tabs">
                <button class="tab-button active" data-tab="bubble">气泡样式</button>
                <button class="tab-button" data-tab="text">文本样式</button>
            </div>
            <div class="header-controls">
                <button class="save-btn" title="保存样式"><i class="fa-solid fa-save"></i></button>
                <button class="reset-btn" title="重置样式"><i class="fa-solid fa-rotate-left"></i></button>
                <button class="minimize-btn"><i class="fa-solid fa-minus"></i></button>
                <button class="close-btn"><i class="fa-solid fa-xmark"></i></button>
            </div>
        </div>
        <div class="panel-content">
            <!-- Character Selection (Common) -->
            <div class="control-group">
                <label>选择角色 / Select Character</label>
                <select id="character-select" class="form-control">
                    <option value="">选择角色...</option>
                </select>
            </div>

            <!-- Bubble Style Tab -->
            <div class="tab-content active" data-tab="bubble">
                <!-- Background Settings -->
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
                            <div class="color-stop">
                                <toolcool-color-picker class="gradient-color" color="rgba(255, 255, 255, 0.5)"></toolcool-color-picker>
                                <div class="gradient-position-control">
                                    <label>位置 / Position (%)</label>
                                    <input type="number" class="gradient-position" value="100" min="0" max="100">
                                </div>
                            </div>
                        </div>
                        <div class="gradient-angle">
                            <label>渐变角度 / Angle: <span class="angle-value">90°</span></label>
                            <input type="range" class="gradient-angle-slider" min="0" max="360" value="90">
                        </div>
                    </div>
                </div>

                <!-- Padding Settings -->
                <div class="control-group">
                    <label>内边距 / Padding</label>
                    <div class="padding-controls">
                        <div class="padding-input">
                            <input type="number" id="padding-top" value="10" min="0">
                            <label>上 / Top</label>
                        </div>
                        <div class="padding-input">
                            <input type="number" id="padding-right" value="15" min="0">
                            <label>右 / Right</label>
                        </div>
                        <div class="padding-input">
                            <input type="number" id="padding-bottom" value="10" min="0">
                            <label>下 / Bottom</label>
                        </div>
                        <div class="padding-input">
                            <input type="number" id="padding-left" value="15" min="0">
                            <label>左 / Left</label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Text Style Tab -->
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

                <div class="control-group">
                    <label>
                        <input type="checkbox" id="quote-glow-enabled">
                        启用引用荧光 / Enable Quote Glow
                    </label>
                    <div id="quote-glow-controls" style="display: none;">
                        <div class="color-picker-wrapper">
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
        <div class="panel-resize-handle"></div>
    `;

    document.body.appendChild(panel);
        this.panel = panel;

        panel.style.top = '50px';
        panel.style.right = '20px';

        setTimeout(() => {
            panel.querySelectorAll('toolcool-color-picker').forEach(picker => {
                if (!picker.initialized) {
                    picker.setAttribute('color', picker.getAttribute('color'));
                }
            });
        }, 100);
    }

    initEventListeners() {
    const header = this.panel.querySelector('.panel-header');
    const panel = this.panel;

    // Panel controls
    this.panel.querySelector('.close-btn').addEventListener('click', () => this.hidePanel());
    this.panel.querySelector('.minimize-btn').addEventListener('click', () => this.toggleMinimize());
    
    // Mouse events for dragging
    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.header-controls') || e.target.closest('.panel-resize-handle')) {
            return;
        }
        this.startDragging(e);
    });
    
    document.addEventListener('mousemove', (e) => this.handleDragging(e));
    document.addEventListener('mouseup', () => this.stopDragging());

    // Touch events for dragging
    header.addEventListener('touchstart', (e) => {
        if (e.target.closest('.header-controls')) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        this.startDragging(touch);
        panel.classList.add('dragging');
    });

    document.addEventListener('touchmove', (e) => {
        if (!this.isDragging) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        this.handleDragging(touch);
    }, { passive: false });

    document.addEventListener('touchend', () => {
        panel.classList.remove('dragging');
        this.stopDragging();
    });

    // 调整大小的事件处理
    const resizeHandle = panel.querySelector('.panel-resize-handle');
    
    // Mouse events for resizing
    resizeHandle.addEventListener('mousedown', (e) => this.startResizing(e));
    document.addEventListener('mousemove', (e) => this.handleResizing(e));
    document.addEventListener('mouseup', () => this.stopResizing());

    // Touch events for resizing
    resizeHandle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        this.startResizing(touch);
        panel.classList.add('resizing');
    });

    document.addEventListener('touchmove', (e) => {
        if (!this.isResizing) return;
        
        e.preventDefault();
        const touch = e.touches[0];
        this.handleResizing(touch);
    }, { passive: false });

    document.addEventListener('touchend', () => {
        panel.classList.remove('resizing');
        this.stopResizing();
    });

    // Style controls
    const characterSelect = this.panel.querySelector('#character-select');
    characterSelect.addEventListener('change', () => this.onCharacterSelect());

    const backgroundType = this.panel.querySelector('#background-type');
    backgroundType.addEventListener('change', () => this.onBackgroundTypeChange());

    // Color pickers
    const colorPickers = this.panel.querySelectorAll('toolcool-color-picker');
    colorPickers.forEach(picker => {
        picker.addEventListener('change', () => this.applyStyles());
    });

    // Quote glow
    const glowEnabled = this.panel.querySelector('#quote-glow-enabled');
    glowEnabled.addEventListener('change', () => this.toggleQuoteGlow());

    // Padding inputs
    const paddingInputs = this.panel.querySelectorAll('.padding-input input');
    paddingInputs.forEach(input => {
        input.addEventListener('change', () => this.applyStyles());
    });

    // Tab switching
    this.panel.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            this.panel.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            this.panel.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            this.panel.querySelector(`.tab-content[data-tab="${tabName}"]`).classList.add('active');
        });
    });

    // Save and Reset buttons
    this.panel.querySelector('.save-btn').addEventListener('click', () => this.saveStyles());
    this.panel.querySelector('.reset-btn').addEventListener('click', () => {
        if (confirm('确定要重置当前角色的样式吗？')) {
            this.resetStyles();
        }
    });
}
      
const header = this.panel.querySelector('.panel-header');
    
    // Touch events for dragging
    header.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        this.startDragging(touch);
    });
    
    document.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        this.handleDragging(touch);
    });
    
    document.addEventListener('touchend', () => this.stopDragging());

    // Touch events for resizing
    const resizeHandle = this.panel.querySelector('.panel-resize-handle');
    
    resizeHandle.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        this.startResizing(touch);
    });
    
    document.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        this.handleResizing(touch);
    });
    
    document.addEventListener('touchend', () => this.stopResizing());
}
                          
    // Panel manipulation methods
    showPanel() {
        this.panel.style.display = 'block';
        this.refreshCharacterList();
    }

    hidePanel() {
        this.panel.style.display = 'none';
    }

   toggleMinimize() {
    const content = this.panel.querySelector('.panel-content');
    const minimizeBtn = this.panel.querySelector('.minimize-btn i');
    const panel = this.panel;
    
    if (panel.classList.contains('minimized')) {
        // 展开面板
        content.style.display = 'block';
        minimizeBtn.className = 'fa-solid fa-minus';
        panel.classList.remove('minimized');
        
        // 恢复之前的高度
        if (panel.dataset.originalHeight) {
            panel.style.height = panel.dataset.originalHeight;
        }
    } else {
        // 最小化面板
        content.style.display = 'none';
        minimizeBtn.className = 'fa-solid fa-plus';
        panel.classList.add('minimized');
        
        // 保存当前高度
        panel.dataset.originalHeight = panel.style.height;
        panel.style.height = 'auto';
    }
}

  startDragging(e) {
    // Don't start dragging if clicking buttons or resize handle
    if (e.target.closest('.header-controls') || e.target.closest('.panel-resize-handle')) {
        return;
    }
    
    this.isDragging = true;
    this.panel.style.transition = 'none'; // Disable transitions while dragging
    const rect = this.panel.getBoundingClientRect();
    this.dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

handleDragging(e) {
    if (!this.isDragging) return;

    const clientX = e.clientX || e.touches?.[0].clientX;
    const clientY = e.clientY || e.touches?.[0].clientY;

    if (typeof clientX === 'undefined' || typeof clientY === 'undefined') return;

    const x = clientX - this.dragOffset.x;
    const y = clientY - this.dragOffset.y;

    // 检查是否为移动设备
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // 移动端限制在屏幕内
        const panel = this.panel;
        const maxX = window.innerWidth - panel.offsetWidth;
        const maxY = window.innerHeight - panel.offsetHeight;
        
        panel.style.left = `${Math.max(0, Math.min(maxX, x))}px`;
        panel.style.top = `${Math.max(0, Math.min(maxY, y))}px`;
    } else {
        // PC端自由移动
        this.panel.style.left = `${x}px`;
        this.panel.style.top = `${y}px`;
    }
}


stopDragging() {
    if (this.isDragging) {
        this.isDragging = false;
        this.panel.style.transition = ''; // Re-enable transitions
    }
}

    startResizing(e) {
        this.isResizing = true;
        this.resizeStart = {
            width: this.panel.offsetWidth,
            height: this.panel.offsetHeight,
            x: e.clientX,
            y: e.clientY
        };
    }

handleResizing(e) {
    if (!this.isResizing) return;

    const clientX = e.clientX || e.touches?.[0].clientX;
    const clientY = e.clientY || e.touches?.[0].clientY;

    if (typeof clientX === 'undefined' || typeof clientY === 'undefined') return;

    const width = this.resizeStart.width + (clientX - this.resizeStart.x);
    const height = this.resizeStart.height + (clientY - this.resizeStart.y);

    // 检查是否为移动设备
    const isMobile = window.innerWidth <= 768;
    const minWidth = isMobile ? 280 : 320;
    const minHeight = 200;
    const maxWidth = isMobile ? window.innerWidth * 0.9 : window.innerWidth;
    const maxHeight = isMobile ? window.innerHeight * 0.8 : window.innerHeight;

    this.panel.style.width = `${Math.max(minWidth, Math.min(maxWidth, width))}px`;
    this.panel.style.height = `${Math.max(minHeight, Math.min(maxHeight, height))}px`;
}
    
    stopResizing() {
        this.isResizing = false;
    }

    // Style application methods
    refreshCharacterList() {
        const select = this.panel.querySelector('#character-select');
        select.innerHTML = '<option value="">选择角色...</option>';

        const characters = new Set();
        document.querySelectorAll('.mes').forEach(message => {
            const name = message.querySelector('.name_text')?.textContent?.trim();
            const isUser = message.getAttribute('is_user') === 'true';
            
            if (name && name !== '${characterName}') {
                const charId = `${isUser ? 'user' : 'char'}_${name}`;
                characters.add({ id: charId, name, isUser });
            }
        });

        [...characters].forEach(char => {
            const option = document.createElement('option');
            option.value = char.id;
            option.textContent = `${char.name} (${char.isUser ? '用户' : 'AI'})`;
            select.appendChild(option);
        });
    }

    onCharacterSelect() {
        const select = this.panel.querySelector('#character-select');
        this.currentCharacter = select.value;
        
        const styleControls = this.panel.querySelector('.style-controls');
        styleControls.style.display = this.currentCharacter ? 'block' : 'none';

        if (this.currentCharacter) {
            this.loadCharacterStyle();
        }
    }

    onBackgroundTypeChange() {
        const type = this.panel.querySelector('#background-type').value;
        const solidBg = this.panel.querySelector('#solid-background');
        const gradientBg = this.panel.querySelector('#gradient-background');

        solidBg.style.display = type === 'solid' ? 'block' : 'none';
        gradientBg.style.display = type === 'solid' ? 'none' : 'block';

        this.applyStyles();
    }

    toggleQuoteGlow() {
        const glowEnabled = this.panel.querySelector('#quote-glow-enabled').checked;
        const glowControls = this.panel.querySelector('#quote-glow-controls');
        glowControls.style.display = glowEnabled ? 'block' : 'none';
        this.applyStyles();
    }

    // Style management methods
    loadCharacterStyle() {
        if (!this.currentCharacter) return;

        const style = this.settings.styles[this.currentCharacter] || this.settings.defaultStyle;
        
        // Load background settings
        this.panel.querySelector('#background-type').value = style.background.type;
        this.panel.querySelector('#background-color').setAttribute('color', style.background.color);

        // Load text colors
        this.panel.querySelector('#main-text-color').setAttribute('color', style.text.main);
        this.panel.querySelector('#italics-text-color').setAttribute('color', style.text.italics);
        this.panel.querySelector('#quote-text-color').setAttribute('color', style.text.quote);

        // Load glow settings
        this.panel.querySelector('#quote-glow-enabled').checked = style.effects.quoteGlow.enabled;
        this.panel.querySelector('#quote-glow-color').setAttribute('color', style.effects.quoteGlow.color);
        this.panel.querySelector('#quote-glow-intensity').value = style.effects.quoteGlow.intensity;
        this.panel.querySelector('#quote-glow-controls').style.display = 
            style.effects.quoteGlow.enabled ? 'block' : 'none';

        // Load padding
const paddingInputs = this.panel.querySelectorAll('.padding-input input');
        paddingInputs[0].value = style.padding.top;
        paddingInputs[1].value = style.padding.right;
        paddingInputs[2].value = style.padding.bottom;
        paddingInputs[3].value = style.padding.left;

        this.applyStyles();
    }

    applyStyles() {
        if (!this.currentCharacter) return;

        const style = {
            background: {
                type: this.panel.querySelector('#background-type').value,
                color: this.panel.querySelector('#background-color').getAttribute('color'),
                gradient: this.getGradientSettings()
            },
            text: {
                main: this.panel.querySelector('#main-text-color').getAttribute('color'),
                italics: this.panel.querySelector('#italics-text-color').getAttribute('color'),
                quote: this.panel.querySelector('#quote-text-color').getAttribute('color')
            },
            effects: {
                quoteGlow: {
                    enabled: this.panel.querySelector('#quote-glow-enabled').checked,
                    color: this.panel.querySelector('#quote-glow-color').getAttribute('color'),
                    intensity: parseInt(this.panel.querySelector('#quote-glow-intensity').value)
                }
            },
            padding: this.getPaddingSettings()
        };

        this.settings.styles[this.currentCharacter] = style;
        this.updateMessageStyles(this.currentCharacter, style);
        this.saveSettings();
    }

    getGradientSettings() {
        if (this.panel.querySelector('#background-type').value === 'solid') return null;

        return {
            colors: Array.from(this.panel.querySelectorAll('.gradient-color')).map(picker => picker.getAttribute('color')),
            positions: Array.from(this.panel.querySelectorAll('.gradient-position')).map(input => parseInt(input.value)),
            angle: parseInt(this.panel.querySelector('.gradient-angle-slider').value)
        };
    }

    getPaddingSettings() {
        const inputs = this.panel.querySelectorAll('.padding-input input');
        return {
            top: parseInt(inputs[0].value),
            right: parseInt(inputs[1].value),
            bottom: parseInt(inputs[2].value),
            left: parseInt(inputs[3].value)
        };
    }

    updateMessageStyles(characterId, style) {
        document.querySelectorAll(`.mes[data-character="${characterId}"]`).forEach(message => {
            const mesBlock = message.querySelector('.mes_block');
            const mesText = message.querySelector('.mes_text');
            const nameText = message.querySelector('.name_text');
            const italics = mesText.querySelectorAll('em, i');
            const quotes = mesText.querySelectorAll('q');

            // Apply background
            if (style.background.type === 'solid') {
                mesBlock.style.background = style.background.color;
            } else {
                const gradType = style.background.type === 'linear' ? 'linear-gradient' : 'radial-gradient';
                const gradString = style.background.gradient.colors.map((color, i) => 
                    `${color} ${style.background.gradient.positions[i]}%`).join(', ');
                const angle = style.background.type === 'linear' ? `${style.background.gradient.angle}deg, ` : '';
                mesBlock.style.background = `${gradType}(${angle}${gradString})`;
            }

            // Apply text styles
            mesText.style.color = style.text.main;
            nameText.style.color = style.text.main;
            
            italics.forEach(el => {
                el.style.color = style.text.italics;
            });

            quotes.forEach(quote => {
                quote.style.color = style.text.quote;
                if (style.effects.quoteGlow.enabled) {
                    quote.style.textShadow = `0 0 ${style.effects.quoteGlow.intensity}px ${style.effects.quoteGlow.color}`;
                    quote.style.filter = `drop-shadow(0 0 ${style.effects.quoteGlow.intensity/2}px ${style.effects.quoteGlow.color})`;
                } else {
                    quote.style.textShadow = 'none';
                    quote.style.filter = 'none';
                }
            });

            // Apply padding
            mesBlock.style.padding = `${style.padding.top}px ${style.padding.right}px ${style.padding.bottom}px ${style.padding.left}px`;
        });
    }

    applyExistingStyles() {
        Object.entries(this.settings.styles).forEach(([characterId, style]) => {
            this.updateMessageStyles(characterId, style);
        });
    }

    saveSettings() {
        window.extension_settings[MODULE_NAME] = this.settings;
        if (window.saveSettingsDebounced) {
            window.saveSettingsDebounced();
        }
    }

saveStyles() {
    if (!this.currentCharacter) return;
    
    this.applyStyles();
    alert('样式已保存');
}

resetStyles() {
    if (!this.currentCharacter) return;
    
    delete this.settings.styles[this.currentCharacter];
    this.loadCharacterStyle();
    this.applyStyles();
}
        
}

// Create and register the extension
const chatStylist = new ChatStylist();
window.extensions = window.extensions || {};
window.extensions[MODULE_NAME] = chatStylist;

// Initialize when document is ready
jQuery(() => {
    chatStylist.init();
});
    
