/**
 * SINGULARITY // CLOUDINARY CLIENT-SIDE INGEST SERVICE
 * Direct unsigned uploads using Cloudinary's client REST API with zero sensitive keys.
 */

import { getSystemConfig, ASPECT_RATIOS } from './config.js';

export class CloudinaryService {
    constructor() {
        this.updateConfig();
        window.addEventListener('singularity-config-updated', () => this.updateConfig());
    }

    updateConfig() {
        const sys = getSystemConfig();
        this.cloudName = sys.cloudinary.cloudName || 'demo';
        this.uploadPreset = sys.cloudinary.uploadPreset || 'orbital_unsigned';
        this.folder = sys.cloudinary.folder || 'singularity_archive';
        this.baseUrl = sys.cloudinary.baseDeliveryUrl || 'https://res.cloudinary.com';
    }

    /**
     * Uploads an image or video file directly to Cloudinary using an unsigned upload preset.
     * @param {File} file - The file to upload
     * @param {Object} options - { onProgress, tags, customPreset }
     * @returns {Promise<Object>} Metadata of the uploaded asset
     */
    async uploadFile(file, options = {}) {
        this.updateConfig();

        if (!this.cloudName || this.cloudName === 'demo') {
            console.warn('[CLOUDINARY] Cloud Name is set to default "demo". For live uploads, configure your Cloud Name and Unsigned Preset in the Admin Panel.');
        }

        const isVideo = (file.type && file.type.startsWith('video/')) || /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(file.name || '');
        const resourceType = isVideo ? 'video' : 'image';
        const preset = options.customPreset || this.uploadPreset;

        const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/upload`;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', preset);
        if (this.folder) {
            formData.append('folder', this.folder);
        }
        formData.append('tags', options.tags || 'singularity_monolith');

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', uploadUrl);
            xhr.timeout = 120000; // 2 minutes per file

            xhr.ontimeout = () => {
                reject(new Error('Cloudinary upload timed out after 120s. Check network connection.'));
            };

            // Progress tracking
            if (xhr.upload && options.onProgress) {
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        options.onProgress({
                            percent,
                            loaded: e.loaded,
                            total: e.total
                        });
                    }
                };
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const res = JSON.parse(xhr.responseText);
                        
                        // Detect closest aspect ratio from width and height
                        const detectedAspect = this.detectClosestAspectRatio(res.width, res.height);

                        resolve({
                            publicId: res.public_id,
                            secureUrl: res.secure_url,
                            resourceType: res.resource_type,
                            format: res.format,
                            width: res.width,
                            height: res.height,
                            duration: res.duration || null,
                            bytes: res.bytes,
                            detectedAspect,
                            optimizedUrl: this.buildUrl(res.public_id, {
                                resourceType: res.resource_type,
                                width: 1200
                            })
                        });
                    } catch (parseErr) {
                        reject(new Error('Failed to parse Cloudinary response: ' + parseErr.message));
                    }
                } else {
                    let errMsg = `Cloudinary upload failed with status ${xhr.status}`;
                    try {
                        const errRes = JSON.parse(xhr.responseText);
                        if (errRes.error && errRes.error.message) {
                            errMsg = errRes.error.message;
                        }
                    } catch (_) {}
                    reject(new Error(errMsg));
                }
            };

            xhr.onerror = () => {
                reject(new Error('Network error during Cloudinary upload. Verify CORS & upload preset configuration.'));
            };

            xhr.send(formData);
        });
    }

    /**
     * Builds an optimized Cloudinary delivery URL with f_auto, q_auto:best transformations.
     * @param {string} publicId - Cloudinary asset public ID
     * @param {Object} opts - { resourceType, width, height, crop }
     */
    buildUrl(publicId, opts = {}) {
        if (!publicId) return '';
        // If it's already an absolute URL (like an Unsplash fallback), return as is
        if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
            return publicId;
        }

        const type = opts.resourceType || 'image';
        const transforms = ['f_auto', 'q_auto:best'];

        if (opts.width && opts.height) {
            transforms.push(`w_${opts.width}`, `h_${opts.height}`, `c_${opts.crop || 'fill'}`);
        } else if (opts.width) {
            transforms.push(`w_${opts.width}`);
        }

        const transformStr = transforms.join(',');
        const ext = type === 'video' ? '.mp4' : '';

        // Strip any existing file extension from publicId if present
        const cleanId = publicId.replace(/\.[^/.]+$/, "");

        return `${this.baseUrl}/${this.cloudName}/${type}/upload/${transformStr}/${cleanId}${ext}`;
    }

    /**
     * Detects closest matching aspect ratio preset from dimensions.
     */
    detectClosestAspectRatio(width, height) {
        if (!width || !height) return '16:9';
        const targetRatio = width / height;
        let closestKey = '16:9';
        let minDiff = Infinity;

        for (const [key, preset] of Object.entries(ASPECT_RATIOS)) {
            const diff = Math.abs(preset.ratio - targetRatio);
            if (diff < minDiff) {
                minDiff = diff;
                closestKey = key;
            }
        }
        return closestKey;
    }

    /**
     * Analyzes a local File object to detect its aspect ratio and dimensions before uploading.
     */
    async analyzeLocalMedia(file) {
        return new Promise((resolve) => {
            const isVideo = (file.type && file.type.startsWith('video/')) || /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(file.name || '');
            let objectUrl = '';
            try {
                objectUrl = URL.createObjectURL(file);
            } catch (_) {}

            let isResolved = false;
            const timer = setTimeout(() => {
                if (!isResolved) {
                    isResolved = true;
                    resolve({ previewUrl: objectUrl, isVideo, width: 1200, height: 800, detectedAspect: '16:9' });
                }
            }, 2500);

            if (isVideo) {
                const video = document.createElement('video');
                video.preload = 'metadata';
                video.onloadedmetadata = () => {
                    if (isResolved) return;
                    isResolved = true;
                    clearTimeout(timer);
                    const aspect = this.detectClosestAspectRatio(video.videoWidth, video.videoHeight);
                    resolve({
                        previewUrl: objectUrl,
                        isVideo: true,
                        width: video.videoWidth || 1920,
                        height: video.videoHeight || 1080,
                        duration: video.duration || null,
                        detectedAspect: aspect
                    });
                };
                video.onerror = () => {
                    if (isResolved) return;
                    isResolved = true;
                    clearTimeout(timer);
                    resolve({ previewUrl: objectUrl, isVideo: true, width: 1920, height: 1080, detectedAspect: '16:9' });
                };
                video.src = objectUrl;
            } else {
                const img = new Image();
                img.onload = () => {
                    if (isResolved) return;
                    isResolved = true;
                    clearTimeout(timer);
                    const aspect = this.detectClosestAspectRatio(img.naturalWidth, img.naturalHeight);
                    resolve({
                        previewUrl: objectUrl,
                        isVideo: false,
                        width: img.naturalWidth || 1200,
                        height: img.naturalHeight || 800,
                        detectedAspect: aspect
                    });
                };
                img.onerror = () => {
                    if (isResolved) return;
                    isResolved = true;
                    clearTimeout(timer);
                    resolve({ previewUrl: objectUrl, isVideo: false, width: 1200, height: 800, detectedAspect: '16:9' });
                };
                img.src = objectUrl;
            }
        });
    }

    /**
     * Uploads a batch of files with concurrency control and item-level progress tracking.
     * @param {Array<Object>} items - Array of { file, ... }
     * @param {Object} options - { concurrency, onItemStart, onItemProgress, onItemSuccess, onItemError }
     */
    async uploadBatch(items, options = {}) {
        const concurrency = options.concurrency || 3;
        const results = new Array(items.length);
        let currentIndex = 0;

        const worker = async () => {
            while (currentIndex < items.length) {
                const idx = currentIndex++;
                const item = items[idx];
                try {
                    if (options.onItemStart) options.onItemStart(idx, item);
                    const res = await this.uploadFile(item.file, {
                        customPreset: item.customPreset,
                        onProgress: (p) => {
                            if (options.onItemProgress) options.onItemProgress(idx, p, item);
                        }
                    });
                    results[idx] = { success: true, data: res, item };
                    if (options.onItemSuccess) {
                        try {
                            await options.onItemSuccess(idx, res, item);
                        } catch (callbackErr) {
                            console.error('Error in onItemSuccess callback:', callbackErr);
                        }
                    }
                } catch (err) {
                    results[idx] = { success: false, error: err, item };
                    if (options.onItemError) {
                        try {
                            await options.onItemError(idx, err, item);
                        } catch (callbackErr) {
                            console.error('Error in onItemError callback:', callbackErr);
                        }
                    }
                }
            }
        };

        const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
        await Promise.all(workers);
        return results;
    }
}

export const cloudinaryService = new CloudinaryService();
