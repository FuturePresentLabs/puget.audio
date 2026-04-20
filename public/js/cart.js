/* cart.js — tiny, dependency-free cart with localStorage + cookie fallback */

(function () {
  const STORAGE_KEY = "gsg.cart.v1";
  const COOKIE_KEY  = "gsg_cart_v1";
  const COOKIE_DAYS = 30;
  const API_BASE = "https://api.gsgmfg.com";
  const CART_RULE_ENDPOINT = "/cart/rules/apply";
  const DEFAULT_STATE = {
    items: [],
    cart_rules: null,
    applied_rules: [],
    rule_messages: [],
    shipping_overrides: [],
    cart_rules_error: null
  };

  const hasLocal = (() => {
    try {
      const k = "__t";
      localStorage.setItem(k, "1");
      localStorage.removeItem(k);
      return true;
    } catch (_) { return false; }
  })();

  function readCookie(name) {
    const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g,'\\$1') + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : "";
  }
  function writeCookie(name, value, days) {
    const expires = new Date(Date.now() + days*864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; samesite=lax`;
  }

  function apiFetch(path, options){
    if (window.GSGCore && typeof window.GSGCore.request === "function") {
      return window.GSGCore.request(path, options);
    }
    const opts = Object.assign({ credentials: "include" }, options || {});
    const url = String(path).startsWith("http") ? path : `${API_BASE}${path}`;
    return fetch(url, opts);
  }

  function normalizeState(raw) {
    const base = Object.assign({}, DEFAULT_STATE);
    if (raw && typeof raw === "object") {
      Object.keys(base).forEach((key) => {
        if (key === "items") return;
        if (Object.prototype.hasOwnProperty.call(raw, key)) {
          base[key] = raw[key];
        }
      });
      if (Array.isArray(raw.items)) {
        base.items = raw.items.map((item) => Object.assign({}, item));
      }
    }
    if (!Array.isArray(base.items)) base.items = [];
    // ensure qty & price are numeric
    base.items = base.items
      .filter((item) => item && typeof item === "object" && item.sku)
      .map((item) => {
        const next = Object.assign({}, item);
        next.qty = Math.max(0, Number(next.qty || 0));
        next.price_cents = Number.isFinite(Number(next.price_cents)) ? Number(next.price_cents) : 0;
        if (Object.prototype.hasOwnProperty.call(next, "marked_price_cents")) {
          const marked = Number(next.marked_price_cents);
          if (Number.isFinite(marked) && marked > 0) next.marked_price_cents = marked;
          else delete next.marked_price_cents;
        }
        return enrichWithSkuMeta(next);
      });
    base.applied_rules = Array.isArray(base.applied_rules) ? base.applied_rules : [];
    base.rule_messages = Array.isArray(base.rule_messages) ? base.rule_messages : [];
    base.shipping_overrides = Array.isArray(base.shipping_overrides) ? base.shipping_overrides : [];
    base.cart_rules_error = base.cart_rules_error ? String(base.cart_rules_error) : null;
    return base;
  }

  const skuMetaLog = new Set();

  function logSkuMeta(sku, status){
    if (!sku) return;
    const key = `${status}:${sku}`;
    if (skuMetaLog.has(key)) return;
    skuMetaLog.add(key);
    console.log("[cart] sku meta", { sku, status });
  }

  function getSkuMeta(sku){
    const map = window.GSG_SKU_META || {};
    const raw = typeof sku === "string" ? sku.trim() : "";
    if (!raw) return null;
    const meta = map[raw] || map[raw.toUpperCase()] || map[raw.toLowerCase()] || null;
    if (meta) logSkuMeta(raw, "found");
    else logSkuMeta(raw, "missing");
    return meta;
  }

  function enrichWithSkuMeta(item){
    if (!item || !item.sku) return item;
    const meta = getSkuMeta(item.sku);
    if (!meta) return item;
    if ((!item.title || item.title === item.sku) && meta.title) item.title = meta.title;
    if ((!item.short || item.short === "") && meta.short) item.short = meta.short;
    const nextPrice = Number(meta.price_cents);
    if (!Number.isFinite(Number(item.price_cents)) || Number(item.price_cents) <= 0) {
      if (Number.isFinite(nextPrice) && nextPrice > 0) item.price_cents = nextPrice;
    }
    const nextMarked = Number(meta.marked_price_cents);
    if ((!Number.isFinite(Number(item.marked_price_cents)) || Number(item.marked_price_cents) <= 0) && Number.isFinite(nextMarked) && nextMarked > 0) {
      item.marked_price_cents = nextMarked;
    }
    if ((!item.image || item.image === "") && meta.image) item.image = meta.image;
    return item;
  }

  function load() {
    try {
      if (hasLocal) {
        const raw = localStorage.getItem(STORAGE_KEY);
        const result = raw ? normalizeState(JSON.parse(raw)) : normalizeState();
        console.log("[cart] load() - customizations:", result.items.map(i => ({ sku: i.sku, customizations: i.customizations })));
        return result;
      } else {
        const raw = readCookie(COOKIE_KEY);
        const result = raw ? normalizeState(JSON.parse(raw)) : normalizeState();
        console.log("[cart] load() - customizations:", result.items.map(i => ({ sku: i.sku, customizations: i.customizations })));
        return result;
      }
    } catch (_) { return normalizeState(); }
  }

  function save(state, options) {
    const opts = options || {};
    const normalized = normalizeState(state);
    console.log("[cart] save() - normalized state customizations:", normalized.items.map(i => ({ sku: i.sku, customizations: i.customizations })));
    const raw = JSON.stringify(normalized);
    if (hasLocal) localStorage.setItem(STORAGE_KEY, raw);
    else writeCookie(COOKIE_KEY, raw, COOKIE_DAYS);
    // Verify what was actually written
    const verify = hasLocal ? localStorage.getItem(STORAGE_KEY) : readCookie(COOKIE_KEY);
    const verifyParsed = JSON.parse(verify || "{}");
    console.log("[cart] save() - verified storage customizations:", (verifyParsed.items || []).map(i => ({ sku: i.sku, customizations: i.customizations })));
    dispatch(normalized);
    if (!opts.skipRuleSync) scheduleCartRulesSync();
  }

  function dispatch(detail) {
    document.dispatchEvent(new CustomEvent("cart:updated", { detail: detail || Cart.get() }));
  }

  const money = (cents) => {
    const n = Number(cents || 0) / 100;
    return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
  };

  function postSessionEvent(name, payload){
    if (window.GSGCore && typeof window.GSGCore.sessionEvent === "function"){
      return window.GSGCore.sessionEvent(name, payload);
    }
    const body = payload && typeof payload === "object" ? payload : {};
    const storefront = window.GSG_STOREFRONT || document.body?.dataset?.storefrontName || "web";
    return fetch(`https://api.gsgmfg.com/session/events/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-GSG-Storefront": storefront
      },
      credentials: "include",
      body: JSON.stringify(body)
    }).catch(()=>null);
  }

  function buildCartPayload(state){
    const src = state && Array.isArray(state.items) ? state.items : [];
    return src
      .filter((item) => item && item.sku && Number(item.qty) > 0)
      .map((item) => ({
        sku: item.sku,
        qty: Math.max(0, Math.round(Number(item.qty) || 0))
      }));
  }

  function mergeRuleCart(currentItems, ruleItems){
    if (!Array.isArray(ruleItems)) return Array.isArray(currentItems) ? currentItems.slice() : [];

    // Separate items with customizations (preserve as-is) from regular items
    const customizedItems = (currentItems || []).filter(item => item && item.customizations && item.customizations.length > 0);
    const regularItems = (currentItems || []).filter(item => item && (!item.customizations || item.customizations.length === 0));

    // Build meta map only for regular items (no customizations)
    const meta = new Map();
    regularItems.forEach((item) => {
      if (item && item.sku) meta.set(item.sku, item);
    });

    // Merge rule items with regular items
    const mergedRegular = ruleItems
      .map((entry) => {
        if (!entry || !entry.sku) return null;
        const prev = meta.get(entry.sku) || {};
        const merged = Object.assign({}, prev, entry);
        const qty = Number(entry.qty ?? prev.qty ?? 0);
        merged.qty = Math.max(0, Number.isFinite(qty) ? qty : 0);
        if (!("price_cents" in entry) && prev.price_cents != null) merged.price_cents = prev.price_cents;
        if (!("title" in entry) && prev.title) merged.title = prev.title;
        if (!("image" in entry) && prev.image) merged.image = prev.image;
        if (!("marked_price_cents" in entry) && prev.marked_price_cents) merged.marked_price_cents = prev.marked_price_cents;
        if (!merged.title) merged.title = entry.title || entry.sku;
        if (!("price_cents" in merged) || !Number.isFinite(merged.price_cents)) merged.price_cents = 0;
        if (!("image" in merged)) merged.image = merged.image || "";
        return enrichWithSkuMeta(merged);
      })
      .filter(Boolean);

    // Return customized items (preserved) followed by merged regular items
    return [...customizedItems, ...mergedRegular];
  }

  let ruleSyncTimer = null;
  let ruleSyncInFlight = false;
  let ruleSyncPending = false;

  async function runCartRulesSync(){
    if (ruleSyncInFlight) {
      ruleSyncPending = true;
      return;
    }
    ruleSyncInFlight = true;
    const state = load();
    const cartPayload = buildCartPayload(state);

    if (!cartPayload.length) {
      const cleared = Object.assign({}, state, {
        items: state.items.filter((item) => item && Number(item.qty) > 0),
        cart_rules: null,
        applied_rules: [],
        rule_messages: [],
        shipping_overrides: [],
        cart_rules_error: null
      });
      save(cleared, { skipRuleSync: true });
      ruleSyncInFlight = false;
      if (ruleSyncPending) {
        ruleSyncPending = false;
        scheduleCartRulesSync();
      }
      return;
    }

    try {
      const res = await apiFetch(CART_RULE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: cartPayload })
      });
      if (!res.ok) {
        let detail = "";
        try { detail = await res.text(); } catch(_) {}
        throw new Error(detail || `HTTP ${res.status}`);
      }
      let data = null;
      try { data = await res.json(); } catch(_) { data = {}; }
      console.log("[cart] Rules sync - before merge", {
        currentItems: state.items.map(i => ({ sku: i.sku, customizations: i.customizations })),
        ruleItems: data?.cart
      });
      const nextItems = mergeRuleCart(state.items, data && data.cart);
      console.log("[cart] Rules sync - after merge", {
        nextItems: nextItems.map(i => ({ sku: i.sku, customizations: i.customizations }))
      });
      const nextState = Object.assign({}, state, {
        items: nextItems,
        cart_rules: data || null,
        applied_rules: Array.isArray(data?.applied_rules) ? data.applied_rules : [],
        rule_messages: Array.isArray(data?.messages) ? data.messages : [],
        shipping_overrides: Array.isArray(data?.shipping_overrides) ? data.shipping_overrides : [],
        cart_rules_error: null
      });
      save(nextState, { skipRuleSync: true });
    } catch (err) {
      console.warn("[cart] cart rules sync failed", err);
      const nextState = Object.assign({}, state, {
        cart_rules_error: "Cart promotions may be out of date."
      });
      save(nextState, { skipRuleSync: true });
    } finally {
      ruleSyncInFlight = false;
      if (ruleSyncPending) {
        ruleSyncPending = false;
        scheduleCartRulesSync();
      }
    }
  }

  function scheduleCartRulesSync(){
    if (ruleSyncTimer) clearTimeout(ruleSyncTimer);
    ruleSyncTimer = setTimeout(() => {
      ruleSyncTimer = null;
      runCartRulesSync();
    }, 200);
  }

  const Cart = {
    get() { return load(); },
    count() { return load().items.reduce((a,i)=>a + Number(i.qty || 0),0); },
    totalCents() { return load().items.reduce((a,i)=>a + (Number(i.price_cents || 0) * Number(i.qty || 0)), 0); },
    format: money,

    add({sku, title, price_cents, marked_price_cents, image, qty=1, customizations}) {
      console.log("[cart] Cart.add called", { sku, title, price_cents, marked_price_cents, image, qty, customizations });
      if (!sku) {
        console.warn("[cart] Cart.add aborted — no SKU provided");
        return;
      }
      const st = load();
      const hasCustomizations = Array.isArray(customizations) && customizations.length > 0;
      // If item has customizations, treat it as a unique line item (don't merge with existing)
      const i = hasCustomizations ? -1 : st.items.findIndex(x => x.sku === sku && !x.customizations?.length);
      const price = Number(price_cents || 0);
      const marked = Number(marked_price_cents || 0);
      const qtyNumber = Number(qty || 1);
      const normalizedQty = Number.isFinite(qtyNumber) && qtyNumber > 0 ? qtyNumber : 1;
      if (i >= 0) {
        st.items[i].qty += normalizedQty;
        if (Number.isFinite(price)) st.items[i].price_cents = price;
        if (Number.isFinite(marked) && marked > 0) st.items[i].marked_price_cents = marked;
        else delete st.items[i].marked_price_cents;
        if (title) st.items[i].title = title;
        if (image) st.items[i].image = image;
      } else {
        const item = {
          sku,
          title: title || sku,
          price_cents: Number.isFinite(price) ? price : 0,
          image: image || "",
          qty: normalizedQty,
        };
        if (Number.isFinite(marked) && marked > 0) {
          item.marked_price_cents = marked;
        }
        if (hasCustomizations) {
          item.customizations = customizations;
        }
        st.items.push(item);
      }
      console.log("[cart] Cart.add next state", st);
      save(st);
      // Verify what was actually saved
      const saved = load();
      console.log("[cart] Cart.add verified saved state", saved.items.map(i => ({ sku: i.sku, customizations: i.customizations })));
      postSessionEvent("add-to-cart", { sku, quantity: normalizedQty });
    },

    setQty(sku, qty, meta) {
      const st = load();
      const i = st.items.findIndex(x => x.sku === sku);
      if (i < 0) return;
      const q = Math.max(0, Number(qty||0));
      const prevQty = st.items[i].qty;
      st.items[i].qty = q;  // keep zero in state, don’t remove immediately
      let changed = q !== prevQty;
      if (meta && typeof meta === "object") {
        if (Object.prototype.hasOwnProperty.call(meta, "price_cents")) {
          const nextPrice = Number(meta.price_cents || 0);
          if (Number.isFinite(nextPrice) && st.items[i].price_cents !== nextPrice) {
            st.items[i].price_cents = nextPrice;
            changed = true;
          }
        }
        if (Object.prototype.hasOwnProperty.call(meta, "marked_price_cents")) {
          const nextMarked = Number(meta.marked_price_cents || 0);
          if (Number.isFinite(nextMarked) && nextMarked > 0 && st.items[i].marked_price_cents !== nextMarked) {
            st.items[i].marked_price_cents = nextMarked;
            changed = true;
          }
          else if ((!Number.isFinite(nextMarked) || nextMarked <= 0) && Object.prototype.hasOwnProperty.call(st.items[i], "marked_price_cents")) {
            delete st.items[i].marked_price_cents;
            changed = true;
          }
        }
        if (meta.title && meta.title !== st.items[i].title) {
          st.items[i].title = meta.title;
          changed = true;
        }
        if (meta.image && meta.image !== st.items[i].image) {
          st.items[i].image = meta.image;
          changed = true;
        }
      }
      if (!changed) return;
      save(st);
    },

    remove(sku) {
      const st = load();
      const next = st.items.filter(i => i.sku !== sku);
      if (next.length === st.items.length) return;
      st.items = next;
      save(st);
    },

    removeByIndex(idx) {
      const st = load();
      const index = Number(idx);
      if (!Number.isFinite(index) || index < 0 || index >= st.items.length) return;
      st.items.splice(index, 1);
      save(st);
    },

    setQtyByIndex(idx, qty) {
      const st = load();
      const index = Number(idx);
      if (!Number.isFinite(index) || index < 0 || index >= st.items.length) return;
      const q = Math.max(0, Number(qty || 0));
      if (st.items[index].qty === q) return;
      st.items[index].qty = q;
      save(st);
    },

    clear() { save({items:[]}); },

    checkoutClean() {
      const st = load();
      const filtered = st.items.filter(i => Number(i.qty) > 0);
      if (filtered.length === st.items.length) return;
      st.items = filtered;
      save(st);
    }
  };

  // Expose tiny API
  window.GSGCart = Cart;

  /* === Declarative DOM hooks ========================================= */

  // 1) Add-to-cart buttons
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-add-to-cart]");
    if (!el) return;
    console.log("[cart] add-to-cart click detected", { target: e.target, button: el });
    e.preventDefault();
    const sku   = el.getAttribute("data-sku");
    const title = el.getAttribute("data-title") || sku;
    const price = Number(el.getAttribute("data-price-cents") || 0);
    const marked = Number(el.getAttribute("data-marked-price-cents") || 0);
    const image = el.getAttribute("data-image") || "";
    const qtyEl = document.querySelector(el.getAttribute("data-qty-selector"));
    const qty   = qtyEl ? Number(qtyEl.value || 1) : Number(el.getAttribute("data-qty") || 1);
    if (!sku) {
      console.warn("[cart] add-to-cart aborted — missing SKU", { button: el, attrs: el.dataset });
      return;
    }
    console.log("[cart] add-to-cart payload", { sku, title, price_cents: price, marked_price_cents: marked, image, qty });
    Cart.add({ sku, title, price_cents: price, marked_price_cents: marked, image, qty });
  });

  // 1b) Combo buttons
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-combo-add]");
    if (!el) return;
    e.preventDefault();
    const raw = el.getAttribute("data-combo-items");
    if (!raw) return;
    let items;
    try {
      items = JSON.parse(raw);
    } catch (_) {
      return;
    }
    console.log("[cart] combo add triggered", { count: items.length, items });
    items.forEach((item, idx) => {
      if (!item || typeof item !== "object") return;
      if (!item.sku) {
        console.warn("[cart] combo add skipped — missing SKU", { index: idx, item });
        return;
      }
      console.log("[cart] combo add item", { index: idx, sku: item.sku, qty: item.qty, title: item.title });
      Cart.add({
        sku: item.sku,
        title: item.title || item.sku,
        price_cents: item.price_cents,
        marked_price_cents: item.marked_price_cents,
        image: item.image,
        qty: item.qty || 1
      });
    });
  });

  // 1c) Bundle controls
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-bundle-plus],[data-bundle-minus],[data-bundle-checkout]");
    if (!btn) return;
    const action = btn.hasAttribute("data-bundle-plus")
      ? "plus"
      : btn.hasAttribute("data-bundle-minus")
        ? "minus"
        : "checkout";
    const control = btn.closest("[data-bundle-control]");
    const bundleId = control ? control.getAttribute("data-bundle-id") : null;
    const disabled = control ? control.hasAttribute("data-bundle-disabled") : false;
    const itemsAttr = control ? control.getAttribute("data-bundle-items") : null;
    console.log("[cart] bundle control click", { action, bundleId, disabled, target: btn, itemsAttr });
  });

  function logBundleControlPresence() {
    const controls = document.querySelectorAll("[data-bundle-control]");
    console.log("[cart] detected bundle controls", { count: controls.length });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", logBundleControlPresence);
  else logBundleControlPresence();

  const bundleControls = [];

  function parseBundleItems(raw) {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn("[cart] failed to parse bundle items", err);
      return [];
    }
  }

  function computeBundleCount(bundleItems, cartItems) {
    if (!Array.isArray(bundleItems) || bundleItems.length === 0) return 0;
    if (!Array.isArray(cartItems) || cartItems.length === 0) return 0;
    let minBundles = Infinity;
    for (let i = 0; i < bundleItems.length; i++) {
      const needed = Math.max(1, Number(bundleItems[i].qty) || 1);
      const entry = cartItems.find((item) => item && item.sku === bundleItems[i].sku);
      if (!entry || Number(entry.qty || 0) < needed) return 0;
      const possible = Math.floor(Number(entry.qty || 0) / needed);
      minBundles = Math.min(minBundles, possible);
    }
    return Number.isFinite(minBundles) ? Math.max(0, minBundles) : 0;
  }

  function ensureBundleToast() {
    let toast = document.querySelector("[data-bundle-toast]");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "cart-toast";
      toast.setAttribute("data-bundle-toast", "true");
      document.body.appendChild(toast);
    }
    return toast;
  }

  function showBundleToast(message) {
    const toast = ensureBundleToast();
    toast.textContent = message || "Bundle updated";
    toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("show"), 2000);
  }

  function syncBundleControls(state) {
    const currentItems = state && Array.isArray(state.items) ? state.items : Cart.get().items;
    bundleControls.forEach((entry) => {
      if (!entry.node.isConnected) return;
      const disabled = entry.node.hasAttribute("data-bundle-disabled");
      const count = disabled ? 0 : computeBundleCount(entry.items, currentItems);
      const isEmpty = count <= 0;
      entry.node.setAttribute("data-bundle-state", isEmpty ? "empty" : "active");
      if (entry.count) {
        entry.count.textContent = count;
        entry.count.hidden = isEmpty;
      }
      if (entry.status) {
        if (disabled) entry.status.textContent = "Sold out";
        else if (count > 0) {
          const labelSingle = entry.unitLabel || "bundle";
          const labelPlural = entry.unitPlural || `${labelSingle}s`;
          const label = count === 1 ? labelSingle : labelPlural;
          entry.status.textContent = `${count} ${label} in cart`;
        } else entry.status.textContent = "Not in cart yet";
      }
      if (entry.minus) {
        entry.minus.hidden = isEmpty;
        entry.minus.disabled = disabled;
      }
      if (entry.plus) {
        entry.plus.disabled = disabled;
        if (isEmpty) {
          entry.plus.classList.add("bundle-control__btn--full");
          if (entry.plus.textContent !== entry.addLabel) entry.plus.textContent = entry.addLabel;
        } else {
          entry.plus.classList.remove("bundle-control__btn--full");
          if (entry.plus.textContent !== "+") entry.plus.textContent = "+";
        }
      }
      if (entry.checkout) {
        const inactive = disabled || isEmpty;
        entry.checkout.disabled = inactive;
        entry.checkout.hidden = inactive;
      }
    });
  }

  function addBundle(entry) {
    if (entry.node.hasAttribute("data-bundle-disabled")) return;
    if (!entry.items.length) return;
    // Re-read items from DOM attribute in case they were updated after init
    const freshItems = parseBundleItems(entry.node.getAttribute("data-bundle-items"));
    const itemsToUse = freshItems.length ? freshItems : entry.items;
    const rawAttr = entry.node.getAttribute("data-bundle-items");
    console.log("[cart] bundle add triggered", {
      bundleId: entry.id,
      entryItems: entry.items,
      freshItems: freshItems,
      usingFresh: freshItems.length > 0,
      rawAttribute: rawAttr,
      freshItemsCustomizations: freshItems.map(i => i.customizations),
      elementId: entry.node.id,
      elementBundleId: entry.node.getAttribute("data-bundle-id"),
      element: entry.node
    });
    itemsToUse.forEach((item) => {
      if (!item || !item.sku) {
        console.warn("[cart] bundle item missing SKU", item);
        return;
      }
      console.log("[cart] Adding item with customizations", { sku: item.sku, customizations: item.customizations });
      Cart.add({
        sku: item.sku,
        title: item.title || item.sku,
        price_cents: Number(item.price_cents) || 0,
        marked_price_cents: Number(item.marked_price_cents) || 0,
        image: item.image || "",
        qty: Number(item.qty) || 1,
        customizations: item.customizations || null,
      });
    });
    showBundleToast(entry.toast || "Bundle added to cart");
  }

  function removeBundle(entry) {
    if (entry.node.hasAttribute("data-bundle-disabled")) return;
    const cartItems = Cart.get().items;
    const count = computeBundleCount(entry.items, cartItems);
    if (count <= 0) return;
    console.log("[cart] bundle remove triggered", { bundleId: entry.id, count });
    entry.items.forEach((item) => {
      if (!item || !item.sku) return;
      const needed = Math.max(1, Number(item.qty) || 1);
      const currentEntry = cartItems.find((cartItem) => cartItem && cartItem.sku === item.sku);
      const nextQty = Math.max(0, Number(currentEntry && currentEntry.qty || 0) - needed);
      Cart.setQty(item.sku, nextQty);
    });
    showBundleToast("Bundle removed");
  }

  function initBundleControls() {
    const nodes = document.querySelectorAll("[data-bundle-control]");
    console.log("[cart] initializing bundle controls", { count: nodes.length });
    nodes.forEach((node) => {
      if (!node) return;
      const items = parseBundleItems(node.getAttribute("data-bundle-items"));
      const entry = {
        node,
        id: node.getAttribute("data-bundle-id") || "",
        items,
        minus: node.querySelector("[data-bundle-minus]"),
        plus: node.querySelector("[data-bundle-plus]"),
        count: node.querySelector("[data-bundle-count]"),
        checkout: node.querySelector("[data-bundle-checkout]"),
        status: node.querySelector("[data-bundle-status]"),
        checkoutHref: node.getAttribute("data-checkout-href") || "/cart/",
        toast: node.getAttribute("data-toast-message") || "Bundle updated",
        addLabel: node.getAttribute("data-label-add") || "Add to cart",
        unitLabel: node.getAttribute("data-bundle-unit") || "bundle",
        unitPlural: node.getAttribute("data-bundle-unit-plural") || "",
      };
      if (!entry.plus) return;
      if (entry.minus) entry.minus.addEventListener("click", (evt) => { evt.preventDefault(); removeBundle(entry); });
      entry.plus.addEventListener("click", (evt) => {
        console.log("[cart] Plus button clicked!", { bundleId: entry.id, items: entry.items });
        evt.preventDefault();
        addBundle(entry);
      });
      if (entry.checkout) {
        entry.checkout.addEventListener("click", (evt) => {
          if (entry.checkout.disabled) return;
          evt.preventDefault();
          window.location.href = entry.checkoutHref;
        });
      }
      node.__bundleEntry = entry;
      bundleControls.push(entry);
    });
    syncBundleControls(Cart.get());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initBundleControls);
  else initBundleControls();
  document.addEventListener("cart:updated", (e) => syncBundleControls(e.detail));

  // 2) Quantity inputs
  document.addEventListener("input", (e) => {
    const el = e.target.closest("[data-cart-qty]");
    if (!el) return;
    const idx = el.getAttribute("data-idx");
    const qty = Number(el.value || 0);
    if (idx !== null && idx !== undefined && idx !== "") {
      Cart.setQtyByIndex(idx, qty);
    } else {
      const sku = el.getAttribute("data-sku");
      Cart.setQty(sku, qty);
    }
  });

  // 3) Remove buttons
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-cart-remove]");
    if (!el) return;
    e.preventDefault();
    const idx = el.getAttribute("data-idx");
    if (idx !== null && idx !== undefined && idx !== "") {
      Cart.removeByIndex(idx);
    } else {
      Cart.remove(el.getAttribute("data-sku"));
    }
  });

  // 4) Badge / totals auto-update
  function renderBadges(state) {
    document.querySelectorAll("[data-cart-count]").forEach(n => n.textContent = String(Cart.count()));
    document.querySelectorAll("[data-cart-total]").forEach(n => n.textContent = money(Cart.totalCents()));
  }
  document.addEventListener("cart:updated", (e) => renderBadges(e.detail));
  // Initial render
  renderBadges(Cart.get());
  scheduleCartRulesSync();

})();
