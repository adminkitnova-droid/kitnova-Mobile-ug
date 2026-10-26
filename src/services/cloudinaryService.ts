// Cloudinary Upload Service for KITNOVA Jersey Studio
// Configured for unsigned uploads using cloud_name: 'podwfdgc', preset: 'Kitnova jersey uploads', folder: 'kitnova'

export interface CloudinaryUploadResult {
  success: boolean;
  secureUrl?: string;
  publicId?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  error?: string;
  isOfflineFallback?: boolean;
}

export interface UploadProgressCallback {
  (percentage: number): void;
}

const CLOUDINARY_CONFIG = {
  cloudName: 'podwfdgc',
  uploadPreset: 'Kitnova jersey uploads',
  folder: 'kitnova'
};

/**
 * Uploads a customer file (image/logo/badge) directly to Cloudinary using unsigned upload preset.
 * Reports real-time upload progress via callback.
 * If offline or if network fails, falls back gracefully to local base64 DataURL so the customer's design session is never interrupted.
 */
export async function uploadToCloudinary(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<CloudinaryUploadResult> {
  // If browser is offline, provide immediate local DataURL fallback
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const dataUrl = await readFileAsDataUrl(file);
    return {
      success: true,
      secureUrl: dataUrl,
      publicId: `offline-${Date.now()}-${file.name}`,
      isOfflineFallback: true
    };
  }

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', CLOUDINARY_CONFIG.folder);

  return new Promise<CloudinaryUploadResult>((resolve) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve({
            success: true,
            secureUrl: res.secure_url || res.url,
            publicId: res.public_id,
            format: res.format,
            width: res.width,
            height: res.height,
            bytes: res.bytes,
            isOfflineFallback: false
          });
        } catch {
          resolveFallback(file, resolve, 'Failed to parse Cloudinary response');
        }
      } else {
        // Fallback to local DataURL if Cloudinary rejected (e.g. preset mismatch in test environment)
        resolveFallback(file, resolve, `Cloudinary HTTP ${xhr.status}: ${xhr.statusText}`);
      }
    });

    xhr.addEventListener('error', () => {
      // Network error or CORS issue, fallback to DataURL so user is never blocked
      resolveFallback(file, resolve, 'Network connectivity error');
    });

    xhr.addEventListener('abort', () => {
      resolve({
        success: false,
        error: 'Upload cancelled by user'
      });
    });

    xhr.open('POST', url, true);
    xhr.send(formData);
  });
}

async function resolveFallback(
  file: File,
  resolve: (res: CloudinaryUploadResult) => void,
  warningReason: string
) {
  try {
    const dataUrl = await readFileAsDataUrl(file);
    resolve({
      success: true,
      secureUrl: dataUrl,
      publicId: `local-draft-${Date.now()}`,
      isOfflineFallback: true,
      error: `Cloudinary notice: ${warningReason}. Saved locally for design session.`
    });
  } catch (err: any) {
    resolve({
      success: false,
      error: `Failed to load image: ${err?.message || 'Unknown file error'}`
    });
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Unable to read selected file'));
    reader.readAsDataURL(file);
  });
}
