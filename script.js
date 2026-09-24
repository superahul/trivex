const EMAIL = 'trivexitsolution@gmail.com';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = id => document.getElementById(id);

$('yr').textContent = new Date().getFullYear();

// Mobile menu.
const menuBtn = document.querySelector('.menu-btn');
if (menuBtn) {
  const nav = $(menuBtn.getAttribute('aria-controls'));
  menuBtn.addEventListener('click', () => {
    const open = menuBtn.getAttribute('aria-expanded') !== 'true';
    menuBtn.setAttribute('aria-expanded', open);
    nav.classList.toggle('open', open);
  });
}

// Home: pause the network diagram for people who prefer less motion.
if (reduce && $('net')) $('net').pauseAnimations();

// Services: tabs, linkable by hash (services.html#odoo), arrow keys move between them.
const tabs = [...document.querySelectorAll('[role="tab"]')];
if (tabs.length) {
  const select = (tab, updateHash) => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      $(t.getAttribute('aria-controls')).hidden = !on;
    });
    // On phones the tabs are a horizontal strip; keep the selected one visible.
    const strip = tab.parentElement;
    if (strip.scrollWidth > strip.clientWidth) strip.scrollLeft = tab.offsetLeft - strip.offsetLeft - 16;
    if (updateHash) history.replaceState(null, '', '#' + tab.dataset.slug);
  };
  const fromHash = () => {
    const tab = tabs.find(t => '#' + t.dataset.slug === location.hash);
    if (tab) select(tab, false);
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab, true));
    tab.addEventListener('keydown', e => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const next = tabs[(i + step + tabs.length) % tabs.length];
      next.focus();
      select(next, true);
    });
  });
  addEventListener('hashchange', fromHash);
  fromHash();
}

// Services: the morning check runs once, when it first comes into view.
(function () {
  const board = $('board');
  if (!board || reduce || !('IntersectionObserver' in window)) return;
  const rows = [...board.querySelectorAll('li')];
  const passed = $('passed');
  board.classList.add('boot');
  passed.textContent = '0 of ' + rows.length;
  new IntersectionObserver((entries, obs) => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    rows.forEach((row, i) => setTimeout(() => {
      row.classList.add('done');
      passed.textContent = (i + 1) + ' of ' + rows.length;
      if (i === rows.length - 1) board.classList.remove('boot');
    }, 500 + i * 380));
  }, { threshold: 0.6 }).observe(board);
})();

// Contact: copy the address; the button confirms, then resets.
const copyBtn = $('copy');
if (copyBtn) copyBtn.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(EMAIL); copyBtn.textContent = 'Copied'; }
  catch { copyBtn.textContent = 'Select the address above to copy'; }
  setTimeout(() => { copyBtn.textContent = 'Copy address'; }, 2200);
});

// Contact: the form posts to Web3Forms, which emails each enquiry to EMAIL.
// With JavaScript we send it in the background and confirm on the page; if that fails,
// we fall back to a normal form post, which Web3Forms redirects back here with ?sent=1.
const form = $('enquiry');
if (form) {
  const el = form.elements;
  const note = $('form-note');
  const send = $('send');
  const chips = [...form.querySelectorAll('.chip input')];
  const fail = html => { note.innerHTML = html; note.classList.add('error'); };
  const showSent = text => {
    if (text) $('sent-text').textContent = text;
    form.hidden = true;
    $('sent').hidden = false;
    $('sent').focus();
  };

  // Arriving from a service page (contact.html?service=odoo) pre-ticks that service.
  const params = new URLSearchParams(location.search);
  const want = params.get('service');
  chips.forEach(c => { if (c.dataset.slug === want) c.checked = true; });
  if (params.has('sent')) showSent();

  form.addEventListener('submit', async e => {
    e.preventDefault();
    note.classList.remove('error');
    form.querySelectorAll('.bad').forEach(f => f.classList.remove('bad'));

    // Every field is required; report the first problem and mark all of them.
    const checks = [
      [el.name, 'Add your name so we know who to reply to.'],
      [el.email, 'Add a valid email address so we can reply.'],
      [el.company, 'Add your company name.'],
      [el.phone, 'Add a phone number, including the area or country code.'],
      [$('svc-set'), 'Pick at least one service you need help with.'],
      [el.message, 'Tell us briefly what’s going on.']
    ];
    const invalid = f => {
      if (f === $('svc-set')) return !chips.some(c => c.checked);
      if (f === el.phone) return f.value.replace(/\D/g, '').length < 7;
      return !f.value.trim() || !f.checkValidity();
    };
    const bad = checks.filter(([f]) => invalid(f));
    if (bad.length) {
      bad.forEach(([f]) => (f.closest('.field') || f).classList.add('bad'));
      fail(bad[0][1]);
      (bad[0][0] === $('svc-set') ? chips[0] : bad[0][0]).focus();
      return;
    }

    const name = el.name.value.trim();
    const email = el.email.value.trim();
    el.subject.value = 'Website enquiry from ' + (el.company.value.trim() || name);
    el.services.value = chips.filter(c => c.checked).map(c => c.value).join(', ');
    // Only a hosted page can be redirected back to; opened as a file, Web3Forms shows its own thank-you page.
    const hosted = location.protocol.startsWith('http');
    el.redirect.value = hosted ? new URL('contact.html?sent=1', location.href).href : '';
    el.redirect.disabled = !hosted;

    send.disabled = true;
    send.textContent = 'Sending…';
    let res;
    try {
      res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
    } catch {
      form.submit(); // background send was blocked; post the form normally instead
      return;
    }
    const out = await res.json().catch(() => ({}));
    send.disabled = false;
    send.textContent = 'Send enquiry';
    if (res.ok && out.success) {
      showSent('Thanks, ' + name + '. An engineer will reply to ' + email + ' within one business day.');
    } else {
      fail('Your enquiry didn’t send. Try again, or email us at <a href="mailto:' + EMAIL + '">' + EMAIL + '</a>.');
    }
  });

  $('again').addEventListener('click', () => {
    form.reset();
    note.textContent = 'We reply within one business day.';
    $('sent').hidden = true;
    form.hidden = false;
    history.replaceState(null, '', location.pathname);
    el.name.focus();
  });
}
