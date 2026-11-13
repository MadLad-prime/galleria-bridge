/**
 * SINGULARITY // ARCHIVE CONFIGURATION
 * Central configuration module for Cloudinary Unsigned Ingest & Firebase Firestore Sync.
 * Backed by localStorage with zero-friction fallback so the gallery works out of the box.
 */

const STORAGE_KEYS = {
    CONFIG: 'singularity_sys_config_v1',
    MONOLITHS: 'singularity_monoliths_local_v1'
};

// Default Cloudinary configuration (preset is unsigned, safe for client-side upload)
export const DEFAULT_CLOUDINARY_CONFIG = {
    cloudName: 'dqcatr0ze',
    uploadPreset: 'galleria65',
    folder: 'singularity_archive',
    baseDeliveryUrl: 'https://res.cloudinary.com'
};

// Default Firebase Client SDK configuration
// (Client-side keys are public identifiers; security is enforced via Firebase Security Rules)
export const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyC6iKPLFEvEIE-FRDvkTgdvZEQQL70ab9M",
    authDomain: "galleria-bridge.firebaseapp.com",
    projectId: "galleria-bridge",
    storageBucket: "galleria-bridge.firebasestorage.app",
    messagingSenderId: "325630960199",
    appId: "1:325630960199:web:15cb6f03bcfc651cb14762"
};

// Default seed monoliths for instant out-of-the-box 3D orbital visualization
export const SEED_MONOLITHS = [
    {
        id: 'seed-01',
        serial: 'MNL-01 // 0x1B7',
        title: 'NEURAL CONSTRUCT // OMEGA',
        description: 'Deep-space telemetry feed from orbital listening post 09.',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        cloudinaryPublicId: 'singularity_archive/neural_omega',
        aspectRatio: '16:9',
        orbitBand: 'inner',
        orbitRadius: 22.4,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3
    },
    {
        id: 'seed-02',
        serial: 'MNL-02 // 0x36E',
        title: 'CYBERNETIC BRUTALISM // 04',
        description: 'Monolithic concrete containment structure under heavy solar radiation.',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
        cloudinaryPublicId: 'singularity_archive/cyber_brutalist',
        aspectRatio: '9:16',
        orbitBand: 'mid',
        orbitRadius: 34.8,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2
    },
    {
        id: 'seed-03',
        serial: 'MNL-03 // 0x525',
        title: 'EVENT HORIZON KINETIC FEED',
        description: 'Live procedural harmonic waveform stream computed at 60fps.',
        mediaType: 'video', // Rendered as real-time procedural canvas or Cloudinary video stream
        url: '',
        cloudinaryPublicId: 'singularity_archive/kinetic_stream_03',
        aspectRatio: '16:9',
        orbitBand: 'inner',
        orbitRadius: 26.2,
        createdAt: Date.now() - 1000 * 60 * 60 * 24
    },
    {
        id: 'seed-04',
        serial: 'MNL-04 // 0x6DC',
        title: 'SUPERSTRUCTURE VERTEX // 88',
        description: 'High-altitude atmospheric observatory spire.',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        cloudinaryPublicId: 'singularity_archive/vertex_88',
        aspectRatio: '4:3',
        orbitBand: 'outer',
        orbitRadius: 52.1,
        createdAt: Date.now() - 1000 * 60 * 60 * 18
    },
    {
        id: 'seed-05',
        serial: 'MNL-05 // 0x893',
        title: 'COSMIC LENS INTERFEROMETER',
        description: 'Gravitational lensing survey across Sagittarius A sector.',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        cloudinaryPublicId: 'singularity_archive/lens_interferometer',
        aspectRatio: '1:1',
        orbitBand: 'mid',
        orbitRadius: 41.5,
        createdAt: Date.now() - 1000 * 60 * 60 * 12
    },
    {
        id: 'seed-06',
        serial: 'MNL-06 // 0xA4A',
        title: 'ANAMORPHIC SPECTRAL SWARM',
        description: 'Ultra-wide angle diffraction survey of relativistic jet particles.',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
        cloudinaryPublicId: 'singularity_archive/spectral_swarm',
        aspectRatio: '21:9',
        orbitBand: 'outer',
        orbitRadius: 65.3,
        createdAt: Date.now() - 1000 * 60 * 60 * 6
    },
    {
        id: 'seed-07',
        serial: 'MNL-07 // 0xC01',
        title: 'INTERSTELLAR PLASMA DRIFT',
        description: 'Harmonic wave resonance in deep magnetosphere.',
        mediaType: 'video',
        url: '',
        cloudinaryPublicId: 'singularity_archive/plasma_drift',
        aspectRatio: '4:3',
        orbitBand: 'mid',
        orbitRadius: 38.2,
        createdAt: Date.now() - 1000 * 60 * 60 * 2
    },
    {
        id: 'seed-08',
        serial: 'MNL-08 // 0xDB8',
        title: 'VOID HORIZON REFLECTION',
        description: 'Obsidian vacuum interface under relativistic acceleration.',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
        cloudinaryPublicId: 'singularity_archive/void_reflection',
        aspectRatio: '16:9',
        orbitBand: 'outer',
        orbitRadius: 58.7,
        createdAt: Date.now() - 1000 * 60 * 30
    }
];

