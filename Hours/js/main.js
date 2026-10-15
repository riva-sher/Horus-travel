(function () {
  'use strict';

  var WHATSAPP_NUMBER = '9647706900099';
  var BOOKINGS_EMAIL = 'operations@horus-travel.com';

  var header = document.querySelector('.site-header');
  var nav = document.getElementById('site-nav');
  var toggle = document.querySelector('.nav-toggle');

  /* ---------- Header: transparent over the hero, solid once scrolled or while the menu is open ---------- */
  var menuOpen = false;
  function updateHeader() {
    header.classList.toggle('solid', menuOpen || window.scrollY > 8);
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ---------- Mobile menu ---------- */
  function setMenu(open) {
    menuOpen = open;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    updateHeader();
  }
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      setMenu(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 960px)').addEventListener('change', function (mq) {
    if (mq.matches) setMenu(false);
  });

  /* ---------- Scroll reveal ---------- */
  document.querySelectorAll('.stagger').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (el, i) {
      el.style.setProperty('--delay', (i % 4) * 80 + 'ms');
    });
  });

  var revealEls = document.querySelectorAll('.reveal');
  function markDone(e) {
    if (e.target === e.currentTarget && e.propertyName === 'opacity') {
      e.currentTarget.classList.add('done');
      e.currentTarget.removeEventListener('transitionend', markDone);
    }
  }
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.addEventListener('transitionend', markDone);
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in', 'done'); });
  }

  /* ---------- Active nav link ---------- */
  var navLinks = nav.querySelectorAll('ul a');
  if ('IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------- Client tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });
  if (tabs.length) selectTab(tabs[0], false);

  document.querySelectorAll('.client-grid').forEach(function (grid) {
    Array.prototype.forEach.call(grid.children, function (li, i) {
      li.style.setProperty('--i', Math.min(i, 24));
    });
  });

  /* ---------- Quote form ---------- */
  var form = document.getElementById('quote-form');
  var depart = document.getElementById('q-depart');
  var ret = document.getElementById('q-return');

  function isoToday() {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }
  depart.min = isoToday();
  ret.min = isoToday();
  depart.addEventListener('change', function () {
    ret.min = depart.value || isoToday();
    if (ret.value && depart.value && ret.value < depart.value) ret.value = '';
  });

  function formatDate(value) {
    if (!value) return '';
    var p = value.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  function field(name) {
    var el = form.elements[name];
    return el ? el.value.trim() : '';
  }

  function buildMessage() {
    var lines = ['Hello Horus Travel, I would like a quote.', ''];
    function add(label, value) { if (value) lines.push(label + ': ' + value); }
    add('Name', field('name'));
    add('Phone', field('phone'));
    add('Service', field('service'));
    if (field('from') || field('to')) add('Route', (field('from') || '?') + ' → ' + (field('to') || '?'));
    add('Departure', formatDate(field('depart')));
    add('Return', formatDate(field('return')));
    add('Travellers', field('travellers'));
    if (field('notes')) lines.push('', field('notes'));
    return lines.join('\n');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(buildMessage());
    window.open(url, '_blank', 'noopener');
  });

  document.getElementById('send-email').addEventListener('click', function () {
    if (!form.reportValidity()) return;
    var subject = 'Quote request: ' + field('service') + (field('name') ? ' (' + field('name') + ')' : '');
    window.location.href = 'mailto:' + BOOKINGS_EMAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(buildMessage());
  });

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
