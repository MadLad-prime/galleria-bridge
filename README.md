# SINGULARITY // 3D ORBITAL MEDIA ARCHIVE & ADMIN PIPELINE

A tactical industrial minimalism 3D orbital media gallery powered by Three.js GLSL shaders, client-safe Cloudinary unsigned ingest, and real-time Firebase Firestore synchronization.

---

## Architecture Overview

```
                                      +--------------------------+
                                      |   Tactical Admin Station |
                                      |       (admin.html)       |
                                      +------------+-------------+
                                                   |
                      +----------------------------+----------------------------+
                      |                                                         |
                      v                                                         v
         +--------------------------+                              +--------------------------+
         | Direct Unsigned Upload   |                              |  Metadata & Orbit Sync   |
         | (Cloudinary REST API)    |                              |   (Firebase Firestore)   |
         +------------+-------------+                              +------------+-------------+
                      |                                                         |
                      | secure_url + public_id                                  | onSnapshot real-time
                      +----------------------------+----------------------------+
                                                   |
                                                   v
                                      +--------------------------+
                                      | 3D WebGL Singularity     |
                                      | Orbital Gallery          |
                                      |       (index.html)       |
                                      +--------------------------+
```

---

## 1. Zero-Backend Credentials Setup

Both services are configured on the client side without exposing sensitive backend API secrets.

### A. Cloudinary Setup (Unsigned Upload Preset)
> **Note**: Unsigned presets allow direct browser-to-Cloudinary uploads without needing your Cloudinary API Secret.

1. Log into your [Cloudinary Console](https://console.cloudinary.com/).
2. Navigate to **Settings** (gear icon) &rarr; **Upload**.
3. Scroll to **Upload presets** &rarr; Click **Add upload preset**.
4. Set **Signing Mode** to **Unsigned**.
5. *(Optional)* Name your preset (e.g. `orbital_unsigned`) and set default folder to `singularity_archive`.
6. Click **Save**.
7. Open the Admin Station (`admin.html`) &rarr; Click **`[ CREDENTIALS & PRESETS ]`** &rarr; Enter your **Cloud Name** and **Upload Preset**.

### B. Firebase Setup (Firestore Real-time Client)
> **Note**: Firebase Web Client credentials (`apiKey`, `projectId`, etc.) are public identifiers designed for frontend use. Access security is managed via Firebase Security Rules.

1. Open your [Firebase Console](https://console.firebase.google.com/).
2. Create or open your project &rarr; Add a **Web App** (`</>`).
3. Copy the `firebaseConfig` object snippet:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef"
   };
   ```
4. Enable **Cloud Firestore** in your Firebase project (Start in test mode or with read/write access).
5. Open the Admin Station (`admin.html`) &rarr; Click **`[ CREDENTIALS & PRESETS ]`** &rarr; Paste the snippet directly into the **FAST PASTE** box.
6. Click **`[ SAVE CONFIGURATION ]`**.
7. Click **`[ MIGRATE LOCAL MONOLITHS TO CLOUD FIRESTORE ]`** to upload initial seed monoliths to your new Firestore collection!

---

## 2. Core Components Built

| File | Purpose |
| :--- | :--- |
| [`index.html`](file:///c:/Users/dudet/Documents/galleria/index.html) | Main 3D Singularity Orbital Gallery. Features relativistic accretion disk, spacetime chromatic rupture shader, 6-DOF ghost navigation, and real-time monolith synchronization. |
| [`admin.html`](file:///c:/Users/dudet/Documents/galleria/admin.html) | Tactical industrial Admin Terminal. Drag-and-drop media ingest, video/image analyzer, aspect ratio detector, live upload progress bar, and orbital fleet management. |
| [`js/config.js`](file:///c:/Users/dudet/Documents/galleria/js/config.js) | Central configuration store, aspect ratio presets (`16:9`, `9:16`, `4:3`, `1:1`, `21:9`), and localStorage synchronization. |
| [`js/cloudinary-service.js`](file:///c:/Users/dudet/Documents/galleria/js/cloudinary-service.js) | Direct client-side unsigned upload handler with `XMLHttpRequest` progress reporting, dimension analysis, and URL transforms. |
| [`js/firebase-service.js`](file:///c:/Users/dudet/Documents/galleria/js/firebase-service.js) | Dual-engine sync layer: live Firebase Firestore via modular CDN + instant LocalStorage fallback with seed data when unconfigured. |

---

## 3. Running Locally

The local server is already running on port `8080`:
- **3D Singularity Gallery**: [http://localhost:8080/index.html](http://localhost:8080/index.html)
- **Admin Ingest Station**: [http://localhost:8080/admin.html](http://localhost:8080/admin.html)
