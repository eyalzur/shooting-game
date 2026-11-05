# Strafe Strike

A mobile PvP shooting game, built with React Native (Expo) and shipped as a PWA.
This is phase 1: single-player vs. moving targets.

## Gameplay (phase 1)

- Move left/right with the on-screen arrow buttons.
- Tap FIRE (or tap the play area) to shoot straight up.
- Targets bounce left/right across three lanes ("slides"): far, mid, near.
  Far targets are smaller and faster, and worth more points, since they're
  harder to hit and the shot takes longer to reach them.
- Hitting a target scores points and respawns it elsewhere in its lane.

Planned next: bot opponent (player vs. robo-player), shot power/speed tuning,
zigzag movement, and eventually live PvP.

## Run it

```bash
npm install
npm run web      # PWA in the browser
npm run ios      # iOS simulator
npm run android  # Android emulator
```

## PWA

`public/manifest.json`, `public/sw.js`, and `public/index.html` provide the
web app manifest, offline service worker, and install metadata. Build the
installable static site with:

```bash
npx expo export --platform web
```

The output lands in `dist/` and can be served by any static host.
