// Progressive section tracking: ordinary anchors and all content work without JS.
(() => {
  const nav = document.querySelector('.cv-shared-nav');
  if (!nav) return;
  const links = [...nav.querySelectorAll('a')];
  const compact = matchMedia('(max-width: 1000px)');
  const menu = document.createElement('button');
  menu.type = 'button';
  menu.className = 'cv-section-toggle';
  menu.textContent = 'CV sections';
  nav.id = 'cv-section-navigation';
  const menuLinks = document.createElement('div');
  menuLinks.id = 'cv-section-links';
  menuLinks.className = 'cv-section-links';
  links.forEach(link => menuLinks.append(link));
  menu.setAttribute('aria-controls', menuLinks.id);
  nav.append(menu, menuLinks);
  nav.classList.add('cv-nav-enhanced');
  function collapseMenu() {
    menu.setAttribute('aria-expanded', 'false');
    menuLinks.hidden = compact.matches;
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menuLinks.hidden = !open;
    schedule();
  });
  nav.addEventListener('keydown', event => {
    if (event.key === 'Escape' && compact.matches) {
      collapseMenu(); menu.focus(); schedule();
    }
  });
  compact.addEventListener('change', () => {
    const focusedLink = menuLinks.contains(document.activeElement);
    collapseMenu();
    if (compact.matches && focusedLink) menu.focus();
    else if (!compact.matches && document.activeElement === menu) links[0].focus();
    schedule();
  });
  collapseMenu();
  const targets = links.map(link => document.getElementById(link.hash.slice(1)));
  const header = document.querySelector('#quarto-header');
  const path = document.getElementById('cv-path');
  const mainSections = [...document.querySelectorAll('#cv-overview, .cv-band')];
  const returns = [...document.querySelectorAll('.cv-return')];
  let returnHash = '#cv-overview';
  let scheduled = false;
  let pendingRestore = null;
  let restoration = 0;

  function selectView(target) {
    const isPath = target === path || path.contains(target);
    if (isPath && path.hidden) {
      const pendingSection = pendingRestore?.closest('#cv-overview, .cv-band');
      returnHash = pendingSection ? `#${pendingSection.id}` : nav.querySelector('[aria-current]')?.hash || '#cv-overview';
      returns.forEach(link => link.setAttribute('href', returnHash));
    }
    path.hidden = !isPath;
    mainSections.forEach(section => { section.hidden = isPath; });
    nav.hidden = isPath;
  }

  function update() {
    scheduled = false;
    const headerBottom = Math.max(0, header?.getBoundingClientRect().bottom || 0);
    document.documentElement.style.setProperty('--cv-header-offset', `${headerBottom}px`);
    const sticky = !nav.hidden && getComputedStyle(nav).position === 'sticky';
    const offset = headerBottom + (sticky ? nav.getBoundingClientRect().height : 0) + 20;
    document.documentElement.style.setProperty('--cv-anchor-offset', `${offset}px`);
    let active = null;
    for (let i = 0; i < targets.length; i++) {
      if (targets[i] && !targets[i].hidden && targets[i].getBoundingClientRect().top <= offset + 2) active = links[i];
    }
    // Record-only bands deliberately have no corresponding shared category.
    const unpaired = [...document.querySelectorAll('#cv-band-training, #cv-band-industry')]
      .some(el => { const box = el.getBoundingClientRect(); return box.top <= offset + 2 && box.bottom > offset + 2; });
    if (unpaired) active = null;
    for (const link of links) {
      if (link === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    menu.textContent = active && active.hash !== '#cv-path' ? `Sections · ${active.textContent}` : 'CV sections';
  }
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }
  function restoreSection() {
    const target = document.getElementById(location.hash.slice(1) || 'cv-overview');
    if (!target || !target.closest('.cv-shell')) return;
    selectView(target);
    pendingRestore = target;
    const revision = ++restoration;
    // Wait for browser fragment restoration and Quarto's header setup.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (revision !== restoration) return;
      update();
      target.scrollIntoView({behavior: 'instant', block: 'start'});
      pendingRestore = null;
      schedule();
    }));
  }
  function navigate(event) {
    const link = event.target.closest('a');
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    collapseMenu();
    selectView(target);
    // A user action supersedes any delayed initial/history fragment scroll.
    restoration++;
    pendingRestore = null;
    update();
    // Quarto's anchor handler adds its own header offset; use the measured CV
    // offset once, while preserving shareable URLs and browser back navigation.
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    target.setAttribute('tabindex', '-1');
    target.focus({preventScroll: true});
    target.scrollIntoView({behavior: 'instant', block: 'start'});
    schedule();
  }
  nav.addEventListener('click', navigate);
  returns.forEach(link => link.addEventListener('click', navigate));
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', restoreSection);
  window.addEventListener('load', restoreSection);
  new ResizeObserver(schedule).observe(nav);
  if (header) new ResizeObserver(schedule).observe(header);
  path.hidden = true;
  selectView(document.getElementById(location.hash.slice(1)) || document.getElementById('cv-overview'));
  update();
})();
