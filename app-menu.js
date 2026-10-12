/**
 * <rz-app-menu app="starwalls" theme="dark"></rz-app-menu>
 *
 * @ AI Context: One launcher shared by every app in the family, loaded at runtime from this
 * repo's origin rather than installed. The apps run React 17, React 19, Next and Vite, so a
 * React package could not serve all of them; a custom element with a shadow root runs in any
 * of them, and its styles can neither be broken by a host's Tailwind nor leak into it.
 *
 * - The list lives in apps.json next to this file, so adding or reordering an app is a JSON
 *   edit and a deploy of THIS repo only. `registry` overrides the url for local work.
 * - `app` names the host. The host renders as the full-width row on top, and is left out of
 *   the grid and the products section. An unknown id simply has no top row.
 * - The footer carries the host's own links (About, Terms, Privacy) from apps.json plus the
 *   shared copyright, which is why hosts drop their page footer once they adopt this.
 * - No dependencies and no build step: this file is what ships.
 */

const TAG = "rz-app-menu";

const PANEL_WIDTH = 328;
const GUTTER = 8;

const registries = new Map();

function loadRegistry(url) {
  if (!registries.has(url)) {
    const request = fetch(url, { mode: "cors" }).then((res) => {
      if (!res.ok) throw new Error(`apps.json responded ${res.status}`);

      return res.json();
    });

    // A failed fetch must not stick: the retry button asks again.
    request.catch(() => registries.delete(url));
    registries.set(url, request);
  }

  return registries.get(url);
}

const ICON_GRID = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
  <circle cx="5" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="5" r="2"/>
  <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
  <circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
</svg>`;

const ICON_ARROW = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M7 17 17 7M8 7h9v9"/>
</svg>`;

const STYLES = `
:host {
  --rz-surface: #17181c;
  --rz-raised: #212329;
  --rz-line: #2b2e35;
  --rz-text: #edeef1;
  --rz-muted: #9399a4;
  --rz-focus: #7aa7ff;
  --rz-shadow: 0 16px 48px rgb(0 0 0 / 0.5), 0 2px 8px rgb(0 0 0 / 0.3);

  position: relative;
  display: inline-block;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  font-family: inherit;
  line-height: 1.4;
  -webkit-tap-highlight-color: transparent;
}

:host([theme="light"]) {
  --rz-surface: #ffffff;
  --rz-raised: #f1f2f5;
  --rz-line: #e2e4e9;
  --rz-text: #16181d;
  --rz-muted: #5e6470;
  --rz-focus: #2f6feb;
  --rz-shadow: 0 16px 48px rgb(22 24 29 / 0.16), 0 2px 8px rgb(22 24 29 / 0.08);
}

@media (prefers-color-scheme: light) {
  :host(:not([theme])) {
    --rz-surface: #ffffff;
    --rz-raised: #f1f2f5;
    --rz-line: #e2e4e9;
    --rz-text: #16181d;
    --rz-muted: #5e6470;
    --rz-focus: #2f6feb;
    --rz-shadow: 0 16px 48px rgb(22 24 29 / 0.16), 0 2px 8px rgb(22 24 29 / 0.08);
  }
}

* { box-sizing: border-box; margin: 0; padding: 0; }

a, button { font: inherit; color: inherit; }

a { text-decoration: none; }

:focus-visible { outline: 2px solid var(--rz-focus); outline-offset: 2px; }

.trigger {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  color: currentColor;
  background: color-mix(in srgb, currentColor 10%, transparent);
  cursor: pointer;
  transition: background-color 150ms ease;
}

.trigger:hover,
.trigger[aria-expanded="true"] {
  background: color-mix(in srgb, currentColor 20%, transparent);
}

.panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 2147483000;
  width: 328px;
  max-height: min(640px, calc(100dvh - 88px));
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 8px;
  border: 1px solid var(--rz-line);
  border-radius: 20px;
  color: var(--rz-text);
  background: var(--rz-surface);
  box-shadow: var(--rz-shadow);
  transform-origin: top center;
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
  visibility: hidden;
  transition:
    opacity 120ms ease-in,
    transform 120ms ease-in,
    visibility 0s linear 120ms;
}

.panel[data-open] {
  opacity: 1;
  transform: none;
  visibility: visible;
  transition:
    opacity 200ms cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1),
    visibility 0s;
}

/*
 * @ AI Context: The open is two layers. The panel itself is quick (200ms) so it lands under
 * the finger; its contents then rise into it over 520ms, staggered top to bottom by --i, so
 * the motion reads as flowing from the container into what it holds. The item animation is
 * keyed to [data-open], so removing the attribute on close resets it and every open replays
 * it. Closing is a plain fast fade; nobody waits on a dismissal.
 */
.panel[data-open] .item {
  animation: rz-rise 520ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
  animation-delay: calc(70ms + var(--i, 0) * 28ms);
}

@keyframes rz-rise {
  from { opacity: 0; transform: translateY(10px) scale(0.98); filter: blur(2px); }
}

@media (prefers-reduced-motion: reduce) {
  .panel, .panel[data-open] { transform: none; transition: none; }
  .panel[data-open] .item { animation: none; }
}

.panel:focus { outline: none; }

.host {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 14px;
  background: var(--rz-raised);
}

.host img { width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0; }

.host-name { display: block; font-size: 15px; font-weight: 600; }

.host-subtitle {
  display: block;
  overflow: hidden;
  font-size: 13px;
  color: var(--rz-muted);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.host-text { min-width: 0; }

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  margin-top: 8px;
  list-style: none;
}

.tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 4px 10px;
  border-radius: 14px;
  text-align: center;
  transition: background-color 150ms ease;
}

.tile:hover, .row:hover { background: var(--rz-raised); }

.tile img { width: 48px; height: 48px; border-radius: 12px; }

.tile-name {
  max-width: 100%;
  overflow: hidden;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.section-label {
  margin: 12px 12px 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--rz-muted);
}

.products { list-style: none; }

.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 14px;
  transition: background-color 150ms ease;
}

.row img { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; }

.row-text { flex: 1; min-width: 0; }

.row-name { display: block; font-size: 14px; font-weight: 600; }

.row-subtitle {
  display: -webkit-box;
  overflow: hidden;
  font-size: 12px;
  color: var(--rz-muted);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.row svg { flex-shrink: 0; color: var(--rz-muted); }

.footer {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  margin-top: 8px;
  padding: 12px 12px 6px;
  border-top: 1px solid var(--rz-line);
  font-size: 12px;
  color: var(--rz-muted);
}

.footer a:hover { color: var(--rz-text); }

.state {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding: 24px 12px;
  font-size: 13px;
  text-align: center;
  color: var(--rz-muted);
}

.retry {
  padding: 8px 16px;
  border: 1px solid var(--rz-line);
  border-radius: 999px;
  background: var(--rz-raised);
  color: var(--rz-text);
  cursor: pointer;
}

.skeleton {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px 2px;
  padding: 72px 0 16px;
}

.skeleton span {
  justify-self: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--rz-raised);
}
`;

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );
}

