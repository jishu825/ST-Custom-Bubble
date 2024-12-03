export class PanelInteraction {
    constructor(panel) {
        this.panel = panel;
        this.setupDrag();
        this.setupResize();
    }

    setupDrag() {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        const header = this.panel.querySelector('.panel-header');
        
        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            initialX = e.clientX - this.panel.offsetLeft;
            initialY = e.clientY - this.panel.offsetTop;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                
                currentX = Math.max(0, Math.min(currentX, window.innerWidth - this.panel.offsetWidth));
                currentY = Math.max(0, Math.min(currentY, window.innerHeight - this.panel.offsetHeight));
                
                this.panel.style.left = currentX + 'px';
                this.panel.style.top = currentY + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    setupResize() {
        let isResizing = false;
        let startWidth;
        let startHeight;
        let startX;
        let startY;

        const resizeHandle = this.panel.querySelector('.panel-resize-handle');
        
        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startWidth = this.panel.offsetWidth;
            startHeight = this.panel.offsetHeight;
            startX = e.clientX;
            startY = e.clientY;
            e.stopPropagation();
        });

        document.addEventListener('mousemove', (e) => {
            if (isResizing) {
                e.preventDefault();
                
                const newWidth = startWidth + (e.clientX - startX);
                const newHeight = startHeight + (e.clientY - startY);
                
                this.panel.style.width = Math.max(320, newWidth) + 'px';
                this.panel.style.height = Math.max(200, newHeight) + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
        });
    }
}
