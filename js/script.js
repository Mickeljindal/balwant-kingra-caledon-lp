/* =====================================================
   Balwant Kingra · Caledon Homes — interactions
   ----------------------------------------------------
   CONFIG: fill these in once accounts are set up.
   ===================================================== */
var CONFIG = {
  // Calendly booking link, e.g. 'https://calendly.com/balwantkingra/consultation'
  calendlyUrl: 'https://calendly.com/balwantkingra',
  // Where to POST the lead form data (webhook / Zapier / Make / serverless).
  // Leave '' to skip the network call and just redirect (useful for testing).
  webhookUrl: '',
  // Page to redirect to after a successful submission.
  thankYouUrl: '/thank-you'
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
      timeline: form.timeline.value,
      source: form.source.value,
      page: 'LP1.balwantkingra.com',
      submittedAt: new Date().toISOString()
    };

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;
    formError.textContent = '';

    // Fire a Meta Pixel Lead event if available.
    if (window.fbq) { try { fbq('track', 'Lead'); } catch (err) {} }

    function onSuccess() {
      window.location.href = CONFIG.thankYouUrl;
    }

    function onFailure() {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
      formError.textContent = 'Something went wrong. Please try again or call Balwant directly at 647-293-7008.';
    }

    if (!CONFIG.webhookUrl) {
      // No webhook configured yet — redirect so the flow can be tested.
      onSuccess();
      return;
    }

    fetch(CONFIG.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Bad response');
        onSuccess();
      })
      .catch(onFailure);
  });
})();
