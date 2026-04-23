/* newsletter.js — lightweight signup handler */
(function () {
  if (window.GSGNewsletterInit) return;
  window.GSGNewsletterInit = true;

  const CORE = window.GSGCore || {};
  const API_BASE = CORE.API_BASE || "https://api.gsgmfg.com";
  const REF = typeof CORE.getRef === "function" ? CORE.getRef() : "";

  function $(root, sel) {
    return root ? root.querySelector(sel) : null;
  }

  function setState(root, state) {
    if (!root) return;
    root.classList.toggle("newsletter-cta--loading", state === "loading");
    root.classList.toggle("newsletter-cta--success", state === "success");
  }

  function showMessage(el, text) {
    if (!el) return;
    if (text) {
      el.textContent = text;
      el.hidden = false;
    } else {
      el.hidden = true;
      el.textContent = "";
    }
  }

  async function submitEmail(root, email) {
    const variant = (root.dataset.newsletterVariant || "default").toLowerCase();
    const storefront =
      root.dataset.newsletterStorefront ||
      document.body?.dataset?.storefrontName ||
      document.body?.dataset?.storefront ||
      "web";
    const payload = {
      email,
      storefront,
    };
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-GSG-Storefront": storefront,
      "X-GSG-Storefront-Key": document.body?.dataset?.storefront || storefront,
    };

    const endpoints = [
      `${API_BASE}/newsletter/signup`,
      `${API_BASE}/newsletter/subscribe`,
      `${API_BASE}/newsletter`,
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
          credentials: "include",
        });
        if (res.ok) return true;
      } catch (err) {
        console.warn("[newsletter] request failed", err);
      }
    }
    return false;
  }

  function initForm(root) {
    const form = $(root, "[data-newsletter-form]");
    const input = $(root, "[data-newsletter-input]");
    const submit = $(root, "[data-newsletter-submit]");
    const errorEl = $(root, "[data-newsletter-error]");
    const successEl = $(root, "[data-newsletter-success]");

    if (!form || !input || !submit) return;

    form.addEventListener("submit", async (evt) => {
      evt.preventDefault();
      const email = (input.value || "").trim();
      showMessage(errorEl, "");
      showMessage(successEl, "");

      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        showMessage(errorEl, "Enter a valid email address.");
        input.focus();
        return;
      }

      submit.disabled = true;
      setState(root, "loading");

      const ok = await submitEmail(root, email);

      if (ok) {
        setState(root, "success");
        showMessage(successEl, successEl?.textContent || "You're in!");
        form.reset();
      } else {
        setState(root, "");
        showMessage(
          errorEl,
          "We couldn't save that. Please try again in a moment."
        );
      }

      submit.disabled = false;
    });
  }

  function boot() {
    document
      .querySelectorAll("[data-newsletter-root]")
      .forEach((el) => initForm(el));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
