/** Types the backend accepts, see `ImageService.ALLOWED_MIME_TYPES`. */
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Longest edge of an uploaded image in pixels. Larger photos are scaled down before the upload. */
export const MAX_IMAGE_EDGE = 1600;

const JPEG_QUALITY = 0.82;

/** Edge length of the copy used to look for transparent pixels. */
const ALPHA_PROBE_EDGE = 256;

export type UploadPlan =
    | { action: 'keep' }
    | { action: 'encode'; type: 'image/jpeg' | 'image/png' };

export function scaledSize(width: number, height: number, maxEdge = MAX_IMAGE_EDGE) {
    const scale = Math.min(1, maxEdge / Math.max(width, height));
    return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/**
 * Decides whether a picked file is uploaded as is or re-encoded. Photos end up as JPEG, images with
 * transparency stay PNG (JPEG would turn the transparent areas black). A file that is small enough
 * already is kept, so it is not compressed twice.
 */
export function planUpload(type: string, width: number, height: number, hasAlpha: boolean): UploadPlan {
    const tooLarge = Math.max(width, height) > MAX_IMAGE_EDGE;
    if (hasAlpha) return tooLarge ? { action: 'encode', type: 'image/png' } : { action: 'keep' };
    if (type === 'image/png' || tooLarge) return { action: 'encode', type: 'image/jpeg' };
    return { action: 'keep' };
}

export function withExtension(fileName: string, type: 'image/jpeg' | 'image/png') {
    const base = fileName.replace(/\.[^./]+$/, '');
    return `${base}.${type === 'image/png' ? 'png' : 'jpg'}`;
}

/**
 * Scales a picked image down to {@link MAX_IMAGE_EDGE} and re-encodes it as described in
 * {@link planUpload}. Re-encoding also drops the metadata (e.g. the GPS position of a phone photo).
 * Returns the original file if it is not a supported image, cannot be decoded or would not get
 * smaller; the backend then decides.
 */
export async function prepareImageUpload(file: File): Promise<File> {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return file;

    let bitmap: ImageBitmap;
    try {
        bitmap = await createImageBitmap(file);
    } catch {
        return file;
    }

    try {
        const hasAlpha = file.type !== 'image/jpeg' && hasTransparentPixels(bitmap);
        const plan = planUpload(file.type, bitmap.width, bitmap.height, hasAlpha);
        if (plan.action === 'keep') return file;

        const { width, height } = scaledSize(bitmap.width, bitmap.height);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) return file;
        context.imageSmoothingQuality = 'high';
        context.drawImage(bitmap, 0, 0, width, height);

        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, plan.type, JPEG_QUALITY));
        if (!blob || blob.size >= file.size) return file;
        return new File([blob], withExtension(file.name, plan.type), { type: plan.type, lastModified: file.lastModified });
    } finally {
        bitmap.close();
    }
}

function hasTransparentPixels(bitmap: ImageBitmap): boolean {
    const { width, height } = scaledSize(bitmap.width, bitmap.height, ALPHA_PROBE_EDGE);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return true;
    context.drawImage(bitmap, 0, 0, width, height);
    const pixels = context.getImageData(0, 0, width, height).data;
    for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] < 255) return true;
    }
    return false;
}
