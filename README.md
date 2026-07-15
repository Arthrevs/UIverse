<p align="center">
  <img src="https://img.shields.io/badge/AXIOM_WEAVER-Sector_14-d4b87a?style=for-the-badge&labelColor=0a0c14" alt="Axiom Weaver" />
</p>

<h1 align="center">🌌 UIverse — Axiom Weaver Terminal</h1>

<p align="center">
  <strong>An immersive 3D cinematic browser game set on an alien planetary surface.</strong><br/>
  Defend Sector 14 from ontological breaches by deploying Syntax Anchors and a Guardian Drone.
</p>

<p align="center">
  <a href="https://u-iverse.vercel.app"><img src="https://img.shields.io/badge/▶_LIVE_DEMO-u--iverse.vercel.app-00c853?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>
  <a href="https://github.com/Arthrevs/UIverse"><img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub" /></a>
</p>

---

## 🛠️ Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/React_Three_Fiber-1a1a2e?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Three Fiber" />
  <img src="https://img.shields.io/badge/React_Three_Drei-16213e?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Three Drei" />
  <img src="https://img.shields.io/badge/Postprocessing-0f3460?style=for-the-badge&logo=webgl&logoColor=white" alt="Postprocessing" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
</p>

---

## 🎬 Features

### Cinematic Intro Sequence
- **39-second fully scripted 3D cinematic** with keyframed camera paths
- Custom **GLTF spaceship model** descending and landing on a rocky cliff surface
- Dynamic **golden star anomaly**, laser strike, and ground vortex effects
- **Guardian Drone deployment** sequence with custom 3D drone model
- Bloom, vignette, and scanline postprocessing effects
- Procedural **star field** background with 8,000+ stars

### Interactive Gameplay
- **Real-time terrain** built from the marble cliff GLTF surface asset
- **Crystalline Intrusion** system — alien crystals grow across the terrain
- **Syntax Anchor** placement — click crystals to deploy defensive anchors
- **Integration Meter** — monitor ontological breach percentage
- **System Log** — live terminal-style event feed
- **HUD Panel** — anchor inventory, integration status, and controls
- Game auto-starts after cinematic — no manual play button needed

### 3D Assets
- `spaceship.glb` — Futuristic sci-fi spaceship (cinematic + mini version in-game)
- `drone_design.glb` — Guardian surveillance drone
- `marble_cliff_05_2k/` — High-res rocky cliff terrain (GLTF + PBR textures)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+
- **npm** 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/Arthrevs/UIverse.git
cd UIverse/app-build

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
UIverse/
├── vercel.json              # Vercel deployment config
└── app-build/               # Next.js application root
    ├── public/
    │   └── models/
    │       ├── spaceship.glb
    │       ├── drone_design.glb
    │       └── marble_cliff_05_2k/
    │           ├── marble_cliff_05_2k.gltf
    │           ├── marble_cliff_05.bin
    │           └── textures/
    └── src/
        ├── app/
        │   ├── page.js           # Main entry point
        │   ├── layout.js         # Root layout with fonts
        │   └── globals.css       # Full design system
        ├── components/
        │   ├── CinematicIntro.jsx # 39s 3D cinematic sequence
        │   ├── SectorView.jsx    # Main 3D game viewport
        │   ├── Terrain.jsx       # Marble cliff surface
        │   ├── CrystallineIntrusion.jsx
        │   ├── SyntaxAnchor.jsx
        │   ├── StatusBar.jsx
        │   ├── HudPanel.jsx
        │   ├── GameOverlay.jsx
        │   ├── SystemLog.jsx
        │   └── ...
        └── hooks/
            └── useGameState.js   # Central game state manager
```

---

## 🌐 Deployment

Deployed on **Vercel** with the Root Directory set to `app-build`.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Arthrevs/UIverse)


