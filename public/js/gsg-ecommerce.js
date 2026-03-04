/**
 * gsg-ecommerce — Cart & Checkout Module
 *
 * Provides localStorage-based cart management, add-to-cart interactions,
 * cart page rendering, checkout form handling, and post-purchase display.
 *
 * Configuration is read from window.GSG_ECOMMERCE_CONFIG (set by the
 * gsg-ecommerce/scripts.html partial).
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'gsg_cart';
  var ORDER_KEY = 'gsg_last_order';

  // ---------------------------------------------------------------------------
  // Cart data helpers
  // ---------------------------------------------------------------------------

  function getCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return { items: [] };
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) { /* ignore */ }
  }

  function addItem(sku, title, price, image) {
    var cart = getCart();
    var existing = null;
    for (var i = 0; i < cart.items.length; i++) {
      if (cart.items[i].sku === sku) { existing = cart.items[i]; break; }
    }
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.items.push({ sku: sku, title: title, price: parseFloat(price), quantity: 1, image: image || '' });
    }
    saveCart(cart);
    updateAllBadges();
    return cart;
  }

  function removeItem(sku) {
    var cart = getCart();
    cart.items = cart.items.filter(function (item) { return item.sku !== sku; });
    saveCart(cart);
    updateAllBadges();
    return cart;
  }

  function updateQuantity(sku, qty) {
    var cart = getCart();
    for (var i = 0; i < cart.items.length; i++) {
      if (cart.items[i].sku === sku) {
        cart.items[i].quantity = Math.max(1, parseInt(qty, 10) || 1);
        break;
      }
    }
    saveCart(cart);
    updateAllBadges();
    return cart;
  }

  function clearCart() {
    saveCart({ items: [] });
    updateAllBadges();
  }

  function cartTotal(cart) {
    var total = 0;
    for (var i = 0; i < cart.items.length; i++) {
      total += cart.items[i].price * cart.items[i].quantity;
    }
    return total;
  }

  function cartCount(cart) {
    var count = 0;
    for (var i = 0; i < cart.items.length; i++) {
      count += cart.items[i].quantity;
    }
    return count;
  }

  function formatPrice(n) {
    return '$' + parseFloat(n).toFixed(2);
  }

  // ---------------------------------------------------------------------------
  // Badge / count updates (runs on every page)
  // ---------------------------------------------------------------------------

  function updateAllBadges() {
    var cart = getCart();
    var count = cartCount(cart);
    var badges = document.querySelectorAll('[data-gsg-cart-count]');
    for (var i = 0; i < badges.length; i++) {
      badges[i].textContent = count;
      badges[i].style.display = count > 0 ? '' : 'none';
    }
  }

  // ---------------------------------------------------------------------------
  // Add-to-Cart buttons
  // ---------------------------------------------------------------------------

  function initAddToCartButtons() {
    var buttons = document.querySelectorAll('.gsg-add-to-cart');
    for (var i = 0; i < buttons.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var sku = btn.getAttribute('data-gsg-sku');
          var price = btn.getAttribute('data-gsg-price');
          var title = btn.getAttribute('data-gsg-title');
          var image = btn.getAttribute('data-gsg-image') || '';

          addItem(sku, title, price, image);

          // Visual feedback
          btn.classList.add('gsg-atc-success');
          setTimeout(function () {
            btn.classList.remove('gsg-atc-success');
          }, 1800);
        });
      })(buttons[i]);
    }
  }

  // ---------------------------------------------------------------------------
  // Cart page rendering
  // ---------------------------------------------------------------------------

  function renderCartPage() {
    var emptyEl = document.querySelector('[data-gsg-cart-empty]');
    var contentsEl = document.querySelector('[data-gsg-cart-contents]');
    var itemsEl = document.querySelector('[data-gsg-cart-items]');
    var totalEl = document.querySelector('[data-gsg-cart-total]');

    if (!itemsEl) return; // not on cart page

    var cart = getCart();

    if (cart.items.length === 0) {
      if (emptyEl) emptyEl.style.display = '';
      if (contentsEl) contentsEl.style.display = 'none';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (contentsEl) contentsEl.style.display = '';

    var html = '';
    for (var i = 0; i < cart.items.length; i++) {
      var item = cart.items[i];
      html += '<div class="gsg-cart-item" data-sku="' + item.sku + '">';
      html += '  <div class="gsg-cart-item-info">';
      html += '    <span class="gsg-cart-item-title">' + escapeHtml(item.title) + '</span>';
      html += '    <span class="gsg-cart-item-sku">' + escapeHtml(item.sku) + '</span>';
      html += '  </div>';
      html += '  <div class="gsg-cart-item-qty">';
      html += '    <button class="gsg-qty-btn gsg-qty-minus" data-gsg-qty-minus="' + item.sku + '" type="button" aria-label="Decrease quantity">&minus;</button>';
      html += '    <span class="gsg-qty-value">' + item.quantity + '</span>';
      html += '    <button class="gsg-qty-btn gsg-qty-plus" data-gsg-qty-plus="' + item.sku + '" type="button" aria-label="Increase quantity">+</button>';
      html += '  </div>';
      html += '  <div class="gsg-cart-item-price">' + formatPrice(item.price * item.quantity) + '</div>';
      html += '  <button class="gsg-cart-item-remove" data-gsg-remove="' + item.sku + '" type="button" aria-label="Remove item">';
      html += '    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      html += '  </button>';
      html += '</div>';
    }
    itemsEl.innerHTML = html;
    if (totalEl) totalEl.textContent = formatPrice(cartTotal(cart));

    // Bind cart item actions
    var removeButtons = itemsEl.querySelectorAll('[data-gsg-remove]');
    for (var j = 0; j < removeButtons.length; j++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          removeItem(btn.getAttribute('data-gsg-remove'));
          renderCartPage();
        });
      })(removeButtons[j]);
    }

    var minusButtons = itemsEl.querySelectorAll('[data-gsg-qty-minus]');
    for (var k = 0; k < minusButtons.length; k++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var sku = btn.getAttribute('data-gsg-qty-minus');
          var cart = getCart();
          for (var m = 0; m < cart.items.length; m++) {
            if (cart.items[m].sku === sku) {
              if (cart.items[m].quantity <= 1) {
                removeItem(sku);
              } else {
                updateQuantity(sku, cart.items[m].quantity - 1);
              }
              break;
            }
          }
          renderCartPage();
        });
      })(minusButtons[k]);
    }

    var plusButtons = itemsEl.querySelectorAll('[data-gsg-qty-plus]');
    for (var p = 0; p < plusButtons.length; p++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var sku = btn.getAttribute('data-gsg-qty-plus');
          var cart = getCart();
          for (var m = 0; m < cart.items.length; m++) {
            if (cart.items[m].sku === sku) {
              updateQuantity(sku, cart.items[m].quantity + 1);
              break;
            }
          }
          renderCartPage();
        });
      })(plusButtons[p]);
    }
  }

  // ---------------------------------------------------------------------------
  // Checkout page
  // ---------------------------------------------------------------------------

  function renderCheckoutPage() {
    var layoutEl = document.querySelector('[data-gsg-checkout-layout]');
    var emptyEl = document.querySelector('[data-gsg-checkout-empty]');
    var itemsEl = document.querySelector('[data-gsg-checkout-items]');
    var totalEl = document.querySelector('[data-gsg-checkout-total]');

    if (!layoutEl) return; // not on checkout page

    var cart = getCart();

    if (cart.items.length === 0) {
      layoutEl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = '';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';

    // Render order summary
    var html = '';
    for (var i = 0; i < cart.items.length; i++) {
      var item = cart.items[i];
      html += '<div class="gsg-checkout-item">';
      html += '  <span class="gsg-checkout-item-name">' + escapeHtml(item.title) + '</span>';
      html += '  <span class="gsg-checkout-item-qty">&times; ' + item.quantity + '</span>';
      html += '  <span class="gsg-checkout-item-price">' + formatPrice(item.price * item.quantity) + '</span>';
      html += '</div>';
    }
    if (itemsEl) itemsEl.innerHTML = html;
    if (totalEl) totalEl.textContent = formatPrice(cartTotal(cart));

    // Card number formatting
    var cardInput = document.getElementById('gsg-card-number');
    if (cardInput) {
      cardInput.addEventListener('input', function () {
        var v = this.value.replace(/\D/g, '').substring(0, 16);
        var formatted = v.replace(/(\d{4})(?=\d)/g, '$1 ');
        this.value = formatted;
      });
    }

    // Expiry formatting
    var expiryInput = document.getElementById('gsg-card-expiry');
    if (expiryInput) {
      expiryInput.addEventListener('input', function () {
        var v = this.value.replace(/\D/g, '').substring(0, 4);
        if (v.length > 2) v = v.substring(0, 2) + ' / ' + v.substring(2);
        this.value = v;
      });
    }

    // Form submission
    var form = document.querySelector('[data-gsg-checkout-form]');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        handleCheckout(form);
      });
    }
  }

  function handleCheckout(form) {
    var btn = form.querySelector('[data-gsg-place-order]');
    var btnText = btn.querySelector('.gsg-btn-text');
    var btnLoading = btn.querySelector('.gsg-btn-loading');
    var errorEl = document.querySelector('[data-gsg-checkout-error]');

    // Show loading state
    btnText.style.display = 'none';
    btnLoading.style.display = '';
    btn.disabled = true;
    if (errorEl) errorEl.style.display = 'none';

    var cart = getCart();

    // Build order payload
    var order = {
      email: form.querySelector('#gsg-email').value,
      first_name: form.querySelector('#gsg-first-name').value,
      last_name: form.querySelector('#gsg-last-name').value,
      items: cart.items,
      total: cartTotal(cart)
    };

    // Save order for thanks page before attempting API
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    } catch (e) { /* ignore */ }

    // Simulate API call (replace with real FluidPay integration)
    var config = window.GSG_ECOMMERCE_CONFIG || {};
    var apiBase = config.apiBase;

    if (apiBase) {
      // Real API call
      var xhr = new XMLHttpRequest();
      xhr.open('POST', apiBase + '/orders', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          clearCart();
          window.location.href = '/thanks/';
        } else {
          showCheckoutError(errorEl, btn, btnText, btnLoading, 'Payment failed. Please try again.');
        }
      };
      xhr.onerror = function () {
        showCheckoutError(errorEl, btn, btnText, btnLoading, 'Network error. Please try again.');
      };
      xhr.send(JSON.stringify(order));
    } else {
      // Demo mode — simulate success
      setTimeout(function () {
        clearCart();
        window.location.href = '/thanks/';
      }, 1200);
    }
  }

  function showCheckoutError(errorEl, btn, btnText, btnLoading, message) {
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = '';
    }
    btnText.style.display = '';
    btnLoading.style.display = 'none';
    btn.disabled = false;
  }

  // ---------------------------------------------------------------------------
  // Thanks page
  // ---------------------------------------------------------------------------

  function renderThanksPage() {
    var detailsEl = document.querySelector('[data-gsg-thanks-details]');
    if (!detailsEl) return;

    try {
      var raw = localStorage.getItem(ORDER_KEY);
      if (!raw) return;
      var order = JSON.parse(raw);

      var html = '<div class="gsg-thanks-order">';
      html += '<p class="gsg-thanks-email">Confirmation sent to <strong>' + escapeHtml(order.email) + '</strong></p>';
      html += '<div class="gsg-thanks-items">';
      for (var i = 0; i < order.items.length; i++) {
        var item = order.items[i];
        html += '<div class="gsg-thanks-item">';
        html += '  <span>' + escapeHtml(item.title) + '</span>';
        html += '  <span>' + formatPrice(item.price * item.quantity) + '</span>';
        html += '</div>';
      }
      html += '</div>';
      html += '<div class="gsg-thanks-total">';
      html += '  <span>Total</span>';
      html += '  <span>' + formatPrice(order.total) + '</span>';
      html += '</div>';
      html += '</div>';

      detailsEl.innerHTML = html;

      // Clear the stored order
      localStorage.removeItem(ORDER_KEY);
    } catch (e) { /* ignore */ }
  }

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ---------------------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------------------

  function init() {
    updateAllBadges();
    initAddToCartButtons();
    renderCartPage();
    renderCheckoutPage();
    renderThanksPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API for external use
  window.gsgEcommerce = {
    getCart: getCart,
    addItem: addItem,
    removeItem: removeItem,
    updateQuantity: updateQuantity,
    clearCart: clearCart,
    cartTotal: cartTotal,
    cartCount: cartCount
  };
})();
