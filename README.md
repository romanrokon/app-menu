# app-menu

The app launcher shared by every rzamann app: `<rz-app-menu>`, a custom element with no
dependencies and no build step. Served from https://apps.rzamann.com.

## Use it in an app

```html
<script type="module" src="https://apps.rzamann.com/app-menu.js"></script>
<rz-app-menu app="starwalls" theme="dark"></rz-app-menu>
```

| Attribute | Meaning |
|---|---|
| `app` | The host app's `id` in `apps.json`. It shows as the top row and is left out of the grid. |
| `theme` | `dark` or `light`. Omit it to follow `prefers-color-scheme`. |
| `registry` | Another `apps.json` url, for local work. Defaults to the one next to the script. |

An app with a single theme pins it: StarWalls is dark-only and sets `theme="dark"`, so the
panel stays dark even on a phone set to light mode. An app with both themes omits the
attribute, or sets it from its own theme toggle.

The trigger takes its colour from the host (`currentColor`), and `::part(trigger)` /
`::part(panel)` allow further overrides.

## Change the list

Edit `apps.json` and deploy this repo. No app needs a rebuild. Icons go in `icons/`, 128px PNG.
`links` on an app become the panel footer when that app is the host.

## Local

`npx serve .` then open `/`, or point a host at it with
`registry="http://localhost:3000/apps.json"` and the script url at the same origin.
