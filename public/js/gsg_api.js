/* gsg_api.js — shared helpers for catalog + review data */

(function () {
  if (window.GSGApi) return;
  const API_BASE = "https://api.gsgmfg.com";
  const catalogCache = new Map();
  const reviewCache = new Map();

  const normalizeSku = (value) => String(value || "").trim();
  const normalizeCatalogEntry = (entry) => {
    if (!entry) return { stock: 0, price_cents: 0, marked_price_cents: 0 };
    return {
      stock: Number(entry.stock ?? entry.qty ?? 0) || 0,
      price_cents: Number(entry.price_cents ?? entry.price ?? 0) || 0,
      marked_price_cents: Number(entry.marked_price_cents ?? entry.marked_price ?? 0) || 0,
    };
  };

  function apiFetch(path, options) {
    if (window.GSGCore && typeof window.GSGCore.request === "function") {
      return window.GSGCore.request(path, options);
    }
    const opts = Object.assign({ credentials: "include" }, options || {});
    const storefront =
      (window.GSGCore && window.GSGCore.storefront) ||
      window.GSG_STOREFRONT ||
      document.body?.dataset?.storefrontName ||
      document.body?.dataset?.storefront ||
      "web";
    const storefrontKey =
      (window.GSGCore && window.GSGCore.storefrontKey) ||
      window.GSG_STOREFRONT_KEY ||
      document.body?.dataset?.storefront ||
      "web";
    const headers = Object.assign({
      "X-GSG-Storefront": storefront,
      "X-GSG-Storefront-Key": storefrontKey,
    }, opts.headers || {});
    opts.headers = headers;
    const url = String(path).startsWith("http") ? path : `${API_BASE}${path}`;
    return fetch(url, opts);
  }

  function fetchCatalog(sku) {
    if (!sku) return Promise.reject(new Error("missing sku"));
    if (catalogCache.has(sku)) return catalogCache.get(sku);

    const request = apiFetch(`/catalog/${encodeURIComponent(sku)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`catalog fetch failed: ${res.status}`);
        return res.json();
      })
      .then((data) => normalizeCatalogEntry(data))
      .catch((err) => {
        catalogCache.delete(sku);
        throw err;
      });

    catalogCache.set(sku, request);
    return request;
  }

  function fetchCatalogBatch(skus) {
    const list = Array.isArray(skus) ? skus : [];
    const unique = Array.from(
      new Set(
        list
          .map((sku) => normalizeSku(sku))
          .filter(Boolean)
      )
    );
    if (!unique.length) return Promise.resolve({});

    const query = unique.map((sku) => `sku=${encodeURIComponent(sku)}`).join("&");
    const runBatch = () => apiFetch(`/catalog?${query}`)
      .then((res) => {
        if (!res.ok) throw new Error(`catalog batch failed: ${res.status}`);
        return res.json();
      })
      .then((payload) => {
        const entries = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.items)
            ? payload.items
            : payload && typeof payload === "object"
              ? Object.values(payload)
              : [];
        const map = {};
        entries.forEach((entry) => {
          const sku = normalizeSku(entry && (entry.sku || entry.SKU || entry.id));
          if (!sku) return;
          const normalized = normalizeCatalogEntry(entry);
          map[sku] = normalized;
          catalogCache.set(sku, Promise.resolve(normalized));
        });
        unique.forEach((sku) => {
          if (!map[sku]) {
            map[sku] = normalizeCatalogEntry({});
          }
        });
        return map;
      });

    return runBatch().catch((err) => {
      console.warn("[catalog] batch fetch failed, falling back to per-sku requests", err);
      return Promise.all(unique.map((sku) =>
        fetchCatalog(sku)
          .then((data) => ({ sku, data }))
          .catch(() => ({ sku, data: null }))
      )).then((entries) => {
        const map = {};
        entries.forEach(({ sku, data }) => {
          if (!sku) return;
          map[sku] = data || normalizeCatalogEntry({});
        });
        return map;
      });
    });
  }

  function fetchReviewSummary(sku) {
    if (!sku) return Promise.reject(new Error("missing sku"));
    if (reviewCache.has(sku)) return reviewCache.get(sku);

    const request = apiFetch(`/reviews?sku=${encodeURIComponent(sku)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`review fetch failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data.reviews) ? data.reviews : [];
        if (!list.length) {
          return { status: "empty", count: 0, avg: 0 };
        }
        const total = list.reduce((acc, item) => acc + (Number(item.score) || 0), 0);
        return {
          status: "ok",
          count: list.length,
          avg: total / list.length,
        };
      })
      .catch((err) => {
        reviewCache.delete(sku);
        throw err;
      });

    reviewCache.set(sku, request);
    return request;
  }

  function formatMoney(cents) {
    return `$${(Number(cents || 0) / 100).toFixed(2)}`;
  }

  function starString(value) {
    const score = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
    return "★".repeat(score) + "☆".repeat(5 - score);
  }

  function markAvailable(card) {
    card.classList.remove("is-soldout");
    const badge = card.querySelector(".badge-soldout");
    if (badge) badge.hidden = true;
    const btn = card.querySelector("[data-cart-cta]");
    if (btn) {
      btn.classList.remove("is-disabled");
      btn.classList.remove("btn-secondary");
      btn.removeAttribute("aria-disabled");
    }
  }

  function setSoldOut(card) {
    card.classList.add("is-soldout");
    const badge = card.querySelector(".badge-soldout");
    if (badge) badge.hidden = false;
    const btn = card.querySelector("[data-cart-cta]") || card.querySelector("[data-add-to-cart]");
    if (btn) {
      btn.textContent = "Sold Out";
      btn.classList.add("is-disabled", "btn-secondary");
      btn.setAttribute("aria-disabled", "true");
      btn.removeAttribute("data-add-to-cart");
      btn.setAttribute("data-cart-mode", "soldout");
      btn.setAttribute("href", "#");
    }
    const bundleControl = card.querySelector("[data-bundle-control]");
    if (bundleControl){
      bundleControl.setAttribute("data-bundle-disabled", "true");
      const plusBtn = bundleControl.querySelector("[data-bundle-plus]");
      const minusBtn = bundleControl.querySelector("[data-bundle-minus]");
      const countEl = bundleControl.querySelector("[data-bundle-count]");
      const statusEl = bundleControl.querySelector("[data-bundle-status]");
      if (plusBtn){
        plusBtn.textContent = "Sold Out";
        plusBtn.disabled = true;
      }
      if (minusBtn) minusBtn.classList.add("hidden");
      if (countEl) countEl.hidden = true;
      if (statusEl) statusEl.textContent = "Sold out";
    }
  }

  function updatePrice(card, priceCents, markedPriceCents) {
    const showMarkedAttr = Number.isFinite(markedPriceCents) && markedPriceCents > priceCents;
    const priceEl = card.querySelector(".price");
    if (priceEl) {
      const currentEl = priceEl.querySelector(".price__current");
      let markedEl = priceEl.querySelector(".price__marked");

      if (currentEl) {
        currentEl.textContent = formatMoney(priceCents);
      } else {
        priceEl.textContent = formatMoney(priceCents);
      }

      if (showMarkedAttr) {
        const markedValue = formatMoney(markedPriceCents);
        if (markedEl) {
          markedEl.textContent = markedValue;
        } else {
          markedEl = document.createElement("span");
          markedEl.className = "price__marked";
          markedEl.textContent = markedValue;
          priceEl.appendChild(markedEl);
        }
      } else if (markedEl) {
        markedEl.remove();
        markedEl = null;
      }

      priceEl.classList.toggle("price--has-marked", showMarkedAttr);
      priceEl.setAttribute("data-price-cents", String(priceCents));
      if (showMarkedAttr) {
        priceEl.setAttribute("data-marked-price-cents", String(markedPriceCents));
      } else {
        priceEl.removeAttribute("data-marked-price-cents");
      }
    }
    card.setAttribute("data-price-cents", String(priceCents));
    if (showMarkedAttr) {
      card.setAttribute("data-marked-price-cents", String(markedPriceCents));
    } else {
      card.removeAttribute("data-marked-price-cents");
    }
    card.querySelectorAll("[data-cart-price-sync]").forEach((btn) => {
      btn.setAttribute("data-price-cents", String(priceCents));
      if (showMarkedAttr) {
        btn.setAttribute("data-marked-price-cents", String(markedPriceCents));
      } else {
        btn.removeAttribute("data-marked-price-cents");
      }
    });
    card.querySelectorAll("[data-add-to-cart]").forEach((btn) => {
      btn.setAttribute("data-price-cents", String(priceCents));
      if (showMarkedAttr) {
        btn.setAttribute("data-marked-price-cents", String(markedPriceCents));
      } else {
        btn.removeAttribute("data-marked-price-cents");
      }
    });
  }

  function getCartItems() {
    try {
      if (window.GSGCart && typeof window.GSGCart.get === "function") {
        const state = window.GSGCart.get() || {};
        return Array.isArray(state.items) ? state.items : [];
      }
    } catch (_) {}
    return [];
  }

  function syncCartButton(card, items) {
    if (!card || card.classList.contains("is-soldout")) return;
    const button = card.querySelector("[data-cart-cta]");
    if (!button) return;
    const sku = card.getAttribute("data-sku");
    if (!sku) return;

    const cartItems = Array.isArray(items) ? items : getCartItems();
    const inCart = cartItems.some((item) => item && item.sku === sku && Number(item.qty || 0) > 0);

    const addLabel = button.getAttribute("data-label-add") || "Add to cart";
    const checkoutLabel = button.getAttribute("data-label-checkout") || "Go to Checkout";
    const addHref = button.getAttribute("data-href-add") || "#";
    const checkoutHref = button.getAttribute("data-href-checkout") || "/cart/";

    button.classList.remove("btn-secondary", "is-disabled");
    button.removeAttribute("aria-disabled");

    if (inCart) {
      button.textContent = checkoutLabel;
      button.setAttribute("href", checkoutHref);
      button.removeAttribute("data-add-to-cart");
      button.setAttribute("data-cart-mode", "checkout");
    } else {
      button.textContent = addLabel;
      button.setAttribute("href", addHref);
      button.setAttribute("data-add-to-cart", "");
      button.setAttribute("data-cart-mode", "add");
    }
  }

  function renderReviewSummary(card, state) {
    const sku = card.getAttribute("data-sku");
    if (!sku) return;
    const summaryEl = card.querySelector(`[data-review-summary-inline][data-review-sku="${sku}"]`);
    if (!summaryEl) return;
    const starsEl = summaryEl.querySelector("[data-review-inline-stars]");
    const textEl = summaryEl.querySelector("[data-review-inline-text]");

    if (starsEl) starsEl.removeAttribute("data-review-stars-state");

    if (!state || state.status === "error") {
      summaryEl.classList.add("is-empty");
      if (starsEl) {
        starsEl.textContent = "Reviews unavailable";
        starsEl.setAttribute("data-review-stars-state", "error");
        starsEl.setAttribute("aria-label", "Reviews unavailable");
      }
      if (textEl) {
        textEl.textContent = "Reviews unavailable — please check back soon";
      }
      return;
    }

    if (state.status === "empty" || !state.count) {
      summaryEl.classList.add("is-empty");
      if (starsEl) {
        starsEl.textContent = "No reviews";
        starsEl.setAttribute("data-review-stars-state", "empty");
        starsEl.setAttribute("aria-label", "No reviews");
      }
      if (textEl) {
        textEl.textContent = "No reviews";
      }
      return;
    }

    summaryEl.classList.remove("is-empty");
    const rounded = Math.round(state.avg || 0);
    const formatted = (state.avg || 0).toFixed(1).replace(/\.0$/, "");
    const reviewLabel = state.count === 1 ? "review" : "reviews";

    if (starsEl) {
      starsEl.textContent = starString(rounded);
      starsEl.removeAttribute("data-review-stars-state");
      starsEl.setAttribute("aria-label", `${formatted} out of 5 stars`);
    }
    if (textEl) {
      textEl.textContent = `${formatted} average • ${state.count} verified ${reviewLabel}`;
    }
  }

  function updateCard(card) {
    if (!card || card.nodeType !== 1) return;
    const sku = card.getAttribute("data-sku");
    if (!sku) return;

    syncCartButton(card);

    fetchCatalog(sku)
      .then((catalog) => {
        const stock = Number(catalog.stock || 0);
        if (stock <= 0) {
          setSoldOut(card);
        } else {
          markAvailable(card);
          syncCartButton(card);
        }

        const priceCents = Number(catalog.price_cents || 0);
        const markedPriceCents = Number(catalog.marked_price_cents || 0);
        if (Number.isFinite(priceCents) && priceCents > 0) {
          updatePrice(card, priceCents, markedPriceCents);
        }
      })
      .catch(() => {
        /* silently ignore catalog errors */
      });

    const summaryEl = card.querySelector(`[data-review-summary-inline][data-review-sku="${sku}"]`);
    if (summaryEl) {
      fetchReviewSummary(sku)
        .then((summary) => renderReviewSummary(card, summary))
        .catch(() => renderReviewSummary(card, { status: "error" }));
    }
  }

  function refreshCards() {
    const cards = document.querySelectorAll("[data-gsg-card][data-sku]");
    cards.forEach((card) => updateCard(card));
  }

  document.addEventListener("cart:updated", (event) => {
    const detail = event && event.detail;
    const items = detail && Array.isArray(detail.items) ? detail.items : undefined;
    const cards = document.querySelectorAll("[data-gsg-card][data-sku]");
    cards.forEach((card) => syncCartButton(card, items));
  });

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  ready(() => {
    refreshCards();
    // re-sync after render to pick up dynamic cart state changes
    setTimeout(refreshCards, 200);
  });

  window.GSGApi = {
    refreshCards,
    updateCard,
    fetchCatalog,
    fetchCatalogBatch,
    fetchReviewSummary,
    syncCartButton,
  };
  window.gsgRefreshLiveStock = refreshCards;
})();
