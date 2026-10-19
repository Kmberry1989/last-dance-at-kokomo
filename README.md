# Last Dance at Kokomo

[Play the game](https://kmberry1989.github.io/last-dance-at-kokomo/)

A mobile arcade love story: one gala, a zombie band, and two people determined to leave together. This is a playable prototype with synthesized music.

## The night

Six cinematic and rhythm chapters follow the arrival, lobby, art auction, dinner outbreak, zombie band, and table escape. Artwork stays visible while reading. Each rhythm song has four visual story beats, moving scenery, animated characters, and scene-specific captions.

Two short brawls change the pace: clear the banquet aisle, then fight through the crowd to reunite. Both partners are playable. The ending always brings them back together.

## Controls

- Rhythm: four touchscreen arrows, or A/S/W/D and the arrow keys. Hold long notes; press both arrows for paired beats.
- Fighting: tap **STRIKE** (J), hold **BLOCK** (K), and **SWITCH** partners (L). Block when enemies wind up and strike during openings. Keyboard users can also focus Block and press Space to toggle it.
- Pause: the pause button or Escape. Backgrounding the tab pauses active play.
- Misses never end the story. Your partner covers you when fight energy runs out. Fighting can also be skipped.
- Chapter Select replays any chapter, either fight, or the reunion cinematic.
- Reduce Motion on the title screen limits scene movement and follows the system preference initially.

## Artwork

The game uses the original Tuxedo Fighter, 16-Bit Fighter, Zombie Band, and Zombified Attendees sheets. Their individual poses were extracted into transparent atlases. Original environment artwork supplies the exterior, lobby, garage, banquet hall, and art auction, with extracted conference-center props. The earlier cinematic illustrations remain in use.

## Files

- `index.html`: original rhythm engine, synthesized audio, story panels, and main screens.
- `world.js`: animated visual story, sprite rendering, chapter replay, and fighting interludes.
- `world.css`: artwork layering, mobile layouts, fighting controls, and motion preferences.
- `assets/`: cinematic plates, environment panoramas, props, sprite atlases, and `sprites.json` frame maps.
- `.github/workflows/pages.yml`: automatic GitHub Pages publishing from `main`.

## Run

Serve this directory as a static site (for example, `python3 -m http.server 8000`). No build or package installation is required. Use a web server rather than opening the file directly, because sprite metadata loads with `fetch`.

Music starts after a user gesture. The art sheets supply discrete action poses; the prototype does not use a physics engine or individually rigged characters.
