export interface RgbColor {
    r: number;
    g: number;
    b: number;
}

export interface HslColor {
    h: number;
    s: number;
    l: number;
}

/** Accepts 3- or 6-digit hex, `#` optional; throws on anything else. */
export function hexToRgb(hex: string): RgbColor {
    if (!isValidHex(hex)) {
        throw new Error('Invalid hex color');
    }

    const cleanHex = hex.replace('#', '');

    const fullHex = cleanHex.length === 3
        ? cleanHex.split('').map(char => char + char).join('')
        : cleanHex;

    const bigint = parseInt(fullHex, 16);

    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

const isChannel = (n: number): boolean => Number.isFinite(n) && n >= 0 && n <= 255;

/** Lowercase `#rrggbb`, each channel rounded; throws unless each channel is a number from 0 to 255. */
export function rgbToHex(r: number, g: number, b: number): string;
export function rgbToHex(rgb: RgbColor): string;
export function rgbToHex(
    rOrRgb: number | RgbColor,
    g = Number.NaN,
    b = Number.NaN
): string {
    const channels = typeof rOrRgb === 'object' ? [rOrRgb.r, rOrRgb.g, rOrRgb.b] : [rOrRgb, g, b];

    if (!channels.every(isChannel)) {
        throw new Error('Each RGB channel must be a number from 0 to 255');
    }

    return `#${channels.map((n) => Math.round(n).toString(16).padStart(2, '0')).join('')}`;
}

const rgbFunction = /^rgba?\(([^)]*)\)$/i;

/** Reads `#rgb`, `#rrggbb`, and `rgb()`/`rgba()` with commas or spaces, as a computed style gives them; alpha is dropped. Throws on anything else. */
export function parseColor(css: string): RgbColor {
    if (hexPattern.test(css)) {
        return hexToRgb(css);
    }

    // r, g and b, then an optional alpha, split by commas, spaces or the `/` before the alpha
    const parts = rgbFunction.exec(css.trim())?.[1].split(/[\s,/]+/).filter(Boolean) ?? [];
    const [r, g, b] = parts.slice(0, 3).map(Number);

    if ((parts.length !== 3 && parts.length !== 4) || ![r, g, b].every(isChannel)) {
        throw new Error(`Invalid color: ${css}`);
    }

    return { r, g, b };
}

/** The colour `weight` of the way from `from` to `to` (0 gives `from`, 1 gives `to`), as `#rrggbb`; either colour as `parseColor` reads it. */
export function mix(from: string, to: string, weight = 0.5): string {
    if (!(weight >= 0 && weight <= 1)) {
        throw new Error('The weight must be from 0 to 1');
    }

    const a = parseColor(from);
    const b = parseColor(to);
    const blend = (x: number, y: number): number => x + (y - x) * weight;

    return rgbToHex(blend(a.r, b.r), blend(a.g, b.g), blend(a.b, b.b));
}

/** Moves each channel toward 0 by `percent` (0–100). */
export function darken(color: string, percent: number): string {
    if (!isValidHex(color)) {
        throw new Error('Invalid hex color');
    }
    if (percent < 0 || percent > 100) {
        throw new Error('Percent must be between 0 and 100');
    }

    const rgb = hexToRgb(color);
    const factor = 1 - (percent / 100);

    return rgbToHex(
        Math.round(rgb.r * factor),
        Math.round(rgb.g * factor),
        Math.round(rgb.b * factor)
    );
}

/** Moves each channel toward 255 by `percent` (0–100). */
export function lighten(color: string, percent: number): string {
    if (!isValidHex(color)) {
        throw new Error('Invalid hex color');
    }
    if (percent < 0 || percent > 100) {
        throw new Error('Percent must be between 0 and 100');
    }

    const rgb = hexToRgb(color);
    const factor = percent / 100;

    return rgbToHex(
        Math.round(rgb.r + (255 - rgb.r) * factor),
        Math.round(rgb.g + (255 - rgb.g) * factor),
        Math.round(rgb.b + (255 - rgb.b) * factor)
    );
}

const hexPattern = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export function isValidHex(color: unknown): color is string {
    if (typeof color !== 'string') return false;
    return hexPattern.test(color);
}

/** Whether each channel is an integer from 0 to 255. */
export function isValidRgb(r: number, g: number, b: number): boolean;
export function isValidRgb(rgb: Partial<RgbColor>): boolean;
export function isValidRgb(
    rOrRgb: number | Partial<RgbColor>,
    g?: number,
    b?: number
): boolean {
    let r: number | undefined;

    if (typeof rOrRgb === 'object') {
        ({ r, g, b } = rOrRgb);
    } else {
        r = rOrRgb;
    }

    const isValid = (n: number | undefined): n is number =>
        n !== undefined && Number.isInteger(n) && n >= 0 && n <= 255;

    return isValid(r) && isValid(g) && isValid(b);
}

/** The WCAG contrast ratio, from 1 to 21. */
export function getContrastRatio(color1: string, color2: string): number {
    const getLuminance = (rgb: RgbColor): number => {
        const toLinear = (val: number): number => {
            const normalized = val / 255;
            return normalized <= 0.03928
                ? normalized / 12.92
                : Math.pow((normalized + 0.055) / 1.055, 2.4);
        };

        const r = toLinear(rgb.r);
        const g = toLinear(rgb.g);
        const b = toLinear(rgb.b);

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const lum1 = getLuminance(hexToRgb(color1));
    const lum2 = getLuminance(hexToRgb(color2));

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
}

/** A random `#rrggbb`; pass a seeded `random` (values in [0, 1)) for a colour that repeats. */
export function randomHex(random: () => number = Math.random): string {
    const channel = (): number => Math.floor(random() * 256);
    return rgbToHex(channel(), channel(), channel());
}

/** Hue in degrees, saturation and lightness in percent, rounded. */
export function rgbToHsl(r: number, g: number, b: number): HslColor;
export function rgbToHsl(rgb: RgbColor): HslColor;
export function rgbToHsl(
    rOrRgb: number | RgbColor,
    g = Number.NaN,
    b = Number.NaN
): HslColor {
    let r: number;

    if (typeof rOrRgb === 'object') {
        ({ r, g, b } = rOrRgb);
    } else {
        r = rOrRgb;
    }

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}