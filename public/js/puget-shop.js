/**
 * puget-shop.js — UX-only layer on top of gsg-ecommerce.js.
 *
 * Cart state, API client, and data-attribute wiring all live in
 * gsg-ecommerce.js. This file exists to show the site-specific
 * "Added to cart" toast when a cart:item-added event fires. Nothing
 * here owns state.
 */
(function () {
  'use strict';

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
      setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
    }, 3600);
  }

  document.addEventListener('cart:item-added', function (e) {
    var detail = e.detail || {};
    showToast(detail.title || 'Item');
  });

  window.pugetShop = { showToast: showToast };
})();
