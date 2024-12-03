/**
 * SillyTavern Chat Stylist
 * Author: 既殊
 * Version: 1.0.0
 */

/**********************
 * Constants & Settings
 **********************/
const MODULE_NAME = 'chat-stylist';
const EXTENSION_READY_TIMEOUT = 30000;

// Default style settings
const DEFAULT_STYLE = {
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
};

// Initialize extension settings
if (!window.extension_settings) {
    window.extension_settings = {};
}

if (!window.extension_settings[MODULE_NAME]) {
    window.extension_settings[MODULE_NAME] = {
        styles: {},
        defaultStyle: DEFAULT_STYLE
    };
}

/****************
 * Style Manager
 ****************/
class StyleManager {
    constructor() {
        this.settings = window.extension_settings[MODULE_NAME];
    }

    getCharacterStyle(characterId) {
        return this.settings.styles[characterId] || this.settings.defaultStyle;
    }

    saveCharacterStyle(characterId, style) {
        this.settings.styles[characterId] = style;
        this.saveSettings();
    }

    deleteCharacterStyle(characterId) {
        delete this.settings.styles[characterId];
        this.saveSettings();
    }

    saveSettings() {
        window.extension_settings[MODULE_NAME] = this.settings;
        if (window.saveSettingsDebounced) {
            window.saveSettingsDebounced();
        }
    }

    updateMessageStyles(characterId, style) {
        document.querySelectorAll('.mes').forEach(message => {
            const name = message.querySelector('.name_text')?.textContent?.trim();
            const isUser = message.getAttribute('is_user') === 'true';
            const thisCharId = `${isUser ? 'user' : 'char'}_${name}`;

            if (thisCharId === characterId) {
                this.applyStylesToMessage(message, style);
            }
        });
    }

    applyStylesToMessage(message, style) {
        const mesBlock = message.querySelector('.mes_block');
        const mesText = message.querySelector('.mes_text');
        const nameText = message.querySelector('.name_text');

        // Apply background
        this.applyBackgroundStyle(mesBlock, style.background);

        // Apply text styles
        this.applyTextStyles(mesText, nameText, style.text);

        // Apply quote effects
        this.applyQuoteEffects(mesText, style.effects.quoteGlow);

        // Apply padding
        this.applyPadding(mesBlock, style.padding);
    }

    applyBackgroundStyle(element, bgStyle) {
        if (bgStyle.type === 'solid') {
            element.style.background = bgStyle.color;
        } else {
            const gradType = bgStyle.type === 'linear' ? 'linear-gradient' : 'radial-gradient';
            const gradString = bgStyle.gradient.colors.map((color, i) =>
                `${color} ${bgStyle.gradient.positions[i]}%`).join(', ');
            const angle = bgStyle.type === 'linear' ? `${bgStyle.gradient.angle}deg, ` : '';
            element.style.background = `${gradType}(${angle}${gradString})`;
        }
    }

    applyTextStyles(textElement, nameElement, textStyle) {
        textElement.style.color = textStyle.main;
        nameElement.style.color = textStyle.main;

        textElement.querySelectorAll('em, i').forEach(el => {
            el.style.color = textStyle.italics;
        });

        textElement.querySelectorAll('q').forEach(quote => {
            quote.style.color = textStyle.quote;
        });
    }

    applyQuoteEffects(textElement, glowStyle) {
        textElement.querySelectorAll('q').forEach(quote => {
            if (glowStyle.enabled) {
                quote.style.textShadow = `0 0 ${glowStyle.intensity}px ${glowStyle.color}`;
                quote.style.filter = `drop-shadow(0 0 ${glowStyle.intensity/2}px ${glowStyle.color})`;
            } else {
                quote.style.textShadow = 'none';
                quote.style.filter = 'none';
            }
        });
    }

    applyPadding(element, padding) {
        element.style.padding = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
    }
}

/*******************
 * UI Panel Manager
 *******************/
class PanelManager {
    constructor(styleManager) {
        this.styleManager = styleManager;
        this.panel = null;
        this.currentCharacter = null;
    }

    createPanel() {
        // Panel creation code here
        // (Previous panel HTML creation code)
    }

    showPanel() {
        if (!this.panel) {
            this.createPanel();
        }
        this.panel.style.display = 'block';
        this.refreshCharacterList();
    }

    hidePanel() {
        if (this.panel) {
            this.panel.style.display = 'none';
        }
    }

    // ... (继续添加其他面板管理方法)
}

/*****************
 * Event Handlers
 *****************/
