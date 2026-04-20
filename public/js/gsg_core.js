(function(global){
  const API_BASE = "https://api.gsgmfg.com";
  const origin = (global.location && global.location.origin) || "";
  const resolveStorefrontKey = () => global.GSG_STOREFRONT_KEY || document.body?.dataset?.storefront || "web";
  const resolveStorefrontName = () => global.GSG_STOREFRONT || document.body?.dataset?.storefrontName || resolveStorefrontKey();
  let storefrontName = resolveStorefrontName();
  let storefrontKey = resolveStorefrontKey();

  function refreshStorefront(){
    storefrontName = resolveStorefrontName();
    storefrontKey = resolveStorefrontKey();
    if (global.GSGCore) {
      global.GSGCore.storefront = storefrontName;
      global.GSGCore.storefrontKey = storefrontKey;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      refreshStorefront();
    });
  }

  let refCache = null;
  let cartCache = null;
  function readCookie(name){
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : "";
  }
  function getRef(){
    if (refCache !== null) return refCache;
    const attribution = global.GSGAttribution && typeof global.GSGAttribution.get === "function"
      ? global.GSGAttribution.get()
      : null;
    refCache = (attribution && attribution.ref) || readCookie("gsg_ref") || "";
    return refCache;
  }

  function getCartState(){
    if (window.GSGCart && typeof window.GSGCart.get === "function") {
      return window.GSGCart.get();
    }
    try {
      const raw = localStorage.getItem("gsg.cart.v1");
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    try {
      const raw = localStorage.getItem("gsg_cart_v1");
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return { items: [] };
  }

  function getCartTotalCents(){
    if (cartCache !== null) return cartCache;
    const state = getCartState();
    cartCache = (state.items || []).reduce((sum, item) => sum + Number(item.price_cents || 0) * Number(item.qty || 0), 0);
    return cartCache;
  }

  function formatCartTotal(){
    const cents = getCartTotalCents();
    if (!Number.isFinite(cents)) return "0.00";
    return (Number(cents) / 100).toFixed(2);
  }

  function invalidateCartCache(){ cartCache = null; }
  document.addEventListener("cart:updated", invalidateCartCache);

  function buildHeaders(extra){
    refreshStorefront();
    const headers = Object.assign({
      "X-GSG-Storefront": storefrontName,
      "X-GSG-Storefront-Key": storefrontKey
    }, extra || {});
    const ref = getRef();
    if (ref) headers["X-GSG-Ref"] = ref;
    headers["X-GSG-Cart-Total"] = formatCartTotal();
    return headers;
  }

  function request(path, options){
    const opts = Object.assign({ method: "GET" }, options || {});
    if (!("credentials" in opts)) opts.credentials = "include";
    if (!("mode" in opts)) opts.mode = "cors";
    const extraHeaders = opts.headers;
    opts.headers = buildHeaders(extraHeaders);
    return fetch(path.startsWith("http") ? path : `${API_BASE}${path}`, opts);
  }

  function shouldUseHistoryBack() {
    if (!document.referrer) return false;
    try {
      const ref = new URL(document.referrer);
      return ref.origin === global.location.origin;
    } catch (_) {
      return false;
    }
  }

  function initHistoryBackLinks() {
    const links = document.querySelectorAll("[data-history-back]");
    links.forEach((link) => {
      if (link.__historyBackReady) return;
      link.__historyBackReady = true;
      link.addEventListener("click", (event) => {
        if (!shouldUseHistoryBack()) return;
        event.preventDefault();
        global.history.back();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHistoryBackLinks, { once: true });
  } else {
    initHistoryBackLinks();
  }

  const core = {
    API_BASE,
    request,
    sessionEvent: function(path, payload){
      if (!path) return Promise.resolve(null);
      const body = payload && typeof payload === "object" ? payload : {};
      return request(path.startsWith("/") ? path : `/session/events/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }).catch(err => {
        console.warn("[sessionEvent] request failed", path, err);
        return null;
      });
    },
    buildHeaders,
    getRef,
    getCartTotalCents,
    formatCartTotal,
    invalidateCartCache,
    storefront: storefrontName,
    storefrontKey
  };
  global.GSGCore = core;
})(window);
