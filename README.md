# Last Dance at Kokomo

A mobile-first, story-driven arcade rhythm game set at an imaginary zombie outbreak during a formal gala at the Kokomo Conference Center.

## Play

Open `index.html` in a browser, or visit the GitHub Pages deployment after enabling Pages on the repository. No build, package manager, server, or third-party dependencies are necessary.

- **Mobile:** tap any of four rhythm lanes when incoming arrows reach the line. Keep your finger down for long notes; use two fingers for simultaneous beats.
- **Desktop:** use `A/S/W/D` or the arrow keys.
- Choose Story or Arcade difficulty; music uses the Web Audio API and begins after a user gesture.
- Watch cinematic chapters between stages: the arrival, parking garage, lobby, art auction, dining room, zombie band, and escape.
- The final cinematic reunites the two protagonists and ends with them escaping **together**.

## Project structure

- `index.html` — full game code, screen layouts, synth audio, and interactive rhythm system.
- `assets/` — pixel-art backdrop images extracted from the self-contained prototype.
- `.github/workflows/pages.yml` — optional automatic GitHub Pages publishing after you choose GitHub Actions under Settings → Pages.

## Hosting

This is a static site. Host it on GitHub Pages, Vercel, Netlify, or any conventional web host by serving `index.html` and the `assets/` folder without changing the paths.

## Status

Playable **prototype**. Music is synthesized in-browser. Images are visual cutscene plates, not individually rigged character sprites; some cinematic actions are conveyed by panel transitions and text.
