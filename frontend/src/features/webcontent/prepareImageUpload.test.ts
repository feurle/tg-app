import { describe, expect, it } from 'vitest';
import { planUpload, prepareImageUpload, scaledSize, withExtension } from './prepareImageUpload';

describe('scaledSize', () => {
    it('scales the longest edge down to 1600 px and keeps the aspect ratio', () => {
        expect(scaledSize(4032, 3024)).toEqual({ width: 1600, height: 1200 });
        expect(scaledSize(3024, 4032)).toEqual({ width: 1200, height: 1600 });
    });

    it('never scales up', () => {
        expect(scaledSize(1200, 900)).toEqual({ width: 1200, height: 900 });
    });
});

describe('planUpload', () => {
    it('keeps a JPEG or WebP that is small enough', () => {
        expect(planUpload('image/jpeg', 1600, 1200, false)).toEqual({ action: 'keep' });
        expect(planUpload('image/webp', 800, 600, false)).toEqual({ action: 'keep' });
    });

    it('re-encodes large photos as JPEG', () => {
        expect(planUpload('image/jpeg', 4032, 3024, false)).toEqual({ action: 'encode', type: 'image/jpeg' });
        expect(planUpload('image/webp', 2000, 1000, false)).toEqual({ action: 'encode', type: 'image/jpeg' });
    });

    it('turns an opaque PNG into a JPEG, even when it is small', () => {
        expect(planUpload('image/png', 800, 600, false)).toEqual({ action: 'encode', type: 'image/jpeg' });
    });

    it('keeps transparency as PNG and only scales it down', () => {
        expect(planUpload('image/png', 800, 600, true)).toEqual({ action: 'keep' });
        expect(planUpload('image/png', 3000, 3000, true)).toEqual({ action: 'encode', type: 'image/png' });
    });
});

describe('withExtension', () => {
    it('replaces the extension', () => {
        expect(withExtension('IMG_1234.PNG', 'image/jpeg')).toBe('IMG_1234.jpg');
        expect(withExtension('logo.webp', 'image/png')).toBe('logo.png');
    });

    it('adds one if there is none', () => {
        expect(withExtension('photo', 'image/jpeg')).toBe('photo.jpg');
    });
});

describe('prepareImageUpload', () => {
    it('passes files of other types through unchanged', async () => {
        const svg = new File(['<svg/>'], 'logo.svg', { type: 'image/svg+xml' });
        await expect(prepareImageUpload(svg)).resolves.toBe(svg);
    });

    it('passes a file through unchanged when it cannot be decoded', async () => {
        // jsdom has no createImageBitmap, which is the same as a browser failing to decode the file
        const jpeg = new File(['not really a jpeg'], 'photo.jpg', { type: 'image/jpeg' });
        await expect(prepareImageUpload(jpeg)).resolves.toBe(jpeg);
    });
});
