// scripts/effects.js

export function setupEffects() {
    // Initialize effects system
    setupEffectHandlers();
}

export function applyDecoration(element) {
    const decorationType = document.getElementById('bubble-decoration').value;
    const decorationColor = document.getElementById('decoration-color-picker').color;
    const decorationIntensity = document.getElementById('decoration-intensity').value;

    removeExistingEffects(element);
    if (decorationType === 'none') return;

    setupEffectProperties(element, decorationColor, decorationIntensity);
    applySelectedEffect(element, decorationType);
}

function removeExistingEffects(element) {
    element.classList.remove(
        'watercolor-effect',
        'particles-effect',
        'sparkles-effect',
        'paper-effect',
        'neon-effect',
        'goldfoil-effect'
    );
    element.querySelectorAll('.particle, .sparkle').forEach(el => el.remove());
}

function setupEffectProperties(element, color, intensity) {
    element.style.setProperty('--decoration-color', color);
    element.style.setProperty('--decoration-intensity', intensity);
}

function applySelectedEffect(element, effectType) {
    element.classList.add(`${effectType}-effect`);
    
    switch (effectType) {
        case 'particles':
            createParticles(element);
            break;
        case 'sparkles':
            createSparkles(element);
            break;
    }
}

function createParticles(element) {
    const count = 20;
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 3}s`;
        element.appendChild(particle);
    }
}

function createSparkles(element) {
    const count = 15;
    for (let i = 0; i < count; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.top = `${Math.random() * 100}%`;
        sparkle.style.animationDelay = `${Math.random() * 1.5}s`;
        element.appendChild(sparkle);
    }
}

function setupEffectHandlers() {
    // Setup effect-related event listeners
    const decorationSelect = document.getElementById('bubble-decoration');
    const decorationOptions = document.getElementById('decoration-options');

    if (decorationSelect && decorationOptions) {
        decorationSelect.addEventListener('change', () => {
            decorationOptions.style.display = 
                decorationSelect.value === 'none' ? 'none' : 'block';
            updateBubbleStyles();
        });
    }
}
