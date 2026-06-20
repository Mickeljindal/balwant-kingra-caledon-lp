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

  document.querySelectorAll('.js-scroll').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      scrollToForm();
    });
  });

  /* ---------- Meta Pixel: ViewContent on property card engagement ---------- */
  document.querySelectorAll('.js-property').forEach(function (btn) {
    btn.addEventListener('click', function () {
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
    var timeline = form.timeline.value;
    var firstTime = form.querySelector('input[name="firstTimeBuyer"]:checked');
    var withAgent = form.querySelector('input[name="workingWithAgent"]:checked');

    setError('fullName', fullName ? '' : 'Please enter your full name.');
    if (!fullName) ok = false;

    if (!phone) { setError('phone', 'Please enter your phone number.'); ok = false; }
    else if (phone.replace(/\D/g, '').length < 10) { setError('phone', 'Please enter a valid phone number.'); ok = false; }
    else setError('phone', '');

    if (!email) { setError('email', 'Please enter your email address.'); ok = false; }
    else if (!isValidEmail(email)) { setError('email', 'Please enter a valid email address.'); ok = false; }
    else setError('email', '');

    setError('property', property ? '' : 'Please choose a property.');
    if (!property) ok = false;

    setError('firstTimeBuyer', firstTime ? '' : 'Please select an option.');
    if (!firstTime) ok = false;

    setError('workingWithAgent', withAgent ? '' : 'Please select an option.');
    if (!withAgent) ok = false;

    setError('timeline', timeline ? '' : 'Please select your timeline.');
    if (!timeline) ok = false;

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
      firstTimeBuyer: (form.querySelector('input[name="firstTimeBuyer"]:checked') || {}).value || '',
      workingWithAgent: (form.querySelector('input[name="workingWithAgent"]:checked') || {}).value || '',
      timeline: form.timeline.value,
      source: form.source.value,
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
