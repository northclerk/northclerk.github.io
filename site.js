/* Northclerk site script. Classic script, no dependencies, no network requests. */
(function () {
  'use strict';

  var doc = document;

  /* ---------- Mobile menu ---------- */
  var toggle = doc.querySelector('.nav-toggle');
  var nav = doc.getElementById('site-nav');

  if (toggle && nav) {
    var narrow = window.matchMedia('(max-width: 820px)');

    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Picking a link closes the menu.
    nav.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) { setOpen(false); }
    });

    // Escape closes the menu and returns focus to the button.
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    // Reset when the window grows past the mobile breakpoint.
    var onResize = function () { if (!narrow.matches) { setOpen(false); } };
    if (narrow.addEventListener) { narrow.addEventListener('change', onResize); }
    else if (narrow.addListener) { narrow.addListener(onResize); }
  }

  /* ---------- Get-started form: build a mailto link, no network ---------- */
  var form = doc.getElementById('signup-form');

  if (form) {
    // Keep the waiting-list intent when the visitor uses its specific CTA.
    doc.querySelectorAll('[data-interest]').forEach(function (link) {
      link.addEventListener('click', function () {
        var value = link.getAttribute('data-interest');
        form.querySelectorAll('input[name="Interested in"]').forEach(function (radio) {
          radio.checked = radio.value === value;
        });
      });
    });

    var TO = 'michaelwichmann9+hello@gmail.com';
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // JS handles validation, so turn off the browser's own bubbles.
    form.noValidate = true;

    var el = function (id) { return doc.getElementById(id); };
    var business = el('f-business');
    var trade = el('f-trade');
    var zip = el('f-zip');
    var email = el('f-email');
    var phone = el('f-phone');
    var trucks = el('f-trucks');

    var setError = function (input, errId, message) {
      var err = el(errId);
      err.textContent = message;
      if (message) { input.setAttribute('aria-invalid', 'true'); }
      else { input.removeAttribute('aria-invalid'); }
    };

    var radioValue = function () {
      var picked = form.querySelector('input[name="Interested in"]:checked');
      return picked ? picked.value : '';
    };

    var clean = function (value) { return (value || '').replace(/\s+/g, ' ').trim(); };

    // Clear an error as soon as the person fixes the field.
    business.addEventListener('input', function () { if (clean(business.value)) { setError(business, 'e-business', ''); } });
    email.addEventListener('input', function () { if (EMAIL_RE.test(email.value.trim())) { setError(email, 'e-email', ''); } });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = clean(business.value);
      var mail = email.value.trim();
      var firstBad = null;

      if (!name) {
        setError(business, 'e-business', 'Please enter your business name.');
        firstBad = firstBad || business;
      } else {
        setError(business, 'e-business', '');
      }

      if (!mail) {
        setError(email, 'e-email', 'Please enter your email.');
        firstBad = firstBad || email;
      } else if (!EMAIL_RE.test(mail)) {
        setError(email, 'e-email', 'That email does not look right. Please check it.');
        firstBad = firstBad || email;
      } else {
        setError(email, 'e-email', '');
      }

      if (firstBad) { firstBad.focus(); return; }

      var none = '(not given)';
      var lines = [
        'Business name: ' + name,
        'Trade: ' + (trade.value || none),
        'ZIP code: ' + (clean(zip.value) || none),
        'Best email: ' + mail,
        'Phone: ' + (clean(phone.value) || none),
        'Trucks: ' + (trucks.value || none),
        'Interested in: ' + (radioValue() || none)
      ];

      // The subject tells the inbox routine which line the lead is for.
      var SUBJECTS = {
        'Free front desk': 'Front desk setup: ',
        'Trucking paperwork list': 'Trucking list: ',
        'Website': 'Website: ',
        'Data cleanup': 'Data cleanup: ',
        'Other paperwork': 'Other paperwork: '
      };
      // No choice made: a trucks answer or the Trucking trade still routes the lead to the trucking list.
      var subject = (SUBJECTS[radioValue()] ||
        ((trucks.value || trade.value === 'Trucking') ? 'Trucking list: ' : 'Northclerk inquiry: ')) + name;

      // encodeURIComponent keeps spaces as %20 and & as %26, which mail apps read correctly.
      var url = 'mailto:' + TO +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\r\n'));

      window.location.href = url;
    });
  }
})();