class EventHandler {
    constructor(panelManager) {
        this.panelManager = panelManager;
    }

    setupEventListeners() {
        // Setup all event listeners
        // (Previous event listener setup code)
    }

    // ... (继续添加其他事件处理方法)
}

/******************
 * Drag & Resize
 ******************/
class DragResizeManager {
    constructor(panel) {
        this.panel = panel;
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        this.resizeStart = { width: 0, height: 0, x: 0, y: 0 };
    }

    // ... (添加拖拽和缩放相关方法)
}

/*****************
 * Main Extension
 *****************/
class ChatStylist {
    constructor() {
        this.styleManager = new StyleManager();
        this.panelManager = new PanelManager(this.styleManager);
        this.eventHandler = new EventHandler(this.panelManager);
    }

    async init() {
        try {
            await this.waitForExtensionSettings();
            this.addExtensionButton();
            this.eventHandler.setupEventListeners();
            console.log('Chat Stylist initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Chat Stylist:', error);
        }
    }

    async waitForExtensionSettings() {
        const startTime = Date.now();
        while (!document.getElementById('extensions_settings2')) {
            if (Date.now() - startTime > EXTENSION_READY_TIMEOUT) {
                throw new Error('Extension settings panel not found after timeout');
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    addExtensionButton() {
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

        $('#chat-stylist-button').on('click', () => {
            this.panelManager.showPanel();
        });
    }
}

// Create and initialize extension
const chatStylist = new ChatStylist();
window.extensions = window.extensions || {};
window.extensions[MODULE_NAME] = chatStylist;

// Initialize when document is ready
jQuery(async () => {
    try {
        console.log('Starting Chat Stylist initialization...');
        await chatStylist.init();
    } catch (error) {
        console.error('Failed to initialize Chat Stylist:', error);
    }
});

/*******************
 * UI Panel Manager
 *******************/
class PanelManager {
    constructor(styleManager) {
        this.styleManager = styleManager;
        this.panel = null;
        this.currentCharacter = null;
        this.dragResizeManager = null;
    }

    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'style-editor-panel';
        panel.className = 'style-editor-panel';
        panel.style.display = 'none';

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
                <!-- Character Selection -->
                <div class="control-group">
                    <label>选择角色 / Select Character</label>
                    <select id="character-select" class="form-control">
                        <option value="">选择角色...</option>
                    </select>
                </div>

                <!-- Bubble Style Tab -->
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
            <div class="panel-resize-handle"></div>`;

        document.body.appendChild(panel);
        this.panel = panel;

        // Initialize drag-resize functionality
        this.dragResizeManager = new DragResizeManager(panel);

        // Initialize color pickers
        setTimeout(() => {
            panel.querySelectorAll('toolcool-color-picker').forEach(picker => {
                if (!picker.initialized) {
                    picker.setAttribute('color', picker.getAttribute('color'));
                }
            });
        }, 100);

        return panel;
    }

    showPanel() {
        if (!this.panel) {
            this.createPanel();
        }
        this.panel.style.display = 'block';
        this.refreshCharacterList();
    }

    hidePanel() {
        if (this.panel) {
            this.panel.style.display = 'none';
        }
    }

    toggleMinimize() {
        const content = this.panel.querySelector('.panel-content');
        const resizeHandle = this.panel.querySelector('.panel-resize-handle');
        const minimizeBtn = this.panel.querySelector('.minimize-btn i');

        if (this.panel.classList.contains('minimized')) {
            content.style.display = 'block';
            resizeHandle.style.display = 'block';
            minimizeBtn.className = 'fa-solid fa-minus';
            this.panel.classList.remove('minimized');

            if (this.panel.dataset.originalHeight) {
                this.panel.style.height = this.panel.dataset.originalHeight;
            }
        } else {
            content.style.display = 'none';
            resizeHandle.style.display = 'none';
            minimizeBtn.className = 'fa-solid fa-plus';
            this.panel.classList.add('minimized');

            this.panel.dataset.originalHeight = this.panel.style.height;
            this.panel.style.height = '40px';
        }
    }

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

    getCurrentStyle() {
        if (!this.currentCharacter) return null;

        const style = {
            background: this.getBackgroundStyle(),
            text: this.getTextStyle(),
            effects: this.getEffectsStyle(),
            padding: this.getPaddingStyle()
        };

        return style;
    }

    getBackgroundStyle() {
        const type = this.panel.querySelector('#background-type').value;
        const style = {
            type: type,
            color: this.panel.querySelector('#background-color').getAttribute('color')
        };

        if (type !== 'solid') {
            style.gradient = {
                colors: Array.from(this.panel.querySelectorAll('.gradient-color'))
                    .map(picker => picker.getAttribute('color')),
                positions: Array.from(this.panel.querySelectorAll('.gradient-position'))
                    .map(input => parseInt(input.value)),
                angle: parseInt(this.panel.querySelector('.gradient-angle-slider').value)
            };
        }

        return style;
    }

    getTextStyle() {
        return {
            main: this.panel.querySelector('#main-text-color').getAttribute('color'),
            italics: this.panel.querySelector('#italics-text-color').getAttribute('color'),
            quote: this.panel.querySelector('#quote-text-color').getAttribute('color')
        };
    }

    getEffectsStyle() {
        return {
            quoteGlow: {
                enabled: this.panel.querySelector('#quote-glow-enabled').checked,
                color: this.panel.querySelector('#quote-glow-color').getAttribute('color'),
                intensity: parseInt(this.panel.querySelector('#quote-glow-intensity').value)
            }
        };
    }

    getPaddingStyle() {
        return {
            top: parseInt(this.panel.querySelector('#padding-top').value),
            right: parseInt(this.panel.querySelector('#padding-right').value),
            bottom: parseInt(this.panel.querySelector('#padding-bottom').value),
            left: parseInt(this.panel.querySelector('#padding-left').value)
        };
    }

    loadStyle(style) {
        if (!style) return;

        // Load background style
        this.panel.querySelector('#background-type').value = style.background.type;
        this.panel.querySelector('#background-color').setAttribute('color', style.background.color);

        const solidBg = this.panel.querySelector('#solid-background');
        const gradientBg = this.panel.querySelector('#gradient-background');
        
        if (style.background.type === 'solid') {
            solidBg.style.display = 'block';
            gradientBg.style.display = 'none';
        } else {
            solidBg.style.display = 'none';
            gradientBg.style.display = 'block';
            
            const gradientColors = this.panel.querySelectorAll('.gradient-color');
            const gradientPositions = this.panel.querySelectorAll('.gradient-position');
            
            style.background.gradient.colors.forEach((color, i) => {
                if (gradientColors[i]) {
                    gradientColors[i].setAttribute('color', color);
                }
            });
            
            style.background.gradient.positions.forEach((pos, i) => {
                if (gradientPositions[i]) {
                    gradientPositions[i].value = pos;
                }
            });
            
            this.panel.querySelector('.gradient-angle-slider').value = style.background.gradient.angle;
            this.panel.querySelector('.angle-value').textContent = `${style.background.gradient.angle}°`;
        }

        // Load text styles
        this.panel.querySelector('#main-text-color').setAttribute('color', style.text.main);
        this.panel.querySelector('#italics-text-color').setAttribute('color', style.text.italics);
        this.panel.querySelector('#quote-text-color').setAttribute('color', style.text.quote);

        // Load effects
        const quoteGlowEnabled = this.panel.querySelector('#quote-glow-enabled');
        const quoteGlowControls = this.panel.querySelector('#quote-glow-controls');
        
        quoteGlowEnabled.checked = style.effects.quoteGlow.enabled;
        quoteGlowControls.style.display = style.effects.quoteGlow.enabled ? 'block' : 'none';
        
        this.panel.querySelector('#quote-glow-color').setAttribute('color', style.effects.quoteGlow.color);
        this.panel.querySelector('#quote-glow-intensity').value = style.effects.quoteGlow.intensity;
        this.panel.querySelector('.intensity-value').textContent = style.effects.quoteGlow.intensity;

        // Load padding
        this.panel.querySelector('#padding-top').value = style.padding.top;
        this.panel.querySelector('#padding-right').value = style.padding.right;
        this.panel.querySelector('#padding-bottom').value = style.padding.bottom;
        this.panel.querySelector('#padding-left').value = style.padding.left;
    }
}

/*****************
 * Event Handler
 *****************/
class EventHandler {
    constructor(panelManager) {
        this.panelManager = panelManager;
        this.styleManager = panelManager.styleManager;
    }

    setupEventListeners() {
        // Panel control events
        this.setupPanelControls();
        
        // Tab switching events
        this.setupTabEvents();
        
        // Background style events
        this.setupBackgroundEvents();
        
        // Text style events
        this.setupTextEvents();
        
        // Character selection events
        this.setupCharacterEvents();
        
        // Color picker events
        this.setupColorPickerEvents();
        
        // Save and reset events
        this.setupActionEvents();
    }

    setupPanelControls() {
        const panel = this.panelManager.panel;
        
        panel.querySelector('.close-btn').addEventListener('click', () => {
            this.panelManager.hidePanel();
        });

        panel.querySelector('.minimize-btn').addEventListener('click', () => {
            this.panelManager.toggleMinimize();
        });

        // Chat observer for character list updates
        const chatWindow = document.getElementById("chat");
        if (chatWindow) {
            const observer = new MutationObserver(() => {
                this.panelManager.refreshCharacterList();
            });

            observer.observe(chatWindow, {
                childList: true,
                subtree: true
            });
        }
    }

    setupTabEvents() {
        const panel = this.panelManager.panel;
        
        panel.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                panel.querySelectorAll('.tab-button').forEach(btn => 
                    btn.classList.remove('active'));
                button.classList.add('active');
                
                panel.querySelectorAll('.tab-content').forEach(content => 
                    content.classList.remove('active'));
                panel.querySelector(`.tab-content[data-tab="${tabName}"]`)
                    .classList.add('active');
            });
        });
    }

    setupBackgroundEvents() {
        const panel = this.panelManager.panel;
        
        // Background type switching
        panel.querySelector('#background-type').addEventListener('change', (e) => {
            const type = e.target.value;
            const solidBg = panel.querySelector('#solid-background');
            const gradientBg = panel.querySelector('#gradient-background');
            
            solidBg.style.display = type === 'solid' ? 'block' : 'none';
            gradientBg.style.display = type === 'solid' ? 'none' : 'block';
            
            this.updateStyles();
        });

        // Gradient angle slider
        const angleSlider = panel.querySelector('.gradient-angle-slider');
        const angleValue = panel.querySelector('.angle-value');
        
        angleSlider.addEventListener('input', (e) => {
            angleValue.textContent = `${e.target.value}°`;
            this.updateStyles();
        });

        // Gradient position inputs
        panel.querySelectorAll('.gradient-position').forEach(input => {
            input.addEventListener('change', () => this.updateStyles());
        });
    }

    setupTextEvents() {
        const panel = this.panelManager.panel;
        
        // Quote glow toggle
        const glowEnabled = panel.querySelector('#quote-glow-enabled');
        const glowControls = panel.querySelector('#quote-glow-controls');
        
        glowEnabled.addEventListener('change', () => {
            glowControls.style.display = glowEnabled.checked ? 'block' : 'none';
            this.updateStyles();
        });

        // Glow intensity slider
        const intensitySlider = panel.querySelector('#quote-glow-intensity');
        const intensityValue = panel.querySelector('.intensity-value');
        
        intensitySlider.addEventListener('input', (e) => {
            intensityValue.textContent = e.target.value;
            this.updateStyles();
        });
    }

    setupCharacterEvents() {
        const select = this.panelManager.panel.querySelector('#character-select');
        
        select.addEventListener('change', () => {
            this.panelManager.currentCharacter = select.value;
            if (this.panelManager.currentCharacter) {
                const style = this.styleManager.getCharacterStyle(
                    this.panelManager.currentCharacter
                );
                this.panelManager.loadStyle(style);
            }
        });
    }

    setupColorPickerEvents() {
        const panel = this.panelManager.panel;
        
        panel.querySelectorAll('toolcool-color-picker').forEach(picker => {
            picker.addEventListener('change', () => this.updateStyles());
        });
    }

    setupActionEvents() {
        const panel = this.panelManager.panel;
        
        // Save button
        panel.querySelector('.save-btn').addEventListener('click', () => {
            if (!this.panelManager.currentCharacter) {
                alert('请先选择一个角色！');
                return;
            }
            
            const style = this.panelManager.getCurrentStyle();
            this.styleManager.saveCharacterStyle(
                this.panelManager.currentCharacter, 
                style
            );
            alert('样式已保存');
        });

        // Reset button
        panel.querySelector('.reset-btn').addEventListener('click', () => {
            if (!this.panelManager.currentCharacter) {
                alert('请先选择一个角色！');
                return;
            }

            if (confirm('确定要重置当前角色的样式吗？')) {
                this.styleManager.deleteCharacterStyle(
                    this.panelManager.currentCharacter
                );
                const defaultStyle = this.styleManager.getCharacterStyle(
                    this.panelManager.currentCharacter
                );
                this.panelManager.loadStyle(defaultStyle);
                this.updateStyles();
            }
        });
    }

    updateStyles() {
        if (!this.panelManager.currentCharacter) return;
        
        const style = this.panelManager.getCurrentStyle();
        this.styleManager.updateMessageStyles(
            this.panelManager.currentCharacter, 
            style
        );
    }
}

/******************
 * Drag & Resize
 ******************/
class DragResizeManager {
    constructor(panel) {
        this.panel = panel;
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        this.resizeStart = { width: 0, height: 0, x: 0, y: 0 };
        
        this.setupDrag();
        this.setupResize();
    }

    setupDrag() {
        const header = this.panel.querySelector('.panel-header');

        // Mouse events
        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.header-controls') || 
                e.target.closest('.panel-resize-handle')) {
                return;
            }
            this.startDragging(e);
        });

        document.addEventListener('mousemove', (e) => this.handleDragging(e));
        document.addEventListener('mouseup', () => this.stopDragging());

        // Touch events
        header.addEventListener('touchstart', (e) => {
            if (e.target.closest('.header-controls')) return;
            
            e.preventDefault();
            const touch = e.touches[0];
            this.startDragging(touch);
        });

        document.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            
            e.preventDefault();
            const touch = e.touches[0];
            this.handleDragging(touch);
        }, { passive: false });

        document.addEventListener('touchend', () => this.stopDragging());
    }

    setupResize() {
        const resizeHandle = this.panel.querySelector('.panel-resize-handle');

        // Mouse events
        resizeHandle.addEventListener('mousedown', (e) => this.startResizing(e));

        document.addEventListener('mousemove', (e) => this.handleResizing(e));
        document.addEventListener('mouseup', () => this.stopResizing());

        // Touch events
        resizeHandle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.startResizing(touch);
        });

        document.addEventListener('touchmove', (e) => {
            if (!this.isResizing) return;
            
            e.preventDefault();
            const touch = e.touches[0];
            this.handleResizing(touch);
        }, { passive: false });

        document.addEventListener('touchend', () => this.stopResizing());
    }

    startDragging(e) {
        this.isDragging = true;
        this.panel.style.transition = 'none';
        const rect = this.panel.getBoundingClientRect();
        this.dragOffset = {
            x: (e.clientX || e.touches[0].clientX) - rect.left,
            y: (e.clientY || e.touches[0].clientY) - rect.top
        };
        this.panel.classList.add('dragging');
    }

    handleDragging(e) {
        if (!this.isDragging) return;

        const clientX = e.clientX || e.touches?.[0].clientX;
        const clientY = e.clientY || e.touches?.[0].clientY;

        if (typeof clientX === 'undefined' || 
            typeof clientY === 'undefined') return;

        const x = clientX - this.dragOffset.x;
        const y = clientY - this.dragOffset.y;

        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            const maxX = window.innerWidth - this.panel.offsetWidth;
            const maxY = window.innerHeight - this.panel.offsetHeight;
            
            this.panel.style.left = `${Math.max(0, Math.min(maxX, x))}px`;
            this.panel.style.top = `${Math.max(0, Math.min(maxY, y))}px`;
        } else {
            this.panel.style.left = `${x}px`;
            this.panel.style.top = `${y}px`;
        }
    }

    stopDragging() {
        if (this.isDragging) {
            this.isDragging = false;
            this.panel.style.transition = '';
            this.panel.classList.remove('dragging');
        }
    }

    startResizing(e) {
        this.isResizing = true;
        this.panel.classList.add('resizing');
        this.resizeStart = {
            width: this.panel.offsetWidth,
            height: this.panel.offsetHeight,
            x: e.clientX || e.touches[0].clientX,
            y: e.clientY || e.touches[0].clientY
        };
    }

    handleResizing(e) {
        if (!this.isResizing) return;

        const clientX = e.clientX || e.touches?.[0].clientX;
        const clientY = e.clientY || e.touches?.[0].clientY;

        if (typeof clientX === 'undefined' || 
            typeof clientY === 'undefined') return;

        const width = this.resizeStart.width + 
            (clientX - this.resizeStart.x);
        const height = this.resizeStart.height + 
            (clientY - this.resizeStart.y);

        const isMobile = window.innerWidth <= 768;
        const minWidth = isMobile ? 280 : 320;
        const minHeight = 200;
        const maxWidth = isMobile ? window.innerWidth * 0.9 : window.innerWidth;
        const maxHeight = isMobile ? window.innerHeight * 0.8 : window.innerHeight;

        this.panel.style.width = 
            `${Math.max(minWidth, Math.min(maxWidth, width))}px`;
        this.panel.style.height = 
            `${Math.max(minHeight, Math.min(maxHeight, height))}px`;
    }

    stopResizing() {
        if (this.isResizing) {
            this.isResizing = false;
            this.panel.classList.remove('resizing');
        }
    }
}
