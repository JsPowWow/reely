import { describe, it, expect } from 'vitest';

import {
  hexToRgb,
  rgbToHex,
  darken,
  lighten,
  isValidHex,
  isValidRgb,
  getContrastRatio,
  withAlpha,
  mix,
  parseColor,
  randomHex,
  rgbToHsl,
} from './colors.js';

describe('colors', () => {
  describe('hexToRgb', () => {
    it('should convert 6-digit hex to RGB', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should convert 3-digit hex to RGB', () => {
      expect(hexToRgb('#F00')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#0F0')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#00F')).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb('#FFF')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should handle hex without hash', () => {
      expect(hexToRgb('FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('F00')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should handle lowercase hex', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#aabbcc')).toEqual({ r: 170, g: 187, b: 204 });
    });

    it('should throw error for invalid hex', () => {
      expect(() => hexToRgb('invalid')).toThrow('Invalid hex color');
      expect(() => hexToRgb('#GGGGGG')).toThrow('Invalid hex color');
      expect(() => hexToRgb('#FF')).toThrow('Invalid hex color');
      expect(() => hexToRgb('#FFFFFFF')).toThrow('Invalid hex color');
      expect(() => hexToRgb('')).toThrow('Invalid hex color');
    });
  });

  describe('rgbToHex', () => {
    it('should convert RGB to hex with separate parameters', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
      expect(rgbToHex(0, 255, 0)).toBe('#00ff00');
      expect(rgbToHex(0, 0, 255)).toBe('#0000ff');
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff');
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
    });

    it('should convert RGB object to hex', () => {
      expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000');
      expect(rgbToHex({ r: 0, g: 255, b: 0 })).toBe('#00ff00');
      expect(rgbToHex({ r: 0, g: 0, b: 255 })).toBe('#0000ff');
    });

    it('should pad single digit hex values', () => {
      expect(rgbToHex(1, 2, 3)).toBe('#010203');
      expect(rgbToHex(15, 15, 15)).toBe('#0f0f0f');
    });

    it('rounds a fractional channel, as mixing two colours gives', () => {
      expect(rgbToHex(127.5, 0, 0)).toBe('#800000');
      expect(rgbToHex({ r: 1.6, g: 0, b: 0 })).toBe('#020000');
    });

    it('throws for a channel outside 0–255, and says so', () => {
      const message = 'Each RGB channel must be a number from 0 to 255';
      expect(() => rgbToHex(256, 0, 0)).toThrow(message);
      expect(() => rgbToHex(-1, 0, 0)).toThrow(message);
      expect(() => rgbToHex(0, 0, Number.NaN)).toThrow(message);
      expect(() => rgbToHex({ r: 256, g: 0, b: 0 })).toThrow(message);
    });
  });

  describe('parseColor', () => {
    it('reads hex and the rgb() a computed style returns', () => {
      expect(parseColor('#abc')).toEqual({ r: 170, g: 187, b: 204 });
      expect(parseColor('#2563eb')).toEqual({ r: 37, g: 99, b: 235 });
      expect(parseColor('rgb(37, 99, 235)')).toEqual({ r: 37, g: 99, b: 235 });
      expect(parseColor('rgb(37 99 235)')).toEqual({ r: 37, g: 99, b: 235 });
    });

    it('reads rgba() and drops its alpha', () => {
      expect(parseColor('rgba(37, 99, 235, 0.5)')).toEqual({ r: 37, g: 99, b: 235 });
      expect(parseColor('rgb(37 99 235 / 50%)')).toEqual({ r: 37, g: 99, b: 235 });
    });

    it('reads around spaces, and rounds a fractional channel', () => {
      expect(parseColor(' #fff ')).toEqual({ r: 255, g: 255, b: 255 });
      expect(parseColor('rgb(12.4 99.6 235)')).toEqual({ r: 12, g: 100, b: 235 });
    });

    it('throws for what it cannot read', () => {
      expect(() => parseColor('red')).toThrow('Invalid color: red');
      expect(() => parseColor('abc')).toThrow('Invalid color');
      expect(() => parseColor('rgb(300, 0, 0)')).toThrow('Invalid color');
      expect(() => parseColor('rgb(1, 2)')).toThrow('Invalid color');
      expect(() => parseColor('rgb(1,,2,3)')).toThrow('Invalid color');
      expect(() => parseColor('rgb(1, 2 3)')).toThrow('Invalid color');
      expect(() => parseColor('rgb(1, 2, 3, junk)')).toThrow('Invalid color');
      expect(() => parseColor('rgb(0x10, 1e2, 3)')).toThrow('Invalid color');
      expect(() => parseColor(42 as unknown as string)).toThrow('Invalid color: 42');
    });
  });

  describe('mix', () => {
    it('blends two colours halfway by default', () => {
      expect(mix('#000000', '#ffffff')).toBe('#808080');
      expect(mix('#ff0000', 'rgb(0 0 255)')).toBe('#800080');
    });

    it('moves from the first colour to the second as the weight goes from 0 to 1', () => {
      expect(mix('#ff0000', '#0000ff', 0)).toBe('#ff0000');
      expect(mix('#ff0000', '#0000ff', 0.25)).toBe('#bf0040');
      expect(mix('#ff0000', '#0000ff', 1)).toBe('#0000ff');
    });

    it('throws for a weight outside 0–1', () => {
      expect(() => mix('#000', '#fff', 1.5)).toThrow('The weight must be from 0 to 1');
    });
  });

  describe('a colour from CSS', () => {
    it('is read the same way, hex with or without `#` or `rgb()`, by every function that takes a colour', () => {
      const brand = 'rgb(37 99 235)';

      expect(darken(brand, 10)).toBe(darken('#2563eb', 10));
      expect(lighten('rgba(37, 99, 235, 0.5)', 10)).toBe(lighten('#2563eb', 10));
      expect(getContrastRatio('rgb(255 255 255)', brand)).toBe(getContrastRatio('#ffffff', '#2563eb'));
      expect(darken('2563eb', 10)).toBe(darken('#2563eb', 10));
      expect(mix('000', 'fff')).toBe('#808080');
      expect(() => darken('red', 10)).toThrow('Invalid color: red');
      expect(() => getContrastRatio('#ffffff', 'oklch(0.5 0.1 250)')).toThrow('Invalid color');
    });
  });

  describe('withAlpha', () => {
    it('gives the colour with an alpha as `rgb(r g b / a)`, for a canvas stroke or shadow', () => {
      expect(withAlpha('#2563eb', 0.4)).toBe('rgb(37 99 235 / 0.4)');
      expect(withAlpha('rgb(37 99 235 / 0.9)', 0)).toBe('rgb(37 99 235 / 0)');
      expect(() => withAlpha('#2563eb', 1.5)).toThrow('The alpha must be from 0 to 1');
      expect(() => withAlpha('#2563eb', Number.NaN)).toThrow('The alpha must be from 0 to 1');
    });
  });

  describe('randomHex', () => {
    it('draws from the given source of randomness, so a seeded one repeats', () => {
      expect(randomHex(() => 0)).toBe('#000000');
      expect(randomHex(() => 0.999)).toBe('#ffffff');
      expect(randomHex(() => 1)).toBe('#ffffff');
      expect(randomHex()).toMatch(/^#[0-9a-f]{6}$/);
    });
  });

  describe('darken', () => {
    it('should darken color by percentage', () => {
      expect(darken('#FF0000', 50)).toBe('#800000');
      expect(darken('#FFFFFF', 20)).toBe('#cccccc');
      expect(darken('#808080', 50)).toBe('#404040');
    });

    it('should handle 0% darkening', () => {
      expect(darken('#FF0000', 0)).toBe('#ff0000');
      expect(darken('#FFFFFF', 0)).toBe('#ffffff');
    });

    it('should handle 100% darkening', () => {
      expect(darken('#FF0000', 100)).toBe('#000000');
      expect(darken('#FFFFFF', 100)).toBe('#000000');
    });

    it('should handle 3-digit hex', () => {
      expect(darken('#F00', 50)).toBe('#800000');
      expect(darken('#FFF', 20)).toBe('#cccccc');
    });

    it('should throw error for invalid percentage', () => {
      expect(() => darken('#FF0000', -1)).toThrow(
        'Percent must be between 0 and 100'
      );
      expect(() => darken('#FF0000', 101)).toThrow(
        'Percent must be between 0 and 100'
      );
    });

    it('should throw error for an invalid colour', () => {
      expect(() => darken('invalid', 50)).toThrow('Invalid color: invalid');
    });
  });

  describe('lighten', () => {
    it('should lighten color by percentage', () => {
      expect(lighten('#000000', 50)).toBe('#808080');
      expect(lighten('#800000', 50)).toBe('#c08080');
      expect(lighten('#404040', 50)).toBe('#a0a0a0');
    });

    it('should handle 0% lightening', () => {
      expect(lighten('#000000', 0)).toBe('#000000');
      expect(lighten('#FF0000', 0)).toBe('#ff0000');
    });

    it('should handle 100% lightening', () => {
      expect(lighten('#000000', 100)).toBe('#ffffff');
      expect(lighten('#FF0000', 100)).toBe('#ffffff');
    });

    it('should handle 3-digit hex', () => {
      expect(lighten('#000', 50)).toBe('#808080');
      expect(lighten('#800', 50)).toBe('#c48080');
    });

    it('should throw error for invalid percentage', () => {
      expect(() => lighten('#000000', -1)).toThrow(
        'Percent must be between 0 and 100'
      );
      expect(() => lighten('#000000', 101)).toThrow(
        'Percent must be between 0 and 100'
      );
    });

    it('should throw error for an invalid colour', () => {
      expect(() => lighten('invalid', 50)).toThrow('Invalid color: invalid');
    });
  });

  describe('isValidHex', () => {
    it('should validate correct hex colors', () => {
      expect(isValidHex('#FF0000')).toBe(true);
      expect(isValidHex('#000000')).toBe(true);
      expect(isValidHex('#FFFFFF')).toBe(true);
      expect(isValidHex('#F00')).toBe(true);
      expect(isValidHex('#000')).toBe(true);
      expect(isValidHex('#FFF')).toBe(true);
      expect(isValidHex('FF0000')).toBe(true);
      expect(isValidHex('F00')).toBe(true);
    });

    it('should validate lowercase hex colors', () => {
      expect(isValidHex('#ff0000')).toBe(true);
      expect(isValidHex('#aabbcc')).toBe(true);
      expect(isValidHex('deadbe')).toBe(true);
    });

    it('should reject invalid hex colors', () => {
      expect(isValidHex('#GGGGGG')).toBe(false);
      expect(isValidHex('#FF')).toBe(false);
      expect(isValidHex('#FFFFFFF')).toBe(false);
      expect(isValidHex('invalid')).toBe(false);
      expect(isValidHex('')).toBe(false);
      expect(isValidHex('#12345')).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(isValidHex(null)).toBe(false);
      expect(isValidHex(undefined)).toBe(false);
      expect(isValidHex(123)).toBe(false);
      expect(isValidHex({})).toBe(false);
      expect(isValidHex([])).toBe(false);
    });
  });

  describe('isValidRgb', () => {
    it('should validate correct RGB values with separate parameters', () => {
      expect(isValidRgb(0, 0, 0)).toBe(true);
      expect(isValidRgb(255, 255, 255)).toBe(true);
      expect(isValidRgb(128, 128, 128)).toBe(true);
      expect(isValidRgb(0, 128, 255)).toBe(true);
    });

    it('should validate correct RGB object', () => {
      expect(isValidRgb({ r: 0, g: 0, b: 0 })).toBe(true);
      expect(isValidRgb({ r: 255, g: 255, b: 255 })).toBe(true);
      expect(isValidRgb({ r: 128, g: 128, b: 128 })).toBe(true);
    });

    it('should reject invalid RGB values', () => {
      expect(isValidRgb(-1, 0, 0)).toBe(false);
      expect(isValidRgb(256, 0, 0)).toBe(false);
      expect(isValidRgb(0, -1, 0)).toBe(false);
      expect(isValidRgb(0, 256, 0)).toBe(false);
      expect(isValidRgb(0, 0, -1)).toBe(false);
      expect(isValidRgb(0, 0, 256)).toBe(false);
    });

    it('should reject non-integer values', () => {
      expect(isValidRgb(1.5, 0, 0)).toBe(false);
      expect(isValidRgb(0, 1.5, 0)).toBe(false);
      expect(isValidRgb(0, 0, 1.5)).toBe(false);
    });

    it('should reject incomplete RGB objects', () => {
      expect(isValidRgb({ r: 0 } as any)).toBe(false);
      expect(isValidRgb({ r: 0, g: 0 } as any)).toBe(false);
      expect(isValidRgb({} as any)).toBe(false);
    });

    it('should reject undefined values', () => {
      expect(isValidRgb(undefined as any, 0, 0)).toBe(false);
      expect(isValidRgb(0, undefined as any, 0)).toBe(false);
      expect(isValidRgb(0, 0, undefined as any)).toBe(false);
    });
  });

  describe('getContrastRatio', () => {
    it('should calculate contrast ratio between colors', () => {
      const blackWhite = getContrastRatio('#000000', '#FFFFFF');
      expect(blackWhite).toBeCloseTo(21, 1);

      const sameColor = getContrastRatio('#FF0000', '#FF0000');
      expect(sameColor).toBeCloseTo(1, 1);
    });

    it('should handle different color combinations', () => {
      const redGreen = getContrastRatio('#FF0000', '#00FF00');
      expect(redGreen).toBeGreaterThan(1);
      expect(redGreen).toBeLessThan(21);

      const blueYellow = getContrastRatio('#0000FF', '#FFFF00');
      expect(blueYellow).toBeGreaterThan(1);
      expect(blueYellow).toBeLessThan(21);
    });

    it('should be symmetric', () => {
      const ratio1 = getContrastRatio('#FF0000', '#00FF00');
      const ratio2 = getContrastRatio('#00FF00', '#FF0000');
      expect(ratio1).toBeCloseTo(ratio2, 5);
    });

    it('should handle 3-digit hex', () => {
      const ratio = getContrastRatio('#F00', '#0F0');
      expect(ratio).toBeGreaterThan(1);
      expect(ratio).toBeLessThan(21);
    });

    it('should meet WCAG AA standards for certain combinations', () => {
      const darkGrayWhite = getContrastRatio('#333333', '#FFFFFF');
      expect(darkGrayWhite).toBeGreaterThan(4.5);

      const lightGrayWhite = getContrastRatio('#CCCCCC', '#FFFFFF');
      expect(lightGrayWhite).toBeLessThan(4.5);
    });
  });

  describe('randomHex', () => {
    it('should generate valid hex color', () => {
      for (let i = 0; i < 10; i++) {
        const color = randomHex();
        expect(isValidHex(color)).toBe(true);
        expect(color).toMatch(/^#[0-9a-f]{6}$/);
      }
    });

    it('should generate different colors', () => {
      const colors = new Set();
      for (let i = 0; i < 100; i++) {
        colors.add(randomHex());
      }
      expect(colors.size).toBeGreaterThan(50);
    });
  });

  describe('rgbToHsl', () => {
    it('should convert RGB to HSL with separate parameters', () => {
      const red = rgbToHsl(255, 0, 0);
      expect(red.h).toBe(0);
      expect(red.s).toBe(100);
      expect(red.l).toBe(50);

      const green = rgbToHsl(0, 255, 0);
      expect(green.h).toBe(120);
      expect(green.s).toBe(100);
      expect(green.l).toBe(50);

      const blue = rgbToHsl(0, 0, 255);
      expect(blue.h).toBe(240);
      expect(blue.s).toBe(100);
      expect(blue.l).toBe(50);
    });

    it('should convert RGB object to HSL', () => {
      const red = rgbToHsl({ r: 255, g: 0, b: 0 });
      expect(red.h).toBe(0);
      expect(red.s).toBe(100);
      expect(red.l).toBe(50);
    });

    it('should handle grayscale colors', () => {
      const black = rgbToHsl(0, 0, 0);
      expect(black.h).toBe(0);
      expect(black.s).toBe(0);
      expect(black.l).toBe(0);

      const white = rgbToHsl(255, 255, 255);
      expect(white.h).toBe(0);
      expect(white.s).toBe(0);
      expect(white.l).toBe(100);

      const gray = rgbToHsl(128, 128, 128);
      expect(gray.h).toBe(0);
      expect(gray.s).toBe(0);
      expect(gray.l).toBeCloseTo(50, 0);
    });

    it('should handle mixed colors', () => {
      const orange = rgbToHsl(255, 165, 0);
      expect(orange.h).toBeCloseTo(39, 0);
      expect(orange.s).toBe(100);
      expect(orange.l).toBe(50);

      const purple = rgbToHsl(128, 0, 128);
      expect(purple.h).toBe(300);
      expect(purple.s).toBe(100);
      expect(purple.l).toBeCloseTo(25, 0);

      const cyan = rgbToHsl(0, 255, 255);
      expect(cyan.h).toBe(180);
      expect(cyan.s).toBe(100);
      expect(cyan.l).toBe(50);
    });

    it('should handle edge cases', () => {
      const almostBlack = rgbToHsl(1, 1, 1);
      expect(almostBlack.l).toBeCloseTo(0, 0);

      const almostWhite = rgbToHsl(254, 254, 254);
      expect(almostWhite.l).toBeCloseTo(100, 0);
    });
  });

  describe('integration tests', () => {
    it('should round-trip hex to RGB and back', () => {
      const originalHex = '#FF8040';
      const rgb = hexToRgb(originalHex);
      const convertedHex = rgbToHex(rgb);
      expect(convertedHex.toLowerCase()).toBe(originalHex.toLowerCase());
    });

    it('should darken and lighten to opposite effects', () => {
      const original = '#808080';
      const darkened = darken(original, 25);
      const lightened = lighten(original, 25);

      const darkenedRgb = hexToRgb(darkened);
      const lightenedRgb = hexToRgb(lightened);
      const originalRgb = hexToRgb(original);

      expect(darkenedRgb.r).toBeLessThan(originalRgb.r);
      expect(darkenedRgb.g).toBeLessThan(originalRgb.g);
      expect(darkenedRgb.b).toBeLessThan(originalRgb.b);

      expect(lightenedRgb.r).toBeGreaterThan(originalRgb.r);
      expect(lightenedRgb.g).toBeGreaterThan(originalRgb.g);
      expect(lightenedRgb.b).toBeGreaterThan(originalRgb.b);
    });

    it('should maintain color relationships through transformations', () => {
      const color1 = '#FF0000';
      const color2 = '#00FF00';

      const contrast1 = getContrastRatio(color1, color2);

      const darkColor1 = darken(color1, 20);
      const darkColor2 = darken(color2, 20);

      const contrast2 = getContrastRatio(darkColor1, darkColor2);

      expect(contrast1).toBeGreaterThan(1);
      expect(contrast2).toBeGreaterThan(1);
    });
  });
});
