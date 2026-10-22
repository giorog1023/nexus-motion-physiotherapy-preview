# Nexus Motion · 3D Physiotherapy Experience

An interactive 3D WebGL biomechanical spine experience for **Nexus Motion Physiotherapy**.

🌐 **Live Vercel Preview**: [https://nexus-motion-physiotherapy-preview.vercel.app/work](https://nexus-motion-physiotherapy-preview.vercel.app/work)

---

## Overview

* **Alabaster Ivory Porcelain Bone**: Multi-ramp anatomical lighting with soft cervical cyan backlight.
* **Champagne Gold Disc Cushions**: Localized intervertebral disc cushions with warm specular highlights.
* **Dual-Material 3D Cards**: Orbiting translucent cyan-blue glass in the background that smoothly transitions into milky frosted-white glass when reaching the foreground.
* **Synchronized UI Panels**:
  * Top-Left: Nexus Motion branding.
  * Bottom-Left: Anatomical Focus 01 / 14 tracking current spinal segments.
  * Right Side: Clinical Protocol & Conditions Treated drawer panel with interactive booking CTA.
  * Bottom-Right: Biomechanical Evaluation status indicator card.

---

## Project Structure

```
physiotherapy-version/
├── index.html              # Main clinical experience entry point
├── work/index.html         # Direct /work route fallback
├── vercel.json             # Vercel SPA routing and COOP/COEP headers
├── assets/
│   ├── data/               # Scene graph and UIL definitions
│   ├── fonts/              # Typography
│   ├── geometry/           # 3D anatomical binary spine models
│   ├── images/             # Textures, normal maps, and physio card assets
│   ├── js/                 # WebGL / Hydra engine bundle
│   └── shaders/            # compiled.vs GLSL shaders
└── _external/              # Cloud service geolocation definitions
```

---

## Deployment & Routing

* Deployed on Vercel with COOP (`same-origin`) and COEP (`require-corp`) headers for WebGL worker compatibility.
* Dedicated `/work` route rewrite for instant, refresh-safe direct navigation.
