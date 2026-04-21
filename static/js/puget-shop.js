/* puget-shop.js
 *
 * Site-level cart interaction layer that sits on top of the vendored
 * gsg-ecommerce module. It owns the click-to-add interaction directly so
 * nothing depends on the vendored binding succeeding on every page, and
 * gives shoppers a clear toast when something lands in the cart.
 *
 * Storage key (`gsg_cart`) is shared with gsg-ecommerce.js so the cart
 * page, checkout page, and thanks page keep working exactly as before.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'gsg_cart';

  // -- Cart model -----------------------------------------------------------
  function readCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { return JSON.parse(raw); }
    } catch (_) {}
    return { items: [] };
  }

  function writeCart(cart) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (_) {}
  }

  function cartCount(cart) {
    var n = 0;
    for (var i = 0; i < cart.items.length; i++) { n += cart.items[i].quantity; }
    return n;
  }

  function addItem(sku, title, price, image) {
    var cart = readCart();
    var existing = null;
    for (var i = 0; i < cart.items.length; i++) {
      if (cart.items[i].sku === sku) { existing = cart.items[i]; break; }
    }
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.items.push({
        sku: sku,
        title: title,
        price: parseFloat(price),
        quantity: 1,
        image: image || ''
      });
    }
    writeCart(cart);
    updateBadges();
    return cart;
  }

  function updateBadges() {
    var n = cartCount(readCart());
    var badges = document.querySelectorAll('[data-gsg-cart-count]');
    for (var i = 0; i < badges.length; i++) {
      badges[i].textContent = n;
      badges[i].style.display = n > 0 ? '' : 'none';
    }
  }

  // -- Toast UI -------------------------------------------------------------
  function ensureToastRoot() {
    var root = document.getElementById('puget-toast-root');
    if (root) return root;
    root = document.createElement('div');
    root.id = 'puget-toast-root';
    root.setAttribute('aria-live', 'polite');
    document.body.appendChild(root);
    return root;
  }

  function showToast(title) {
    var root = ensureToastRoot();
    var toast = document.createElement('div');
    toast.className = 'puget-toast';
    toast.innerHTML =
      '<div class="puget-toast-body">' +
      '  <span class="puget-toast-tick" aria-hidden="true">&#10003;</span>' +
      '  <div class="puget-toast-copy">' +
      '    <div class="puget-toast-title">Added to cart</div>' +
      '    <div class="puget-toast-sub"></div>' +
      '  </div>' +
      '  <a class="puget-toast-cta" href="/cart/">View cart &rarr;</a>' +
      '</div>';
    toast.querySelector('.puget-toast-sub').textContent = title;
    root.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('is-visible'); });
    setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(function () { if (toast.parentNode) { toast.parentNode.removeChild(toast); } }, 300);
    }, 3600);
  }

  // -- Click handler --------------------------------------------------------
  // Capture phase on document with stopImmediatePropagation prevents the
  // vendored gsg-ecommerce click binding from also firing (which would
  // double-add the item).
  function onDocClick(e) {
    var target = e.target;
    while (target && target !== document && !(target.classList && target.classList.contains('gsg-add-to-cart'))) {
      target = target.parentNode;
    }
    if (!target || target === document) return;

    var btn = target;
    var sku = btn.getAttribute('data-gsg-sku');
    var price = btn.getAttribute('data-gsg-price');
    var title = btn.getAttribute('data-gsg-title');
    var image = btn.getAttribute('data-gsg-image') || '';
    if (!sku || !price) return;

    e.stopImmediatePropagation();

    addItem(sku, title, price, image);

    // On-button feedback (vendored CSS already styles .gsg-atc-success).
    btn.classList.add('gsg-atc-success');
    setTimeout(function () { btn.classList.remove('gsg-atc-success'); }, 1600);

    showToast(title || 'Item');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      document.addEventListener('click', onDocClick, true);
      updateBadges();
    });
  } else {
    document.addEventListener('click', onDocClick, true);
    updateBadges();
  }

  // Expose a minimal API for the hardware configurator or any future caller
  // that needs to add an item programmatically without a click.
  window.pugetShop = {
    addItem: addItem,
    getCart: readCart,
    updateBadges: updateBadges,
    showToast: showToast
  };
})();
