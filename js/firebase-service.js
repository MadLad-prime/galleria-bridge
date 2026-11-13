/**
 * SINGULARITY // FIREBASE ARCHIVE SERVICE
 * Dual-engine data synchronization layer:
 * 1. Cloud Mode: Live Firebase Firestore real-time sync with zero sensitive backend keys.
 * 2. Local Mode: High-performance localStorage fallback with seed monoliths when offline or unconfigured.
 */

import { getSystemConfig, isFirebaseConfigured, SEED_MONOLITHS } from './config.js';

const LOCAL_STORAGE_KEY = 'singularity_monoliths_local_v1';

export class FirebaseArchiveService {
    constructor() {
        this.app = null;
        this.db = null;
        this.isCloudConnected = false;
        this.subscribers = new Set();
        this.unsubscribeFirestore = null;
        this.currentMonoliths = [];
        
        // Listen for config changes from admin UI
        window.addEventListener('singularity-config-updated', () => {
            this.reinitialize();
        });

        this.init();
    }

    async init() {
        const sys = getSystemConfig();
        const config = sys.firebase;

        if (isFirebaseConfigured(config)) {
            try {
                // Dynamically import Firebase v10 CDN modules
                const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
                const { 
                    getFirestore, 
                    collection, 
                    onSnapshot, 
                    addDoc, 
                    deleteDoc, 
                    doc, 
                    updateDoc,
                    getDocs,
                    query, 
                    orderBy 
                } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');

                // Initialize or reuse app
                const existingApps = getApps();
                this.app = existingApps.length > 0 ? existingApps[0] : initializeApp(config);
                this.db = getFirestore(this.app);
                this.firestoreModules = { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, getDocs, query, orderBy };

                this.setupFirestoreListener();
                this.isCloudConnected = true;
                console.log('[FIREBASE] Connected to live Cloud Firestore.');
                this.emitStatusChange();
                return;
            } catch (err) {
                console.warn('[FIREBASE] Failed to initialize Firebase Firestore, falling back to Local Storage:', err);
            }
        }

        // Fallback to local storage mode
        this.isCloudConnected = false;
        this.loadLocalMonoliths();
        this.emitStatusChange();
    }

    async reinitialize() {
        if (this.unsubscribeFirestore) {
            this.unsubscribeFirestore();
            this.unsubscribeFirestore = null;
        }
        await this.init();
    }

    setupFirestoreListener() {
        if (!this.db || !this.firestoreModules) return;

        const { collection, onSnapshot, query, orderBy } = this.firestoreModules;
        const monolithsRef = collection(this.db, 'monoliths');
        const q = query(monolithsRef, orderBy('createdAt', 'desc'));

        this.unsubscribeFirestore = onSnapshot(q, (snapshot) => {
            if (snapshot.empty && this.getLocalMonoliths().length > 0) {
                // Optional initial cloud population if database is empty
                console.log('[FIREBASE] Cloud archive empty; local seed available.');
            }

            const items = [];
            snapshot.forEach((docSnapshot) => {
                items.push({
                    id: docSnapshot.id,
                    ...docSnapshot.data()
                });
            });

            this.currentMonoliths = items;
            this.notifySubscribers(this.currentMonoliths);
        }, (error) => {
            console.error('[FIREBASE] Firestore snapshot error:', error);
            // Fallback to local mode on error
            this.isCloudConnected = false;
            this.loadLocalMonoliths();
            this.emitStatusChange();
        });
    }

