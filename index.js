import { extension_settings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";
import { eventSource, event_types } from "../../../../script.js";

// 默认样式配置
const defaultStyle = {
    bubble: {
        shape: 'round',
        background: {
            type: 'solid',
            color: '#ffffff',
            opacity: 1.0
        },
        border: {
            color: '#e0e0e0',
            width: 1,
            style: 'solid'
        },
        padding: {
            top: 15,
            right: 20,
            bottom: 15,
            left: 20
        }
    },
    text: {
        mainColor: '#000000',
        italicColor: '#666666',
        quoteColor: '#3388ff',
        quoteEffect: {
            enabled: false,
            glowColor: '#3388ff',
            radius: 2
        }
    }
};

class StyleEditor {
    constructor(chatStylist) {
        this.chatStylist = chatStylist;
        this.panel = null;
        this.currentTab = 'bubble';
        this.currentCharacter = null;
    }

    createPanel() {
        const panel = document.createElement('div');
        panel.className = 'chat-stylist-editor';
        panel.innerHTML = `
            <div class="character-select">
                <select id="styleCharacterSelect">
                    <option value="default">默认样式</option>
                    <option value="user">用户样式</option>
                    <option value="system">系统样式</option>
                    <optgroup label="角色样式" id="characterStyleOptions"></optgroup>
                </select>
            </div>

            <div class="editor-header">
                <div class="header-tabs">
                    <button class="tab-button active" data-tab="bubble">
                        <i class="fa-solid fa-message"></i>
                        气泡样式
                    </button>
                    <button class="tab-button" data-tab="text">
                        <i class="fa-solid fa-font"></i>
                        文本样式
                    </button>
                </div>
                <div class="header-actions">
                    <button class="action-button" id="editorSave">
                        <i class="fa-solid fa-save" title="保存样式"></i>
                    </button>
                    <button class="action-button" id="editorClose">
                        <i class="fa-solid fa-times" title="关闭"></i>
                    </button>
                </div>
            </div>

            <div class="editor-content">
                <div class="tab-content active" data-tab="bubble">
                    <div class="style-section">
                        <label>背景样式</label>
                        <div class="style-controls">
                            <select id="backgroundColor" class="style-select">
                                <option value="solid">纯色</option>
                                <option value="gradient">渐变</option>
                            </select>
                            <div class="color-control">
                                <input type="color" id="bubbleColor" value="#ffffff">
                                <input type="range" id="bubbleOpacity" min="0" max="100" value="100">
                            </div>
                        </div>
                    </div>

                    <div class="style-section">
                        <label>边框</label>
                        <div class="style-controls">
                            <input type="color" id="borderColor" value="#e0e0e0">
                            <input type="number" id="borderWidth" min="0" max="10" value="1">
                            <select id="borderStyle" class="style-select">
                                <option value="solid">实线</option>
                                <option value="dashed">虚线</option>
                                <option value="dotted">点线</option>
                            </select>
                        </div>
                    </div>

                    <div class="style-section">
                        <label>内边距</label>
                        <div class="padding-controls">
                            <div class="padding-input">
                                <input type="number" id="paddingTop" min="0" value="15">
                                <span>上</span>
                            </div>
                            <div class="padding-input">
                                <input type="number" id="paddingRight" min="0" value="20">
                                <span>右</span>
                            </div>
                            <div class="padding-input">
                                <input type="number" id="paddingBottom" min="0" value="15">
                                <span>下</span>
                            </div>
                            <div class="padding-input">
                                <input type="number" id="paddingLeft" min="0" value="20">
                                <span>左</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="tab-content" data-tab="text">
                    <div class="style-section">
                        <label>主要文本</label>
                        <div class="style-controls">
                            <input type="color" id="mainTextColor" value="#000000">
                        </div>
                    </div>

                    <div class="style-section">
                        <label>斜体文本</label>
                        <div class="style-controls">
                            <input type="color" id="italicTextColor" value="#666666">
                        </div>
                    </div>

                    <div class="style-section">
                        <label>引用文本</label>
                        <div class="style-controls quote-controls">
                            <input type="color" id="quoteTextColor" value="#3388ff">
                            <label class="checkbox-label">
                                <input type="checkbox" id="quoteGlowEnabled">
                                启用荧光效果
                            </label>
                            <div class="glow-controls">
                                <input type="color" id="quoteGlowColor" value="#3388ff">
                                <input type="range" id="quoteGlowRadius" min="1" max="20" value="2">
                                <span class="glow-value">2px</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="editor-preview">
                <div class="preview-message">
                    <div class="preview-bubble">
                        这是一条预览消息<br>
                        <em>这是斜体文本</em><br>
                        <q>这是引用文本</q>
                    </div>
                </div>
            </div>`;

        return panel;
    }

    show() {
        if (!this.panel) {
            this.panel = this.createPanel();
            document.body.appendChild(this.panel);
            this.initializeEvents();
            this.updateCharacterList();
        }

        this.panel.classList.add('show');
        this.updatePreview();
    }

    hide() {
        if (this.panel) {
            this.panel.classList.remove('show');
        }
    }

    updateCharacterList() {
        const characterOptions = this.panel.querySelector('#characterStyleOptions');
        characterOptions.innerHTML = '';

        // 获取当前聊天中的所有角色
        const characters = new Set();
        document.querySelectorAll('.mes').forEach(message => {
            if (message.getAttribute('is_user') !== 'true' && 
                message.getAttribute('is_system') !== 'true') {
                const name = message.querySelector('.name_text')?.textContent;
                const characterId = message.getAttribute('chid');
                if (name && characterId) {
                    characters.add({id: characterId, name: name});
                }
            }
        });

        // 添加角色选项
        for (const char of characters) {
            const option = document.createElement('option');
            option.value = char.id;
            option.textContent = char.name;
            characterOptions.appendChild(option);
        }
    }

    initializeEvents() {
        // 标签页切换
        this.panel.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                this.switchTab(button.dataset.tab);
            });
        });

        // 角色选择
        this.panel.querySelector('#styleCharacterSelect').addEventListener('change', (e) => {
            this.currentCharacter = e.target.value;
            this.loadCharacterStyle();
        });

        // 关闭按钮
        this.panel.querySelector('#editorClose').addEventListener('click', () => {
            this.hide();
        });

        // 保存按钮
        this.panel.querySelector('#editorSave').addEventListener('click', () => {
            this.saveStyles();
        });

        // 所有输入控件的实时预览
        this.panel.querySelectorAll('input, select').forEach(control => {
            control.addEventListener('input', () => {
                this.updatePreview();
                // 更新荧光效果值显示
                if (control.id === 'quoteGlowRadius') {
                    this.panel.querySelector('.glow-value').textContent = `${control.value}px`;
                }
            });
        });

        // 引用文本荧光效果切换
        this.panel.querySelector('#quoteGlowEnabled').addEventListener('change', (e) => {
            const glowControls = this.panel.querySelector('.glow-controls');
            glowControls.style.display = e.target.checked ? 'flex' : 'none';
            this.updatePreview();
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        this.panel.querySelectorAll('.tab-button').forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });
        this.panel.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.dataset.tab === tabName);
        });
    }

    getCurrentStyle() {
        return {
            bubble: {
                background: {
                    type: this.panel.querySelector('#backgroundColor').value,
                    color: this.panel.querySelector('#bubbleColor').value,
                    opacity: this.panel.querySelector('#bubbleOpacity').value / 100
                },
                border: {
                    color: this.panel.querySelector('#borderColor').value,
                    width: parseInt(this.panel.querySelector('#borderWidth').value),
                    style: this.panel.querySelector('#borderStyle').value
                },
                padding: {
                    top: parseInt(this.panel.querySelector('#paddingTop').value),
                    right: parseInt(this.panel.querySelector('#paddingRight').value),
                    bottom: parseInt(this.panel.querySelector('#paddingBottom').value),
                    left: parseInt(this.panel.querySelector('#paddingLeft').value)
                }
            },
            text: {
                mainColor: this.panel.querySelector('#mainTextColor').value,
                italicColor: this.panel.querySelector('#italicTextColor').value,
                quoteColor: this.panel.querySelector('#quoteTextColor').value,
                quoteEffect: {
                    enabled: this.panel.querySelector('#quoteGlowEnabled').checked,
                    glowColor: this.panel.querySelector('#quoteGlowColor').value,
                    radius: parseInt(this.panel.querySelector('#quoteGlowRadius').value)
                }
            }
        };
    }

    updatePreview() {
        const preview = this.panel.querySelector('.preview-bubble');
        const style = this.getCurrentStyle();

        // 应用气泡样式
        preview.style.background = style.bubble.background.color;
        preview.style.opacity = style.bubble.background.opacity;
        preview.style.border = `${style.bubble.border.width}px ${style.bubble.border.style} ${style.bubble.border.color}`;
        preview.style.padding = `${style.bubble.padding.top}px ${style.bubble.padding.right}px ${style.bubble.padding.bottom}px ${style.bubble.padding.left}px`;

        // 应用文本样式
        preview.style.color = style.text.mainColor;
        
        preview.querySelector('em').style.color = style.text.italicColor;
        
        const quoteText = preview.querySelector('q');
        quoteText.style.color = style.text.quoteColor;
        if (style.text.quoteEffect.enabled) {
            quoteText.style.textShadow = `0 0 ${style.text.quoteEffect.radius}px ${style.text.quoteEffect.glowColor}`;
        } else {
            quoteText.style.textShadow = 'none';
        }
    }

    loadCharacterStyle() {
        let style;
        if (this.currentCharacter === 'default') {
            style = this.chatStylist.settings.defaultStyle;
        } else if (this.currentCharacter === 'user') {
            style = this.chatStylist.settings.userStyle || this.chatStylist.settings.defaultStyle;
        } else if (this.currentCharacter === 'system') {
            style = this.chatStylist.settings.systemStyle || this.chatStylist.settings.defaultStyle;
        } else {
            style = this.chatStylist.settings.characterStyles[this.currentCharacter] || 
                   this.chatStylist.settings.defaultStyle;
        }

        // 加载样式到控件
        const { bubble, text } = style;
        
        // 气泡样式
        this.panel.querySelector('#backgroundColor').value = bubble.background.type;
        this.panel.querySelector('#bubbleColor').value = bubble.background.color;
        this.panel.querySelector('#bubbleOpacity').value = bubble.background.opacity * 100;
        this.panel.querySelector('#borderColor').value = bubble.border.color;
        this.panel.querySelector('#borderWidth').value = bubble.border.width;
        this.panel.querySelector('#borderStyle').value = bubble.border.style;
        this.panel.querySelector('#paddingTop').value = bubble.padding.top;
        this.panel.querySelector('#paddingRight').value = bubble.padding.right;
        this.panel.querySelector('#paddingBottom').value = bubble.padding.bottom;
        this.panel.querySelector('#paddingLeft').value = bubble.padding.left;

        // 文本样式
        this.panel.querySelector('#mainTextColor').value = text.mainColor;
        this.panel.querySelector('#italicTextColor').value = text.italicColor;
        this.panel.querySelector('#quoteTextColor').value = text.quoteColor;
        this.panel.querySelector('#quoteGlowEnabled').checked = text.quoteEffect.enabled;
        this.panel.querySelector('#quoteGlowColor').value = text.quoteEffect.glowColor;
        this.panel.querySelector('#quoteGlowRadius').value = text.quoteEffect.radius;
        this.panel.querySelector('.glow-controls').style.display = text.quoteEffect.enabled ? 'flex' : 'none';
        this.panel.querySelector('.glow-value').textContent = `${text.quoteEffect.radius}px`;

        this.updatePreview();
    }

    saveStyles() {
        const style = this.getCurrentStyle();
        
        if (this.currentCharacter === 'default') {
            this.chatStylist.settings.defaultStyle = style;
        } else if (this.currentCharacter === 'user') {
            this.chatStylist.settings.userStyle = style;
        } else if (this.currentCharacter === 'system') {
            this.chatStylist.settings.systemStyle = style;
        } else if (this.currentCharacter) {
            if (!this.chatStylist.settings.characterStyles) {
                this.chatStylist.settings.characterStyles = {};
            }
            this.chatStylist.settings.characterStyles[this.currentCharacter] = style;
        }

        this.chatStylist.saveSettings();
        this.hide();
    }
}

