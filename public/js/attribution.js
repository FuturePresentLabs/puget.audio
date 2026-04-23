/**
 * attribution.js — captures UTM / referral / discount params from the URL
 * on first landing, persists to localStorage under `attribution.v1`, and
 * exposes window.GSGAttribution for read/clear.
 *
 * Shape matches the GSG integration guide so the backend can attribute
 * conversions to campaigns / affiliates.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'attribution.v1';
  var EXPIRY_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

  function readStored() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data && data._expires && data._expires < Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return data;
    } catch (_) { return null; }
  }

  function writeStored(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  function qp(name) {
    var m = new RegExp('[?&]' + name + '=([^&]+)').exec(location.search);
    return m ? decodeURIComponent(m[1]) : '';
  }

  function capture() {
    var fresh = {
      ref:            qp('ref'),
      discount_code:  qp('discount_code') || qp('code'),
      utm_source:     qp('utm_source'),
      utm_medium:     qp('utm_medium'),
      utm_campaign:   qp('utm_campaign'),
      utm_term:       qp('utm_term'),
      utm_content:    qp('utm_content')
    };

    // Drop empty fields so we only persist meaningful values.
    var hasAnything = false;
    var cleaned = {};
    Object.keys(fresh).forEach(function (k) {
      if (fresh[k]) { cleaned[k] = fresh[k]; hasAnything = true; }
    });

    var existing = readStored();
    var now = Date.now();

    if (!existing && !hasAnything) return; // Nothing to do on a direct visit.

    var merged = Object.assign({
      first_seen: now,
      landing_page: location.pathname
    }, existing || {}, cleaned, {
      last_seen: now,
      _expires: now + EXPIRY_MS
    });

    writeStored(merged);
  }

  window.GSGAttribution = {
    get: function () {
      var data = readStored();
      if (!data) return null;
      var copy = Object.assign({}, data);
      delete copy._expires;
      return copy;
    },
    clear: function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', capture, { once: true });
  } else {
    capture();
  }
})();