    loadLocalMonoliths() {
        try {
            const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (raw) {
                this.currentMonoliths = JSON.parse(raw);
            } else {
                // Seed initial high-contrast monoliths
                this.currentMonoliths = [...SEED_MONOLITHS];
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.currentMonoliths));
            }
        } catch (e) {
            console.warn('Error reading local monoliths:', e);
            this.currentMonoliths = [...SEED_MONOLITHS];
        }
        this.notifySubscribers(this.currentMonoliths);
    }

    getLocalMonoliths() {
        try {
            const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
            return raw ? JSON.parse(raw) : [...SEED_MONOLITHS];
        } catch (e) {
            return [...SEED_MONOLITHS];
        }
    }

    saveLocalMonoliths(monoliths) {
        this.currentMonoliths = monoliths;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(monoliths));
        this.notifySubscribers(this.currentMonoliths);
    }

    /**
     * Subscribes to monolith archive updates.
     * @param {Function} callback - Called with updated monoliths array whenever changes occur
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this.subscribers.add(callback);
        // Immediately notify with current cache
        if (this.currentMonoliths && this.currentMonoliths.length > 0) {
            callback(this.currentMonoliths, this.isCloudConnected);
        }
        return () => this.subscribers.delete(callback);
    }

    notifySubscribers(items) {
        for (const cb of this.subscribers) {
            try {
                cb(items, this.isCloudConnected);
            } catch (err) {
                console.error('Error in subscriber callback:', err);
            }
        }
    }

    emitStatusChange() {
        window.dispatchEvent(new CustomEvent('singularity-sync-status', {
            detail: { isCloudConnected: this.isCloudConnected }
        }));
    }

    /**
     * Adds a new media monolith to the orbital archive.
     */
    async addMonolith(data) {
        const item = {
            serial: data.serial || this.generateSerial(),
            title: data.title || 'UNTITLED MONOLITH',
            description: data.description || '',
            mediaType: data.mediaType || 'image', // 'image' | 'video'
            url: data.url || '',
            cloudinaryPublicId: data.cloudinaryPublicId || '',
            aspectRatio: data.aspectRatio || '16:9',
            orbitBand: data.orbitBand || 'mid', // 'inner' | 'mid' | 'outer'
            orbitRadius: data.orbitRadius || this.calculateOrbitRadius(data.orbitBand),
            createdAt: Date.now()
        };

        if (this.isCloudConnected && this.db && this.firestoreModules) {
            const { collection, addDoc } = this.firestoreModules;
            const docRef = await addDoc(collection(this.db, 'monoliths'), item);
            return { id: docRef.id, ...item };
        } else {
            const id = 'local-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
            const newItem = { id, ...item };
            const current = this.getLocalMonoliths();
            current.unshift(newItem);
            this.saveLocalMonoliths(current);
            return newItem;
        }
    }

    /**
     * Updates an existing monolith.
     */
    async updateMonolith(id, updates) {
        if (this.isCloudConnected && this.db && this.firestoreModules) {
            const { doc, updateDoc } = this.firestoreModules;
            const docRef = doc(this.db, 'monoliths', id);
            await updateDoc(docRef, updates);
        } else {
            const current = this.getLocalMonoliths();
            const index = current.findIndex(m => m.id === id);
            if (index !== -1) {
                current[index] = { ...current[index], ...updates };
                this.saveLocalMonoliths(current);
            }
        }
    }

    /**
     * Deletes a monolith from the archive.
     */
    async deleteMonolith(id) {
        if (this.isCloudConnected && this.db && this.firestoreModules) {
            const { doc, deleteDoc } = this.firestoreModules;
            await deleteDoc(doc(this.db, 'monoliths', id));
        } else {
            const current = this.getLocalMonoliths();
            const filtered = current.filter(m => m.id !== id);
            this.saveLocalMonoliths(filtered);
        }
    }

    /**
     * Resets archive to initial tactical seed monoliths.
     */
    async resetToDefaults() {
        if (this.isCloudConnected && this.db && this.firestoreModules) {
            const { collection, getDocs, deleteDoc, doc, addDoc } = this.firestoreModules;
            const snap = await getDocs(collection(this.db, 'monoliths'));
            for (const d of snap.docs) {
                await deleteDoc(doc(this.db, 'monoliths', d.id));
            }
            for (const seed of SEED_MONOLITHS) {
                const { id, ...rest } = seed;
                await addDoc(collection(this.db, 'monoliths'), rest);
            }
        } else {
            this.saveLocalMonoliths([...SEED_MONOLITHS]);
        }
    }

    /**
     * Syncs local items to Firebase when user connects their credentials.
     */
    async syncLocalToCloud() {
        if (!this.isCloudConnected || !this.db || !this.firestoreModules) {
            throw new Error('Firebase Cloud is not connected.');
        }
        const localItems = this.getLocalMonoliths();
        const { collection, addDoc } = this.firestoreModules;
        let count = 0;
        for (const item of localItems) {
            const { id, ...cleanData } = item;
            await addDoc(collection(this.db, 'monoliths'), cleanData);
            count++;
        }
        return count;
    }

    generateSerial() {
        const count = (this.currentMonoliths?.length || 0) + 1;
        const hex = ((count * 439) + Math.floor(Math.random() * 255)).toString(16).toUpperCase();
        return `MNL-${String(count).padStart(2, '0')} // 0x${hex}`;
    }

    calculateOrbitRadius(band = 'mid') {
        switch (band) {
            case 'inner':
                return 18 + Math.random() * 12; // 18 - 30 AU
            case 'outer':
                return 52 + Math.random() * 28; // 52 - 80 AU
            case 'mid':
            default:
                return 32 + Math.random() * 18; // 32 - 50 AU
        }
    }
}

export const firebaseService = new FirebaseArchiveService();
