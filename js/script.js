/* =====================================================
   Balwant Kingra · Caledon Homes — interactions
   ----------------------------------------------------
   CONFIG: fill these in once accounts are set up.
   ===================================================== */
var CONFIG = {
  // Calendly booking link, e.g. 'https://calendly.com/balwantkingra/consultation'
  calendlyUrl: 'https://calendly.com/balwantkingra',
  // Page to redirect to after a successful submission.
  thankYouUrl: '/thank-you',

  // ---- EmailJS settings (get these from https://dashboard.emailjs.com) ----
  emailjs: {
    publicKey:  'Wg1ZmfcL8fOmefyC5',  // Account → General → Public Key
    serviceId:  'service_bu9mxsm',     // Email Services → your service
    templateId: 'template_lyg0ijt'     // Email Templates → your template
  }
};

(function () {
  'use strict';

  /* ---------- Smooth scroll to the lead form ---------- */
  function scrollToForm() {
    var form = document.getElementById('lead-form');
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function scrollToElement(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  document.querySelectorAll('.js-scroll').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      scrollToForm();
    });
  });

  /* ---------- Hero links — smooth scroll + tracking (Task 2 & 7) ---------- */
  document.querySelectorAll('.js-hero-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var href = link.getAttribute('href');
      var target = href ? href.replace('#', '') : 'lead-form';
      scrollToElement(target);
      // Track
      window.dataLayer = window.dataLayer || [];
      dataLayer.push({
        event: 'lp_interaction',
        interaction_type: 'hero_link_click',
        interaction_detail: link.getAttribute('data-detail') || ''
      });
    });
  });

  /* ---------- Quick-jump chips — smooth scroll + tracking (Task 3 & 7) ---------- */
  document.querySelectorAll('.js-chip').forEach(function (chip) {
    chip.addEventListener('click', function (e) {
      e.preventDefault();
      var href = chip.getAttribute('href');
      var target = href ? href.replace('#', '') : 'lead-form';
      scrollToElement(target);
      // Track
      window.dataLayer = window.dataLayer || [];
      dataLayer.push({
        event: 'lp_interaction',
        interaction_type: 'chip_click',
        interaction_detail: chip.getAttribute('data-detail') || ''
      });
    });
  });

  /* ---------- Mobile CTA tracking (Task 4 & 7) ---------- */
  document.querySelectorAll('.js-mobile-cta').forEach(function (btn) {
    btn.addEventListener('click', function () {
      window.dataLayer = window.dataLayer || [];
      dataLayer.push({
        event: 'lp_interaction',
        interaction_type: 'mobile_cta_click',
        interaction_detail: btn.getAttribute('data-property') || ''
      });
    });
  });

  /* ---------- Meta Pixel: ViewContent on property card engagement ---------- */
  document.querySelectorAll('.js-property').forEach(function (btn) {
    function activate() {
      var value = btn.getAttribute('data-property');
      // Fire ViewContent for retargeting segmentation
      if (window.fbq) {
        try { fbq('track', 'ViewContent', { content_name: value, content_type: 'property' }); } catch (err) {}
      }
      var select = document.getElementById('property');
      if (select) {
        for (var i = 0; i < select.options.length; i++) {
          if (select.options[i].value === value) {
            select.selectedIndex = i;
            select.classList.remove('is-invalid');
            break;
          }
        }
      }
      scrollToForm();
    }
    btn.addEventListener('click', activate);
    // Keyboard support for non-button elements (role="button")
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });

  /* ---------- Announcement bar — clickable CTA (highest observed intent) ---------- */
  document.querySelectorAll('.js-announce').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      scrollToForm();
      window.dataLayer = window.dataLayer || [];
      dataLayer.push({
        event: 'lp_interaction',
        interaction_type: 'announce_bar_click',
        interaction_detail: 'final_phase_fomo'
      });
    });
  });

  /* ---------- Hero scroll cue — nudge users below the fold ---------- */
  document.querySelectorAll('.js-scroll-cue').forEach(function (cue) {
    cue.addEventListener('click', function (e) {
      e.preventDefault();
      var href = cue.getAttribute('href');
      var target = href ? href.replace('#', '') : 'homes';
      scrollToElement(target);
      window.dataLayer = window.dataLayer || [];
      dataLayer.push({
        event: 'lp_interaction',
        interaction_type: 'scroll_cue_click',
        interaction_detail: target
      });
    });
  });

  /* ---------- Whole property card is tappable (reduce dead clicks) ---------- */
  document.querySelectorAll('.js-card').forEach(function (card) {
    card.addEventListener('click', function (e) {
      // Let real links/buttons inside the card behave normally.
      if (e.target.closest('a, button')) return;
      var trigger = card.querySelector('.js-property');
      if (trigger) trigger.click();
    });
  });

  /* ---------- Calendly popup ---------- */
  document.querySelectorAll('.js-calendly').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (window.Calendly && CONFIG.calendlyUrl) {
        window.Calendly.initPopupWidget({ url: CONFIG.calendlyUrl });
      } else {
        // Fallback if the widget script hasn't loaded.
        window.open(CONFIG.calendlyUrl, '_blank', 'noopener');
      }
      return false;
    });
  });

  /* ---------- FOMO countdown — targets end of the current month ---------- */
  (function initCountdown() {
    var cd = document.getElementById('countdown');
    if (!cd) return;

    function target() {
      var now = new Date();
      // Last moment of the current month (resets to next month once it passes).
      return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function set(key, value) {
      var el = cd.querySelector('[data-cd="' + key + '"]');
      if (el) el.textContent = pad(value);
    }

    function tick() {
      var diff = Math.max(0, target() - new Date());
      set('days', Math.floor(diff / 86400000));
      set('hours', Math.floor((diff % 86400000) / 3600000));
      set('mins', Math.floor((diff % 3600000) / 60000));
      set('secs', Math.floor((diff % 60000) / 1000));
    }

    tick();
    setInterval(tick, 1000);
  })();

  /* ---------- Lead form validation + submit ---------- */
  var form = document.getElementById('leadForm');
  if (!form) return;

  var submitBtn = document.getElementById('submitBtn');
  var formError = document.getElementById('formError');

  function setError(name, message) {
    var slot = form.querySelector('[data-error-for="' + name + '"]');
    if (slot) slot.textContent = message || '';
    var field = form.elements[name];
    if (field && field.classList) {
      field.classList.toggle('is-invalid', !!message);
    }
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validate() {
    var ok = true;
    formError.textContent = '';

    var fullName = form.fullName.value.trim();
    var phone = form.phone.value.trim();
    var email = form.email.value.trim();
    var property = form.property.value;

    setError('fullName', fullName ? '' : 'Please enter your full name.');
    if (!fullName) ok = false;

    if (!phone) { setError('phone', 'Please enter your phone number.'); ok = false; }
    else if (phone.replace(/\D/g, '').length < 10) { setError('phone', 'Please enter a valid phone number.'); ok = false; }
    else setError('phone', '');

    if (!email) { setError('email', 'Please enter your email address.'); ok = false; }
    else if (!isValidEmail(email)) { setError('email', 'Please enter a valid email address.'); ok = false; }
    else setError('email', '');

    setError('property', property ? '' : 'Please choose a community.');
    if (!property) ok = false;

    return ok;
  }

  // Clear an error as soon as the user fixes a field.
  form.addEventListener('input', function (e) {
    if (e.target.name) setError(e.target.name, '');
  });
  form.addEventListener('change', function (e) {
    if (e.target.name) setError(e.target.name, '');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;

    var data = {
      fullName: form.fullName.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      property: form.property.value,
      timeline: form.timeline ? form.timeline.value : '',
      page: 'LP1.balwantkingra.com',
      submittedAt: new Date().toISOString()
    };
    // Populate the template's {{name}} (From Name) and {{title}} (Subject) fields.
    data.name = data.fullName;
    data.title = data.fullName + ' — ' + data.property;

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;
    formError.textContent = '';

    // Save a server-side backup copy of the lead. sendBeacon is designed to
    // reliably deliver data even as the page navigates away (the redirect below).
    try {
      var saved = false;
      if (navigator.sendBeacon) {
        var blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        saved = navigator.sendBeacon('save-lead.php', blob);
      }
      if (!saved) {
        fetch('save-lead.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          keepalive: true
        }).catch(function () {});
      }
    } catch (e) {}

    function onSuccess() {
      // Lead event fires on the /thank-you page load (single source of truth).
      window.location.href = CONFIG.thankYouUrl;
    }

    function onFailure() {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
      formError.textContent = 'Something went wrong. Please try again or call Balwant directly at 647-293-7008.';
    }

    if (!CONFIG.emailjs || !window.emailjs || CONFIG.emailjs.publicKey === 'YOUR_PUBLIC_KEY') {
      // EmailJS not configured yet — redirect so the flow can still be tested.
      onSuccess();
      return;
    }

    emailjs
      .send(CONFIG.emailjs.serviceId, CONFIG.emailjs.templateId, data, CONFIG.emailjs.publicKey)
      .then(function () {
        onSuccess();
      })
      .catch(function (err) {
        if (window.console) console.error('EmailJS error:', err);
        onFailure();
      });
  });
})();
