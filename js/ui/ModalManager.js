// Modal Manager for Disney Monopoly

class ModalManager {
    constructor() {
        this.overlay = null;
        this.content = null;
    }

    init() {
        this.overlay = document.getElementById('modal-overlay');
        this.content = document.getElementById('modal-content');

        // Close on overlay click
        this.overlay?.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });
    }

    show(options) {
        if (!this.overlay || !this.content) {
            this.init();
        }

        const { headerHtml, bodyHtml, buttons = [], landscape = false } = options;

        // Build buttons HTML
        const buttonsHtml = buttons.length > 0
            ? `<div class="modal-buttons">
                ${buttons.map(btn =>
                    `<button class="${btn.class || ''}" data-action="${btn.text}">${btn.text}</button>`
                ).join('')}
               </div>`
            : '';

        // Set modal content
        this.content.innerHTML = `
            ${headerHtml || ''}
            ${bodyHtml || ''}
            ${buttonsHtml}
        `;

        // Apply landscape class
        this.content.classList.toggle('landscape', landscape);

        // Add button event listeners
        buttons.forEach(btn => {
            const buttonEl = this.content.querySelector(`button[data-action="${btn.text}"]`);
            if (buttonEl && btn.action) {
                buttonEl.addEventListener('click', btn.action);
            }
        });

        // Show modal
        this.overlay.classList.add('visible');
    }

    close() {
        if (this.overlay) {
            this.overlay.classList.remove('visible');
        }
    }

    isOpen() {
        return this.overlay?.classList.contains('visible') || false;
    }
}

// Export singleton instance
export const modalManager = new ModalManager();

// Export convenience functions for compatibility
export function showModal(options) {
    modalManager.show(options);
}

export function closeModal() {
    modalManager.close();
}

export default modalManager;