// Every value is escaped, and a url must also be http(s): escaping alone lets a
// `javascript:` href through if apps.json is ever edited carelessly.
function safeUrl(value, base) {
  try {
    const url = new URL(value, base);

    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "#";
  } catch {
    return "#";
  }
}

class RzAppMenu extends HTMLElement {
  static observedAttributes = ["app", "registry"];

  #root;
  #trigger;
  #panel;
  #open = false;
  #rendered = false;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: "open" });
    this.#root.innerHTML = `
      <style>${STYLES}</style>
      <button class="trigger" part="trigger" type="button" aria-label="Apps"
        aria-haspopup="dialog" aria-expanded="false" aria-controls="panel">${ICON_GRID}</button>
      <div class="panel" id="panel" part="panel" role="dialog" aria-label="Apps" tabindex="-1"></div>
    `;
    this.#trigger = this.#root.querySelector(".trigger");
    this.#panel = this.#root.querySelector(".panel");
    this.#trigger.addEventListener("click", () => this.toggle());
    this.#panel.addEventListener("keydown", (event) => this.#onKeydown(event));
    this.#panel.addEventListener("click", (event) => {
      if (event.target.closest(".retry")) this.#render();
    });
  }

  connectedCallback() {
    document.addEventListener("pointerdown", this.#onOutside, true);
    window.addEventListener("resize", this.#onResize);
    // Warm the cache while the page is idle so the first open is instant.
    const warm = () => loadRegistry(this.#registryUrl()).catch(() => {});

    if ("requestIdleCallback" in window) requestIdleCallback(warm);
    else setTimeout(warm, 1500);
  }

  disconnectedCallback() {
    document.removeEventListener("pointerdown", this.#onOutside, true);
    window.removeEventListener("resize", this.#onResize);
  }

  attributeChangedCallback() {
    this.#rendered = false;

    if (this.#open) this.#render();
  }

  toggle(force) {
    const open = force ?? !this.#open;

    if (open === this.#open) return;

    this.#open = open;
    this.#trigger.setAttribute("aria-expanded", String(open));
    this.#panel.toggleAttribute("data-open", open);

    if (open) {
      this.#place();

      if (!this.#rendered) this.#render();

      this.#panel.focus({ preventScroll: true });
    }
  }

  #registryUrl() {
    return (
      this.getAttribute("registry") || new URL("apps.json", import.meta.url).href
    );
  }

  /**
   * @ AI Context: The element sits wherever the host puts it, often left of another button,
   * so anchoring the panel to the element's own right edge pushed it off-centre on a phone
   * (2px from the left edge, 60px short of the right). On narrow screens the panel spans the
   * viewport with an 8px gutter; wider, it right-aligns to the button and is clamped inside.
   */
  #place() {
    const viewport = document.documentElement.clientWidth;
    const anchor = this.getBoundingClientRect();
    const width = viewport < 480 ? viewport - 2 * GUTTER : PANEL_WIDTH;
    const left = Math.min(
      Math.max(anchor.right - width, GUTTER),
      viewport - GUTTER - width,
    );

    this.#panel.style.width = `${width}px`;
    this.#panel.style.left = `${left - anchor.left}px`;
  }

  #onResize = () => {
    if (this.#open) this.#place();
  };

  #onOutside = (event) => {
    if (this.#open && !event.composedPath().includes(this)) this.toggle(false);
  };

  #onKeydown(event) {
    if (event.key !== "Escape") return;

    event.stopPropagation();
    this.toggle(false);
    this.#trigger.focus();
  }

  async #render() {
    const registryUrl = this.#registryUrl();

    this.#panel.innerHTML = `<div class="skeleton" aria-label="Loading apps">${"<span></span>".repeat(6)}</div>`;

    let data;

    try {
      data = await loadRegistry(registryUrl);
    } catch {
      this.#panel.innerHTML = `
        <div class="state" role="alert">
          <p>Couldn't load the app list.</p>
          <button class="retry" type="button">Try again</button>
        </div>`;

      return;
    }

    const asset = (path) => safeUrl(path, registryUrl);
    const link = (url) => escapeHtml(safeUrl(url, registryUrl));
    const hostId = this.getAttribute("app");
    const host = data.apps?.find((app) => app.id === hostId);
    const others = (data.apps ?? []).filter((app) => app.id !== hostId);
    const products = (data.products ?? []).filter((app) => app.id !== hostId);
    const owner = data.owner ?? {};
    const year = new Date().getFullYear();

    // Grid rows animate as rows, so a row of three tiles lands together.
    const productsStart = 1 + Math.ceil(others.length / 3);
    const footerIndex = productsStart + 1 + products.length;

    const hostRow = host
      ? `<a class="host item" style="--i:0" href="${link(host.url)}">
          <img src="${escapeHtml(asset(host.icon))}" alt="" width="44" height="44">
          <span class="host-text">
            <span class="host-name">${escapeHtml(host.name)}</span>
            <span class="host-subtitle">${escapeHtml(host.subtitle)}</span>
          </span>
        </a>`
      : "";

    const tiles = others
      .map(
        (app, index) => `<li class="item" style="--i:${1 + Math.floor(index / 3)}"><a class="tile" href="${link(app.url)}" title="${escapeHtml(app.subtitle)}">
          <img src="${escapeHtml(asset(app.icon))}" alt="" width="48" height="48" loading="lazy">
          <span class="tile-name">${escapeHtml(app.name)}</span>
        </a></li>`,
      )
      .join("");

    const productRows = products
      .map(
        (app, index) => `<li class="item" style="--i:${productsStart + 1 + index}"><a class="row" href="${link(app.url)}">
          <img src="${escapeHtml(asset(app.icon))}" alt="" width="36" height="36" loading="lazy">
          <span class="row-text">
            <span class="row-name">${escapeHtml(app.name)}</span>
            <span class="row-subtitle">${escapeHtml(app.subtitle)}</span>
          </span>
          ${ICON_ARROW}
        </a></li>`,
      )
      .join("");

    const links = (host?.links ?? [])
      .map((item) => `<a href="${link(item.url)}">${escapeHtml(item.label)}</a>`)
      .join("");

    this.#panel.innerHTML = `
      ${hostRow}
      ${tiles ? `<ul class="grid">${tiles}</ul>` : ""}
      ${
        productRows
          ? `<p class="section-label item" style="--i:${productsStart}" id="products-label">${escapeHtml(data.productsLabel ?? "More")}</p>
             <ul class="products" aria-labelledby="products-label">${productRows}</ul>`
          : ""
      }
      <div class="footer item" style="--i:${footerIndex}">
        ${links}
        <a href="${link(owner.url ?? "#")}">© ${year} ${escapeHtml(owner.name ?? "")}</a>
      </div>`;
    this.#rendered = true;
  }
}

if (!customElements.get(TAG)) customElements.define(TAG, RzAppMenu);
