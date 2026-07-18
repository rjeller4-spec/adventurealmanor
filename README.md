# Adventure Almanor — Trip Planner

Trip planning for boating, fishing, hiking, biking, and off-roading around Lake Almanor,
Chester, Westwood, Silver Lake, Mountain Meadows Reservoir, Lassen Volcanic National Park,
and Caribou Wilderness, California — plus a directory of real hiking trails and local
fishing guides.

Live at [adventurealmanor.com](https://www.adventurealmanor.com/).

## Stack

Vite + React, no backend. All content (activities, trail coordinates, photos) lives in
`src/App.jsx` as plain data. Trip-in-progress state persists to `localStorage` so it
survives navigating between pages.

## Development

```
npm install
npm run dev
```

## Build

```
npm run build
```

Outputs static files to `dist/` — `index.html` + one JS bundle, no server required.

## Deployment

Connected to Netlify: every push to `main` triggers a build (`npm run build`) and deploy
of `dist/`.
