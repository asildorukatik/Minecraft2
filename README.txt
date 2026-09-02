DorukCraft Optimized Hybrid PWA v0.22.3
========================================

DOUBLE-CLICK MODE
-----------------
Extract the whole folder and double-click index.html. No localhost server is required.
The game automatically switches to a file-safe compatibility path:
- WebGL textures come from a separate JS data pack, avoiding Chrome file:// texture tainting.
- world-worker.js is recreated as an in-memory Blob worker.
- doruk_fast.wasm is instantiated from embedded fallback bytes.
- Audio remains separate files and loads normally after user interaction.

WEB / GITHUB PAGES MODE
-----------------------
On HTTP/HTTPS the compatibility data pack stays dormant. DorukCraft uses the normal
separate images/audio, external worker, external WASM and PWA service-worker caching.
For GitHub Pages, upload the CONTENTS of this folder to the repository root.

Structure
---------
- index.html: lightweight shell
- js/file-compat.js: file:// compatibility image/worker/WASM pack (~images only; audio stays split)
- js/game.js: game logic
- world-worker.js: normal hosted worker
- assets/images/: hosted image assets
- assets/audio/: separate audio assets
- doruk_fast.wasm: hosted WASM helper
- sw.js: hosted/offline PWA cache

The actual renderer is WebGL2. WebGPU is still capability scaffolding, and the WASM module
is a small helper rather than the entire engine.