class ChatStylist {
    constructor() {
        this.settings = extension_settings.chat_stylist || {
            defaultStyle: defaultStyle,
            userStyle: null,
            systemStyle: null,
            characterStyles: {}
        };
        extension_settings.chat_stylist = this.settings;

        this.styleEditor = new StyleEditor(this);
        
        this.addSettings();
        this.bindEvents();
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
                        <div class="chat-stylist-controls">
                            <button id="chat-stylist-button" class="menu_button">
                                <i class="fa-solid fa-palette"></i>
                                <span>样式编辑器</span>
                            </button>
                            <button id="chat-stylist-defaults" class="menu_button" title="重置为默认样式">
                                <i class="fa-solid fa-rotate-left"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;

        $('#extensions_settings2').append(html);
        this.bindSettingsControls();
    }

    bindSettingsControls() {
        // 编辑器按钮事件
        $('#chat-stylist-button').on('click', () => {
            this.styleEditor.show();
        });

        // 重置按钮事件
        $('#chat-stylist-defaults').on('click', () => {
            if (confirm('确定要重置所有样式吗？')) {
                this.resetStyles();
            }
        });
    }

    bindEvents() {
        // 监听聊天变更事件
        eventSource.on(event_types.CHAT_CHANGED, () => {
            this.applyStylesToChat();
        });
    }