// Aspect Ratio Presets
export const ASPECT_RATIOS = {
    '16:9': { label: '16:9 WIDE', w: 6.4, h: 3.6, texW: 640, texH: 360, ratio: 16 / 9 },
    '9:16': { label: '9:16 VERTICAL', w: 3.4, h: 6.0, texW: 360, texH: 640, ratio: 9 / 16 },
    '4:3':  { label: '4:3 ARCHIVE', w: 5.2, h: 3.9, texW: 520, texH: 390, ratio: 4 / 3 },
    '1:1':  { label: '1:1 MONOLITH', w: 4.5, h: 4.5, texW: 480, texH: 480, ratio: 1 / 1 },
    '21:9': { label: '21:9 ANAMORPHIC', w: 7.5, h: 3.2, texW: 750, texH: 320, ratio: 21 / 9 }
};

/**
 * Retrieves the active system configuration, merging defaults with any user-saved overrides.
 */
export function getSystemConfig() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
        if (stored) {
            const parsed = JSON.parse(stored);
            const cld = (parsed.cloudinary && parsed.cloudinary.cloudName && parsed.cloudinary.cloudName !== 'demo')
                ? { ...DEFAULT_CLOUDINARY_CONFIG, ...parsed.cloudinary }
                : { ...DEFAULT_CLOUDINARY_CONFIG };
            const fb = (parsed.firebase && parsed.firebase.apiKey && parsed.firebase.apiKey.trim().length > 0)
                ? { ...DEFAULT_FIREBASE_CONFIG, ...parsed.firebase }
                : { ...DEFAULT_FIREBASE_CONFIG };
            return { cloudinary: cld, firebase: fb };
        }
    } catch (e) {
        console.warn('Error reading config from localStorage:', e);
    }
    return {
        cloudinary: { ...DEFAULT_CLOUDINARY_CONFIG },
        firebase: { ...DEFAULT_FIREBASE_CONFIG }
    };
}

/**
 * Saves updated system configuration to localStorage.
 */
export function saveSystemConfig(newConfig) {
    try {
        const current = getSystemConfig();
        const merged = {
            cloudinary: { ...current.cloudinary, ...(newConfig.cloudinary || {}) },
            firebase: { ...current.firebase, ...(newConfig.firebase || {}) }
        };
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('singularity-config-updated', { detail: merged }));
        return merged;
    } catch (e) {
        console.error('Error saving config to localStorage:', e);
        throw e;
    }
}

/**
 * Checks whether Firebase configuration has all required non-empty fields.
 */
export function isFirebaseConfigured(config = getSystemConfig().firebase) {
    return Boolean(
        config &&
        config.apiKey &&
        config.projectId &&
        config.apiKey.trim().length > 0 &&
        config.projectId.trim().length > 0
    );
}

/**
 * Checks whether Cloudinary has a custom unsigned preset and cloudName configured.
 */
export function isCloudinaryConfigured(config = getSystemConfig().cloudinary) {
    return Boolean(
        config &&
        config.cloudName &&
        config.cloudName !== 'demo' &&
        config.uploadPreset &&
        config.uploadPreset.trim().length > 0
    );
}
