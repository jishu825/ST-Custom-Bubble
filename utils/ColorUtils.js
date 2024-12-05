export class ColorUtils {
    static hexToRgba(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    static rgbaToHex(rgba) {
        const parts = rgba.match(/[\d.]+/g);
        if (!parts || parts.length < 3) return '#000000';
        
        const r = parseInt(parts[0]);
        const g = parseInt(parts[1]);
        const b = parseInt(parts[2]);
        
        const toHex = (n) => {
            const hex = n.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return '#' + toHex(r) + toHex(g) + toHex(b);
    }

    static createGradient(type, colors, positions, angle = 90) {
        const stops = colors.map((color, i) => `${color} ${positions[i]}%`).join(', ');
        return type === 'linear'
            ? `linear-gradient(${angle}deg, ${stops})`
            : `radial-gradient(circle, ${stops})`;
    }
}
