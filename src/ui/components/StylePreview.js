import { BaseComponent } from './BaseComponent.js';

export class StylePreview extends BaseComponent {
    constructor(eventManager) {
        super(eventManager);
        this.previewMessage = null;
    }

    createElement() {
        const wrapper = document.createElement('div');
        wrapper.className = 'style-preview-wrapper';

        const previewMessage = document.createElement('div');
        previewMessage.className = 'mes preview-message';
        previewMessage.innerHTML = `
            <div class="mes_block">
                <div class="mes_text">
                    这是一条示例消息
                    <em>这是斜体文本</em>
                    <q>这是引用文本</q>
                </div>
            </div>`;

        this.previewMessage = previewMessage;
        wrapper.appendChild(previewMessage);

        return wrapper;
    }

    updatePreview(styleConfig) {
        if (!this.previewMessage) return;

        const mesBlock = this.previewMessage.querySelector('.mes_block');
        const mesText = this.previewMessage.querySelector('.mes_text');

        // 应用气泡样式
        if (styleConfig.bubble) {
            const { background, border, padding } = styleConfig.bubble;
            
            // 背景
            if (background.type === 'solid') {
                mesBlock.style.background = background.color;
                mesBlock.style.opacity = background.opacity;
            } else {
                const gradientString = background.gradient.colors.map((color, i) => 
                    `${color} ${background.gradient.positions[i]}%`
                ).join(', ');
                mesBlock.style.background = `${background.type}-gradient(${background.gradient.angle}deg, ${gradientString})`;
            }

            // 边框
            mesBlock.style.border = `${border.width}px ${border.style} ${border.color}`;

            // 内边距
            mesBlock.style.padding = `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`;
        }

        // 应用文本样式
        if (styleConfig.text) {
            // 主要文本
            mesText.style.color = styleConfig.text.mainColor;

            // 斜体文本
            mesText.querySelectorAll('em').forEach(em => {
                em.style.color = styleConfig.text.italicColor;
            });

            // 引用文本
            mesText.querySelectorAll('q').forEach(q => {
                q.style.color = styleConfig.text.quoteColor;
                if (styleConfig.text.quote.glow.enabled) {
                    q.style.textShadow = `0 0 ${styleConfig.text.quote.glow.intensity}px ${styleConfig.text.quote.glow.color}`;
                } else {
                    q.style.textShadow = 'none';
                }
            });
        }
    }
}
