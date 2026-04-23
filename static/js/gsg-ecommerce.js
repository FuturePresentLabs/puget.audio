/**
 * GSG e-commerce — site implementation.
 *
 * This file owns the cart, the API client, cart-rules sync, and the
 * data-attribute wiring described in the GSG Integration Guide. It
 * supersedes the vendored theme script via Hugo's static-file override.
 *
 * Exposed globals:
 *   window.GSGCart.{get,add,remove,setQty,setQtyByLineId,removeByLineId,
 *                    count,totalCents,format,clear,checkoutClean}
 *   window.GSGApi.{get,post,request}
 *   window.GSGCore.{API_BASE, getRef}
 *
 * Events:
 *   document "cart:updated" — detail = full cart state.
 */
(function () {
  'use strict';

  if (window.__gsgEcommerceInit) return;
  window.__gsgEcommerceInit = true;

  // ---------------------------------------------------------------------
  // Config & API client
  // ---------------------------------------------------------------------
  var CFG = window.GSG_CONFIG || {};
  var API_BASE = CFG.API_BASE || 'https://api.gsgmfg.com';
  var STOREFRONT = CFG.STOREFRONT || '';
  var STOREFRONT_KEY = CFG.STOREFRONT_KEY || '';

  function apiRequest(path, options) {
    options = options || {};
    var url = /^https?:/.test(path) ? path : API_BASE + path;
    var headers = Object.assign({}, options.headers || {});
    if (STOREFRONT) headers['X-GSG-Storefront'] = STOREFRONT;
    if (STOREFRONT_KEY) headers['X-GSG-Storefront-Key'] = STOREFRONT_KEY;
    return fetch(url, Object.assign({
      credentials: 'include',
      mode: 'cors'
    }, options, { headers: headers }));
  }

  function apiPost(path, data, options) {
    options = options || {};
    var headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    return apiRequest(path, Object.assign({}, options, {
      method: 'POST',
      body: JSON.stringify(data || {}),
      headers: headers
    }));
  }

  function apiGet(path) {
    return apiRequest(path, { method: 'GET' }).then(function (res) {
      if (!res.ok) throw new Error('API ' + res.status);
      return res.json();
    });
  }

  window.GSGApi = { request: apiRequest, post: apiPost, get: apiGet };

  // ---------------------------------------------------------------------
  // Cart storage (gsg.cart.v3, with cookie fallback)
  // ---------------------------------------------------------------------
  var STORAGE_KEY = 'gsg.cart.v3';
  var COOKIE_DAYS = 30;

  function defaultCartState() {
    return {
      items: [],
      cart_rules: null,
      applied_rules: [],
      rule_messages: [],
      shipping_overrides: [],
      cart_rules_error: null
    };
  }

  function readCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  function writeCookie(name, value, days) {
    var expires = '';
    if (days) {
      var d = new Date();
      d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + d.toUTCString();
    }
    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax';
  }

  function loadCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    try {
      var fromCookie = readCookie(STORAGE_KEY);
      if (fromCookie) return JSON.parse(fromCookie);
    } catch (_) {}
    return defaultCartState();
  }

  function persistCart(state) {
    var serialized;
    try { serialized = JSON.stringify(state); } catch (_) { return; }
    try { localStorage.setItem(STORAGE_KEY, serialized); } catch (_) {}
    try { writeCookie(STORAGE_KEY, serialized, COOKIE_DAYS); } catch (_) {}
  }

  function saveCart(state, opts) {
    opts = opts || {};
    persistCart(state);
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: state }));
    if (!opts.skipRuleSync) scheduleCartRulesSync();
  }

  // ---------------------------------------------------------------------
  // Line IDs + customization hashing
  // ---------------------------------------------------------------------
  var lineCounter = 0;
  function makeLineId(sku) {
    lineCounter += 1;
    return sku + '-' + Date.now() + '-' +
      Math.random().toString(36).slice(2, 7) + '-' + lineCounter;
  }

  function hashCustomizations(customizations) {
    if (!customizations || !customizations.length) return '';
    var parts = [];
    for (var i = 0; i < customizations.length; i++) {
      var c = customizations[i];
      parts.push([c.field_id, c.value, c.price_modifier_cents || 0].join('|'));
    }
    return parts.sort().join('||');
  }

  // ---------------------------------------------------------------------
  // Core cart operations
  // ---------------------------------------------------------------------
  function findBySku(items, sku) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].sku === sku && !items[i].customization_hash) return items[i];
    }
    return null;
  }

  function findByLineId(items, lineId) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].line_id === lineId) return items[i];
    }
    return null;
  }

  function findByCustomizationHash(items, sku, hash) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].sku === sku && items[i].customization_hash === hash) return items[i];
    }
    return null;
  }

  function addItem(input) {
    var state = loadCart();
    var customizations = input.customizations || [];
    var hash = hashCustomizations(customizations);
    var basePrice = Number(input.price_cents) || 0;
    var modifier = 0;
    for (var i = 0; i < customizations.length; i++) {
      modifier += Number(customizations[i].price_modifier_cents) || 0;
    }
    var totalPrice = basePrice + modifier;
    var qty = Math.max(1, parseInt(input.qty, 10) || 1);

    var existing = hash ?
      findByCustomizationHash(state.items, input.sku, hash) :
      findBySku(state.items, input.sku);

    if (existing) {
      existing.qty += qty;
      if (input.type && !existing.type) existing.type = input.type;
    } else {
      state.items.push({
        sku: input.sku,
        line_id: makeLineId(input.sku),
        title: input.title || input.sku,
        qty: qty,
        base_price_cents: basePrice,
        price_cents: totalPrice,
        marked_price_cents: Number(input.marked_price_cents) || basePrice,
        image: input.image || '',
        customizations: customizations.slice(),
        customization_hash: hash,
        // Client-side only field — used by the checkout UI to decide
        // whether to show shipping fields. Stripped from every API call.
        type: input.type || 'digital'
      });
    }
    saveCart(state);
    return state;
  }

  function setQty(sku, qty) {
    var state = loadCart();
    var item = findBySku(state.items, sku);
    if (item) {
      item.qty = Math.max(0, parseInt(qty, 10) || 0);
      state.items = state.items.filter(function (it) { return it.qty > 0; });
      saveCart(state);
    }
    return state;
  }

  function setQtyByLineId(lineId, qty) {
    var state = loadCart();
    var item = findByLineId(state.items, lineId);
    if (item) {
      item.qty = Math.max(0, parseInt(qty, 10) || 0);
      state.items = state.items.filter(function (it) { return it.qty > 0; });
      saveCart(state);
    }
    return state;
  }

  function removeBySku(sku) {
    var state = loadCart();
    state.items = state.items.filter(function (it) { return it.sku !== sku; });
    saveCart(state);
    return state;
  }

  function removeByLineId(lineId) {
    var state = loadCart();
    state.items = state.items.filter(function (it) { return it.line_id !== lineId; });
    saveCart(state);
    return state;
  }

  function clearCart() {
    var state = defaultCartState();
    saveCart(state, { skipRuleSync: true });
    return state;
  }

  function checkoutClean() {
    var state = loadCart();
    state.items = state.items.filter(function (it) { return it.qty > 0; });
    saveCart(state);
    return state;
  }

  function countItems() {
    var state = loadCart();
    var n = 0;
    for (var i = 0; i < state.items.length; i++) n += state.items[i].qty;
    return n;
  }

  function totalCents() {
    var state = loadCart();
    var overrides = state.shipping_overrides || [];
    var total = 0;
    for (var i = 0; i < state.items.length; i++) {
      total += state.items[i].price_cents * state.items[i].qty;
    }
    // shipping_overrides only affect shipping totals — line-item total stays pure
    return total;
  }

  function formatCents(cents) {
    var n = Number(cents) || 0;
    return '$' + (n / 100).toFixed(2);
  }

  window.GSGCart = {
    get: loadCart,
    add: addItem,
    remove: removeBySku,
    removeByLineId: removeByLineId,
    setQty: setQty,
    setQtyByLineId: setQtyByLineId,
    count: countItems,
    totalCents: totalCents,
    format: formatCents,
    clear: clearCart,
    checkoutClean: checkoutClean
  };

  // ---------------------------------------------------------------------
  // Cart rules — debounced POST /cart/rules/apply with merge
  // ---------------------------------------------------------------------
  var cartRulesTimer = null;

  function scheduleCartRulesSync() {
    if (cartRulesTimer) clearTimeout(cartRulesTimer);
    cartRulesTimer = setTimeout(runCartRulesSync, 200);
  }

  function mergeRuleCart(localItems, backendItems) {
    if (!backendItems || !backendItems.length) return localItems;
    var byLine = {};
    var bySku = {};
    for (var i = 0; i < localItems.length; i++) {
      byLine[localItems[i].line_id] = localItems[i];
      if (!bySku[localItems[i].sku]) bySku[localItems[i].sku] = localItems[i];
    }
    var merged = [];
    for (var j = 0; j < backendItems.length; j++) {
      var be = backendItems[j];
      var local = (be.line_id && byLine[be.line_id]) || bySku[be.sku] || null;
      if (local) {
        merged.push(Object.assign({}, local, {
          qty: be.qty,
          price_cents: be.price_cents
        }));
      } else {
        // Backend injected a bonus item — keep it as-is with the fields we have
        merged.push({
          sku: be.sku,
          line_id: be.line_id || makeLineId(be.sku),
          title: be.title || be.sku,
          qty: be.qty,
          base_price_cents: be.base_price_cents || be.price_cents || 0,
          price_cents: be.price_cents || 0,
          marked_price_cents: be.marked_price_cents || be.price_cents || 0,
          image: be.image || '',
          customizations: be.customizations || [],
          customization_hash: hashCustomizations(be.customizations || [])
        });
      }
    }
    return merged;
  }

  function runCartRulesSync() {
    var state = loadCart();
    var payload = state.items
      .filter(function (it) { return it.qty > 0; })
      .map(function (it) {
        return {
          sku: it.sku,
          qty: it.qty,
          line_id: it.line_id,
          base_price_cents: it.base_price_cents,
          price_cents: it.price_cents,
          customizations: (it.customizations || []).map(function (c) {
            return {
              field_id: c.field_id,
              value: c.value,
              price_modifier_cents: c.price_modifier_cents || 0
            };
          })
        };
      });

    if (!payload.length) {
      saveCart(Object.assign({}, state, {
        cart_rules: null,
        applied_rules: [],
        rule_messages: [],
        shipping_overrides: [],
        cart_rules_error: null
      }), { skipRuleSync: true });
      return;
    }

    apiPost('/cart/rules/apply', { cart: payload }).then(function (res) {
      if (!res.ok) throw new Error('rules ' + res.status);
      return res.json();
    }).then(function (data) {
      var fresh = loadCart();
      var mergedItems = mergeRuleCart(fresh.items, data.cart);
      saveCart(Object.assign({}, fresh, {
        items: mergedItems,
        cart_rules: data,
        applied_rules: data.applied_rules || [],
        rule_messages: data.messages || [],
        shipping_overrides: data.shipping_overrides || [],
        cart_rules_error: null
      }), { skipRuleSync: true });
    }).catch(function () {
      var fresh = loadCart();
      saveCart(Object.assign({}, fresh, {
        cart_rules_error: 'Cart promotions may be out of date.'
      }), { skipRuleSync: true });
    });
  }

  // ---------------------------------------------------------------------
  // DOM wiring — badges, totals, add-to-cart buttons, cart-row controls
  // ---------------------------------------------------------------------
  function renderBadges(state) {
    var n = 0;
    for (var i = 0; i < state.items.length; i++) n += state.items[i].qty;
    var badges = document.querySelectorAll('[data-cart-count]');
    for (var j = 0; j < badges.length; j++) {
      badges[j].textContent = n;
      badges[j].style.display = n > 0 ? '' : 'none';
    }
    var totals = document.querySelectorAll('[data-cart-total]');
    var totalStr = formatCents(totalCents());
    for (var k = 0; k < totals.length; k++) totals[k].textContent = totalStr;
  }

  function handleAddToCart(e) {
    var target = e.target;
    while (target && target !== document && !(target.hasAttribute && target.hasAttribute('data-add-to-cart'))) {
      target = target.parentNode;
    }
    if (!target || target === document) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    var sku = target.getAttribute('data-sku');
    if (!sku) return;

    var qtyAttr = target.getAttribute('data-qty');
    var qty = parseInt(qtyAttr, 10);
    var qtySelector = target.getAttribute('data-qty-selector');
    if (qtySelector) {
      var qtyEl = document.querySelector(qtySelector);
      if (qtyEl) qty = parseInt(qtyEl.value, 10) || 1;
    }
    if (!qty || qty < 1) qty = 1;

    addItem({
      sku: sku,
      title: target.getAttribute('data-title') || sku,
      price_cents: parseInt(target.getAttribute('data-price-cents'), 10) || 0,
      marked_price_cents: parseInt(target.getAttribute('data-marked-price-cents'), 10) || 0,
      image: target.getAttribute('data-image') || '',
      qty: qty,
      type: target.getAttribute('data-type') || 'digital'
    });

    // Visual feedback hook — classname for CSS, event for the toast layer.
    target.classList.add('is-added');
    setTimeout(function () { target.classList.remove('is-added'); }, 1600);
    document.dispatchEvent(new CustomEvent('cart:item-added', {
      detail: {
        sku: sku,
        title: target.getAttribute('data-title') || sku,
        qty: qty
      }
    }));

    // Session-event analytics (fire-and-forget).
    apiPost('/session/events/add-to-cart', {
      sku: sku,
      quantity: qty,
      has_customizations: false
    }).catch(function () {});
  }

  function handleCartChange(e) {
    var target = e.target;
    if (!target) return;
    if (target.matches && target.matches('[data-cart-qty]')) {
      var lineId = target.getAttribute('data-line-id');
      var sku = target.getAttribute('data-sku');
      var qty = parseInt(target.value, 10);
      if (isNaN(qty) || qty < 0) return;
      if (lineId) setQtyByLineId(lineId, qty);
      else if (sku) setQty(sku, qty);
    }
  }

  function handleCartClick(e) {
    var target = e.target;
    while (target && target !== document && !(target.hasAttribute && target.hasAttribute('data-cart-remove'))) {
      target = target.parentNode;
    }
    if (!target || target === document) return;
    e.preventDefault();
    var lineId = target.getAttribute('data-line-id');
    var sku = target.getAttribute('data-sku');
    if (lineId) removeByLineId(lineId);
    else if (sku) removeBySku(sku);
  }

  // ---------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------
  function init() {
    // Capture-phase handlers so we win over any legacy vendored binding.
    document.addEventListener('click', handleAddToCart, true);
    document.addEventListener('click', handleCartClick, true);
    document.addEventListener('change', handleCartChange, true);

    document.addEventListener('cart:updated', function (e) {
      renderBadges(e.detail);
    });

    renderBadges(loadCart());

    // Run a rules sync on load if there's anything in the cart so the UI
    // reflects fresh backend pricing.
    var current = loadCart();
    if (current.items && current.items.length) scheduleCartRulesSync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Newsletter.js reads GSGCore.API_BASE as a fallback config source.
  window.GSGCore = window.GSGCore || {};
  window.GSGCore.API_BASE = API_BASE;
  window.GSGCore.getRef = function () {
    try {
      var raw = localStorage.getItem('attribution.v1');
      if (!raw) return '';
      var data = JSON.parse(raw);
      return data && data.ref ? data.ref : '';
    } catch (_) { return ''; }
  };
})();
