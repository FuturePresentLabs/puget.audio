/**
 * Puget Audio — Newsletter / Waitlist form handler
 *
 * Progressive-enhancement wrapper around the site's signup forms. Intercepts
 * the submit, POSTs the payload as JSON via fetch (no navigation / no page
 * reload), and swaps the form contents for an inline success message on 2xx.
 *
 * Binds to:
 *   form.puget-notify-form   (coming-soon waitlists / notify-me forms)
 *   form.signup-form         (generic "Join List" newsletter)
 *   form.amps-email-form     (amps page hero / bottom)
 *   form.js-newsletter-form  (opt-in selector for any ad-hoc form)
 *
 * The endpoint is read from the form's `action` attribute. Any named form
 * field (email, interest, etc.) is sent as part of the JSON body, plus a
 * `source` field with the current page path for analytics.
 *
 * The form partials also set `onsubmit="return false"` as a safety net so
 * that if this JS ever fails to load, the browser won't navigate to the API
 * endpoint as raw form POST (which would drop the user out of the site).
 */
(function () {
  'use strict';

  var SELECTOR = [
    'form.puget-notify-form',
    'form.signup-form',
    'form.amps-email-form',
    'form.js-newsletter-form'
  ].join(', ');

  function init() {
    var forms = document.querySelectorAll(SELECTOR);
    for (var i = 0; i < forms.length; i++) {
      attach(forms[i]);
    }
  }

  function attach(form) {
    if (form.__pugetNewsletterBound) return;
    form.__pugetNewsletterBound = true;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitForm(form);
    });
  }

  function submitForm(form) {
    var endpoint = form.getAttribute('action') || form.getAttribute('data-action');
    if (!endpoint) return;

    var emailInput = form.querySelector('input[type="email"], input[name="email"]');
    var email = (emailInput && emailInput.value || '').trim();
    if (!email) {
      showError(form, 'Please enter an email address.');
      return;
    }

    var button = form.querySelector('button[type="submit"], button:not([type])');
    var originalButtonText = button ? button.textContent : '';
    var payload = buildPayload(form);

    setSending(button);
    clearError(form);

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    }).then(function (resp) {
      if (resp.ok || resp.status === 201 || resp.status === 202) {
        showSuccess(form, email);
      } else {
        showError(form, friendlyErrorMessage(resp.status));
        resetButton(button, originalButtonText);
      }
    }).catch(function () {
      showError(form, 'Network error. Please try again.');
      resetButton(button, originalButtonText);
    });
  }

  function buildPayload(form) {
    var payload = {};
    var data = new FormData(form);
    data.forEach(function (value, key) {
      // Keep the last value for any given key (no array-merging required
      // for these simple signup forms).
      payload[key] = value;
    });
    if (!payload.source) payload.source = location.pathname + location.search;
    return payload;
  }

  function setSending(button) {
    if (!button) return;
    button.disabled = true;
    button.dataset.pugetBusy = '1';
    button.textContent = 'Sending…';
  }

  function resetButton(button, text) {
    if (!button) return;
    button.disabled = false;
    delete button.dataset.pugetBusy;
    button.textContent = text;
  }

  function showSuccess(form, email) {
    var wrap = document.createElement('div');
    wrap.className = 'puget-notify-success';
    wrap.setAttribute('role', 'status');
    wrap.setAttribute('aria-live', 'polite');

    var icon = document.createElement('div');
    icon.className = 'puget-notify-success-icon';
    icon.innerHTML =
      '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>' +
      '<polyline points="22 4 12 14.01 9 11.01"/></svg>';

    var heading = document.createElement('p');
    heading.className = 'puget-notify-success-heading';
    heading.textContent = "You're on the list.";

    var body = document.createElement('p');
    body.className = 'puget-notify-success-body';
    body.appendChild(document.createTextNode("We'll email "));
    var strong = document.createElement('strong');
    strong.textContent = email;
    body.appendChild(strong);
    body.appendChild(document.createTextNode(" when there's something worth saying."));

    wrap.appendChild(icon);
    wrap.appendChild(heading);
    wrap.appendChild(body);

    form.innerHTML = '';
    form.appendChild(wrap);
    form.classList.add('is-submitted');
  }

  function showError(form, message) {
    clearError(form);
    var err = document.createElement('p');
    err.className = 'puget-notify-error';
    err.setAttribute('role', 'alert');
    err.textContent = message;
    form.appendChild(err);
  }

  function clearError(form) {
    var existing = form.querySelector('.puget-notify-error');
    if (existing) existing.remove();
  }

  function friendlyErrorMessage(status) {
    if (status === 409) return "You're already on the list.";
    if (status === 429) return 'Too many requests — try again in a minute.';
    if (status >= 500) return 'Server error. Please try again in a bit.';
    return 'Something went wrong. Please try again.';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose so dynamically-injected forms can opt in.
  window.pugetNewsletter = { init: init, attach: attach };
})();
