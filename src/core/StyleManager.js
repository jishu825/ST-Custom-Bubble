// src/core/StyleManager.js

export class StyleManager {
    constructor() {
        this.currentCharacter = null;
        this.styleSheet = null;
    }

    async initialize() {
        this.styleSheet = this.createStyleSheet();
        this.refreshCharacterList();
    }

    createStyleSheet() {
        const style = document.createElement('style');
        style.id = 'chat-stylist-styles';
        document.head.appendChild(style);
        return style;
    }

    refreshCharacterList() {
        const select = document.getElementById('character-select');
        select.innerHTML = '<option value="">选择角色...</option>';

        const characters = new Map();
        document.querySelectorAll(".mes").forEach(message => {
            const author = this.getMessageAuthor(message);
            if (author && !characters.has(author.uid)) {
                characters.set(author.uid, author);
            }
        });

        characters.forEach(char => {
            const option = document.createElement('option');
            option.value = char.uid;
            option.textContent = `${char.name} (${char.type === "persona" ? "用户" : "AI"})`;
            select.appendChild(option);
        });
    }

    getMessageAuthor(message) {
        const avatarImg = message.querySelector(".mesAvatarWrapper > .avatar > img");
        if (!avatarImg) return null;

        const avatarSrc = avatarImg.getAttribute("src");
        const isUser = message.getAttribute("is_user") === "true";
        
        const nameElem = message.querySelector(".name_text");
        const characterName = nameElem ? nameElem.textContent.trim() : null;

        if (!characterName || characterName === "${characterName}") return null;

        return {
            type: isUser ? "persona" : "character",
            name: characterName,
            avatarSrc: avatarSrc,
            uid: `${isUser ? "persona" : "character"}|${avatarSrc}`
        };
    }

    applyStyle(character, style) {
        const rules = this.generateStyleRules(character, style);
        this.updateStyleSheet(rules);
    }

    generateStyleRules(character, style) {
        return `
            .mes[data-author="${character}"] .mes_block {
                background: ${this.generateBackgroundStyle(style.background)};
                padding: ${style.padding.top}px ${style.padding.right}px ${style.padding.bottom}px ${style.padding.left}px;
            }

            .mes[data-author="${character}"] .mes_text {
                color: ${style.text.main};
            }

            .mes[data-author="${character}"] .mes_text em,
            .mes[data-author="${character}"] .mes_text i {
                color: ${style.text.italics};
            }

            .mes[data-author="${character}"] .mes_text q {
                color: ${style.text.quote};
                ${this.generateQuoteEffects(style.quoteEffects)}
            }

            .mes[data-author="${character}"] .name_text,
            .mes[data-author="${character}"] .mes_buttons .mes_button,
            .mes[data-author="${character}"] .mes_edit_buttons .menu_button {
                color: ${style.text.main};
            }
        `;
    }

    generateBackgroundStyle(background) {
        if (background.gradient) {
            return background.gradient;
        }
        return background.color;
    }

    generateQuoteEffects(effects) {
        if (!effects.glow.enabled) return '';
        
        return `
            text-shadow: 0 0 ${effects.glow.intensity}px ${effects.glow.color};
            filter: drop-shadow(0 0 ${effects.glow.intensity/2}px ${effects.glow.color});
        `;
    }

    updateStyleSheet(rules) {
        if (!this.styleSheet.sheet) return;
        
        // Remove existing rules
        while (this.styleSheet.sheet.cssRules.length > 0) {
            this.styleSheet.sheet.deleteRule(0);
        }
        
        // Add new rules
        this.styleSheet.sheet.insertRule(rules, 0);
    }
}
