import aboutData from '../data/about-data.js';

const shell = document.querySelector('.about-shell');

if (shell) {
  const {locations, interests} = aboutData;
  const svgNS = 'http://www.w3.org/2000/svg';
  const nodesLayer = shell.querySelector('[data-about-nodes]');
  const route = shell.querySelector('[data-about-route]');
  const popover = shell.querySelector('[data-about-popover]');
  const map = shell.querySelector('[data-about-map]');
  let selectedNode = null;
  const nodeLocations = new Map();
  const nearestNode = (event) => [...nodeLocations.keys()].reduce((nearest, node) => {
    const bounds = node.querySelector('.node-core').getBoundingClientRect();
    const distance = Math.hypot(event.clientX - bounds.left - bounds.width / 2, event.clientY - bounds.top - bounds.height / 2);
    return !nearest || distance < nearest.distance ? {node, distance} : nearest;
  }, null)?.node;
  const clearPreview = () => nodesLayer.querySelectorAll('.is-preview').forEach(node => node.classList.remove('is-preview'));
  const routeLayer = shell.querySelector('.about-route-layer');
  routeLayer.addEventListener('pointermove', (event) => {
    clearPreview();
    if (event.target.closest('.about-node')) nearestNode(event)?.classList.add('is-preview');
  });
  routeLayer.addEventListener('pointerleave', clearPreview);

  const projection = {width: 1000, height: 430, latitudeMax: 85, latitudeMin: -60};
  const point = (location) => ({
    x: ((location.longitude + 180) / 360) * projection.width,
    y: ((projection.latitudeMax - location.latitude) / (projection.latitudeMax - projection.latitudeMin)) * projection.height
  });
  const trajectory = locations.map(point);
  route.setAttribute('d', trajectory.reduce((path, current, index) => {
    if (!index) return `M ${current.x} ${current.y}`;
    const previous = trajectory[index - 1];
    const middleX = (previous.x + current.x) / 2;
    const lift = Math.min(24, Math.max(8, Math.abs(current.x - previous.x) * .08));
    return `${path} Q ${middleX} ${Math.min(previous.y, current.y) - lift} ${current.x} ${current.y}`;
  }, ''));

  const hidePopover = () => {
    popover.hidden = true;
    map.classList.remove('has-active-location');
    selectedNode?.classList.remove('is-active');
    selectedNode?.setAttribute('aria-expanded', 'false');
    selectedNode = null;
  };

  const showLocation = (location, node) => {
    selectedNode?.classList.remove('is-active');
    selectedNode?.setAttribute('aria-expanded', 'false');
    selectedNode = node;
    node.classList.add('is-active');
    node.setAttribute('aria-expanded', 'true');

    const flag = popover.querySelector('[data-location-flag]');
    flag.replaceChildren();
    const flagImage = document.createElement('img');
    flagImage.src = `assets/images/about/flag-${location.countryCode.toLowerCase()}.svg`;
    flagImage.alt = `${location.country} flag`;
    flag.append(flagImage);
    flag.setAttribute('aria-label', `${location.country} flag`);
    popover.querySelector('[data-location-period]').textContent = location.years;
    const countryLabel = {GB: 'UK', US: 'USA'}[location.countryCode] || location.country;
    popover.querySelector('[data-location-place]').textContent = `${location.city}, ${countryLabel}`;
    const logoField = popover.querySelector('[data-location-logo-field]');
    logoField.replaceChildren();
    if (location.logo) {
      const logo = document.createElement('img');
      logo.src = location.logo;
      logo.alt = location.logoAlt;
      logo.loading = 'eager';
      logoField.append(logo);
      if (location.additionalLogo) {
        const additionalLogo = document.createElement('img');
        additionalLogo.src = location.additionalLogo;
        additionalLogo.alt = location.additionalLogoAlt;
        logoField.append(additionalLogo);
      }
    } else {
      const pending = document.createElement('span');
      pending.className = 'about-logo-pending';
      pending.textContent = 'Institution logo pending';
      pending.setAttribute('role', 'img');
      pending.setAttribute('aria-label', location.logoAlt);
      logoField.append(pending);
    }

    popover.hidden = false;
    positionPopover();
    map.classList.add('has-active-location');
  };

  const positionPopover = () => {
    if (!selectedNode || popover.hidden) return;
    const bounds = map.getBoundingClientRect();
    const nodeBounds = selectedNode.getBoundingClientRect();
    const width = popover.offsetWidth;
    const height = popover.offsetHeight;
    const x = nodeBounds.left + nodeBounds.width / 2 - bounds.left;
    const y = nodeBounds.top + nodeBounds.height / 2 - bounds.top;
    const preferredX = x + 16 + width <= bounds.width ? x + 16 : x - width - 16;
    popover.style.left = `${Math.max(6, Math.min(bounds.width - width - 6, preferredX))}px`;
    popover.style.top = `${Math.max(6, Math.min(bounds.height - height - 6, y + 12))}px`;
  };
  new ResizeObserver(positionPopover).observe(map);
  map.addEventListener('scroll', positionPopover);

  locations.forEach((location) => {
    const node = document.createElementNS(svgNS, 'g');
    node.classList.add('about-node');
    node.dataset.locationId = location.id;
    const coordinates = point(location);
    node.setAttribute('transform', `translate(${coordinates.x} ${coordinates.y})`);
    node.setAttribute('role', 'button');
    node.setAttribute('tabindex', '0');
    node.setAttribute('focusable', 'true');
    node.setAttribute('aria-expanded', 'false');
    node.setAttribute('aria-label', `${location.city} — academic trajectory location`);
    node.innerHTML = '<circle class="node-hit" r="18"/><circle class="node-halo" r="12"/><circle class="node-ring" r="7"/><circle class="node-core" r="3"/>';
    nodeLocations.set(node, location);
    node.addEventListener('click', (event) => {
      // Nearby circles share large touch targets; resolve actual pointer events by proximity.
      const target = event.isTrusted && event.detail > 0 ? nearestNode(event) : node;
      showLocation(nodeLocations.get(target), target);
    });
    node.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showLocation(location, node); }
      if (event.key === 'Escape') hidePopover();
    });
    nodesLayer.append(node);
  });

  popover.querySelector('.about-location-close').addEventListener('click', () => {
    const previousNode = selectedNode;
    hidePopover();
    previousNode?.focus({preventScroll:true});
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') hidePopover(); });

  const icons = {
    travel: '<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5 5-3ZM12 1v3m0 16v3M1 12h3m16 0h3"/>',
    mountain: '<path d="m2 19 7-11 3 5 3-7 7 13H2Zm5-3 2-3 2 2 4-6 3 5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 4 6 4 9s-1 6-4 9c-3-3-4-6-4-9s1-6 4-9Z"/>',
    gym: '<path d="M3 10v4m3-7v10m12-10v10m3-7v4M6 12h12"/>',
    book: '<path d="M3 5c4-1 7 0 9 3v12c-2-3-5-4-9-3V5Zm18 0c-4-1-7 0-9 3v12c2-3 5-4 9-3V5Z"/>'
  };
  const grid = shell.querySelector('[data-about-interests]');
  interests.forEach((interest) => {
    const article = document.createElement('article');
    article.className = 'interest-card hud-panel hud-frame hud-frame--badge';
    article.style.setProperty('--interest-position', interest.imagePosition);
    article.style.setProperty('--interest-image', `url("${new URL(interest.image, document.baseURI).href}")`);
    article.innerHTML = `<div class="interest-image" aria-hidden="true"></div><div class="interest-content"><svg viewBox="0 0 24 24" aria-hidden="true">${icons[interest.icon]}</svg><h3>${interest.title}</h3><p>${interest.description}</p><span class="interest-meter" aria-hidden="true">${Array.from({length: 5}, (_, index) => `<i${index < interest.activeSegments ? ' class="is-active"' : ''}></i>`).join('')}</span></div>`;
    grid.append(article);
  });

  // Descriptions are available by pointer, touch, and keyboard; badges remain static content.
  shell.querySelectorAll('.ecology-module').forEach((module) => {
    const show = () => module.setAttribute('aria-expanded', 'true');
    const hide = () => module.setAttribute('aria-expanded', 'false');
    module.addEventListener('mouseenter', show);
    module.addEventListener('mouseleave', () => { if (document.activeElement !== module) hide(); });
    module.addEventListener('focus', show);
    module.addEventListener('blur', hide);
    module.addEventListener('click', show);
    module.addEventListener('keydown', (event) => { if (event.key === 'Escape') hide(); });
  });
}