    applyStylesToChat() {
        document.querySelectorAll('.mes').forEach(message => {
            const isUser = message.getAttribute('is_user') === 'true';
            const isSystem = message.getAttribute('is_system') === 'true';
            
            let styleToApply;
            if (isUser) {
                styleToApply = this.settings.userStyle || this.settings.defaultStyle;
            } else if (isSystem) {
                styleToApply = this.settings.systemStyle || this.settings.defaultStyle;
            } else {
                const characterId = message.getAttribute('chid');
                styleToApply = this.settings.characterStyles[characterId] || this.settings.defaultStyle;
            }

            this.applyStyleToMessage(message, styleToApply);
        });
    }

    applyStyleToMessage(messageElement, style) {
        const mesBlock = messageElement.querySelector('.mes_block');
        const mesText = messageElement.querySelector('.mes_text');
        
        if (!mesBlock || !mesText) return;

        // 应用气泡样式
        const { bubble, text } = style;

        mesBlock.style.background = bubble.background.color;
        mesBlock.style.opacity = bubble.background.opacity;
        mesBlock.style.border = `${bubble.border.width}px ${bubble.border.style} ${bubble.border.color}`;
        mesBlock.style.padding = `${bubble.padding.top}px ${bubble.padding.right}px ${bubble.padding.bottom}px ${bubble.padding.left}px`;

        // 应用文本样式
        mesText.style.color = text.mainColor;
        
        mesText.querySelectorAll('em, i').forEach(em => {
            em.style.color = text.italicColor;
        });

        mesText.querySelectorAll('q').forEach(q => {
            q.style.color = text.quoteColor;
            if (text.quoteEffect.enabled) {
                q.style.textShadow = `0 0 ${text.quoteEffect.radius}px ${text.quoteEffect.glowColor}`;
            } else {
                q.style.textShadow = 'none';
            }
        });
    }

    saveSettings() {
        saveSettingsDebounced();
        this.applyStylesToChat();
    }

    resetStyles() {
        this.settings = {
            defaultStyle: defaultStyle,
            userStyle: null,
            systemStyle: null,
            characterStyles: {}
        };
        extension_settings.chat_stylist = this.settings;
        this.saveSettings();
    }
}

// 初始化扩展
jQuery(() => {
    window.chatStylist = new ChatStylist();
});
            
