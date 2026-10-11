/* Shared project previews, area selection, and year-granularity Timeline. */
(() => {
  const shell = document.querySelector('.research-shell');
  if (!shell) return;
  const nodes = [...shell.querySelectorAll('[data-research-area]')];
  const filters = [...shell.querySelectorAll('[data-research-filter]')];
  const status = shell.querySelector('.research-selection-status');
  const colors = { perception: 'green', 'working-memory': 'blue', interactive: 'cyan', metacognition: 'red', decision: 'neutral' };
  const palette = { perception: '#67B97A', 'working-memory': '#4A9EFF', consciousness: '#ECEEEB', metacognition: '#C64F4B', decision: '#D6DBD7', interactive: '#5FD3E6' };
  filters.forEach(button => {
    button.style.setProperty('--area-color', palette[button.dataset.researchFilter] || '#A4AAA5');
  });
  const labels = Object.fromEntries(nodes.map(node => [node.dataset.researchArea, node.querySelector('.research-node-title').textContent.trim()]));
  let selected = 'all';
  let hovered = null;
  let focused = null;
  let view = 'map';
  const viewButtons = [...shell.querySelectorAll('[data-research-view]')];
  const mapPanel = shell.querySelector('#research-map-panel');
  const timelinePanel = shell.querySelector('#research-timeline-panel');
  const projectPanel = shell.querySelector('.research-project-panel');
  const projectResults = shell.querySelector('.research-project-results');
  const projects = Array.isArray(window.JAGS_PROJECTS) ? window.JAGS_PROJECTS : [];
  let panelOpen = false;
  let selectionControl = null;
  let selectedStatus = 'all';
  const statusFilters = [...shell.querySelectorAll('[data-project-status]')];
  const matchesStatus = project => selectedStatus === 'all' || project.status === selectedStatus;
  const dateLabel = project => {
    const start = `${project.start_date_approximate ? 'c. ' : ''}${project.start_date || 'Date forthcoming'}`;
    return `${start}${project.ongoing ? '–ongoing' : project.end_date ? `–${project.end_date}` : ''}`;
  };
  const projectYear = value => /^\d{4}(?:-\d{2})?(?:-\d{2})?$/.test(value || '') ? Number(value.slice(0, 4)) : null;

  function renderTimeline() {
    const dated = projects.filter(project => projectYear(project.start_date) !== null &&
      (project.ongoing || projectYear(project.end_date) !== null));
    const first = Math.min(...dated.map(project => Number(project.start_date.slice(0, 4))));
    const last = Math.max(...dated.map(project => project.ongoing
      ? Math.max(new Date().getFullYear(), projectYear(project.start_date)) : projectYear(project.end_date)));
    const span = last - first + 1;
    const lane = shell.querySelector('.research-timeline-lanes');
    lane.replaceChildren();
    {
      const matching = [...projects].sort((a, b) => (a.start_date || '9999').localeCompare(b.start_date || '9999'));
      if (!matching.length) {
        const empty = document.createElement('span');
        empty.textContent = selectedStatus === 'all' ? 'No listed projects match these filters' : 'No projects match this status';
        lane.append(empty);
        return;
      }
      const chart = document.createElement('div');
      chart.className = 'research-timeline-chart';
      chart.style.setProperty('--timeline-years', dated.length ? span : 1);
      if (dated.length) {
        const axis = document.createElement('div');
        axis.className = 'research-timeline-axis';
        axis.style.gridTemplateColumns = `repeat(${span}, minmax(0, 1fr))`;
        for (let year = first; year <= last; year++) {
          const tick = document.createElement('span');
          tick.textContent = year;
          axis.append(tick);
        }
        chart.append(axis);
      }
      matching.forEach(project => {
        const track = document.createElement('div');
        track.className = 'research-timeline-track';
        const link = document.createElement('a');
        link.className = 'research-timeline-project';
        link.href = project.url;
        link.style.setProperty('--project-accent', palette[project.research_areas?.[0]] || '#ECEEEB');
        link.setAttribute('aria-label', `${project.title}. ${project.research_areas.map(id => labels[id]).join(', ')}. ${dateLabel(project)}. ${project.status_label || project.status}`);
        const title = document.createElement('strong');
        title.textContent = project.short_title || project.title;
        const metadata = document.createElement('span');
        metadata.textContent = `${dateLabel(project) || 'Dates forthcoming'} · ${project.status_label || project.status}`;
        link.append(title);
        link.title = `${project.title}\n${metadata.textContent}`;
        if (dated.includes(project)) {
          link.style.marginLeft = `${(Number(project.start_date.slice(0, 4)) - first) / span * 100}%`;
          const endYear = project.ongoing ? last : projectYear(project.end_date);
          link.style.width = `${(endYear - projectYear(project.start_date) + 1) / span * 100}%`;
        }
        if (project.ongoing) {
          link.classList.add('is-ongoing');
          const continuing = document.createElement('span');
          continuing.className = 'timeline-ongoing-label';
          continuing.textContent = 'Ongoing →';
          link.append(continuing);
        }
        if (project.start_date_approximate) {
          const approximate = document.createElement('span');
          approximate.className = 'timeline-date-note';
          approximate.textContent = 'Start year approximate';
          link.append(approximate);
        }
        track.append(link);
        chart.append(track);
      });
      lane.append(chart);
    }
  }

  statusFilters.forEach(button => button.addEventListener('click', () => {
    selectedStatus = button.dataset.projectStatus;
    statusFilters.forEach(control => {
      const active = control === button;
      control.classList.toggle('is-active', active);
      control.setAttribute('aria-pressed', String(active));
    });
    renderProjects();
    renderTimeline();
    hovered = focused = null;
    paint();
    announce();
  }));

  // Only show verified counts; an unpopulated area is not evidence of zero projects.
  nodes.forEach(node => {
    const count = projects.filter(project => project.research_areas?.includes(node.dataset.researchArea)).length;
    if (count) node.querySelector('.research-node-meta').classList.add('has-project-count');
    if (count) node.querySelector('.research-node-meta').textContent = `${count} ${count === 1 ? 'PROJECT' : 'PROJECTS'} →`;
    node.setAttribute('aria-label', `${labels[node.dataset.researchArea]}, ${count} listed ${count === 1 ? 'project' : 'projects'}`);
  });

  function renderProjects() {
    projectPanel.hidden = !panelOpen || selected === 'all';
    [...nodes, ...filters].forEach(control => {
      control.setAttribute('aria-controls', 'research-project-panel');
      control.setAttribute('aria-expanded', String(!projectPanel.hidden &&
        (control.dataset.researchArea || control.dataset.researchFilter) === selected));
    });
    if (projectPanel.hidden) return;
    shell.querySelector('#research-project-heading').textContent = labels[selected];
    projectResults.replaceChildren();
    const matching = projects.filter(project => project.research_areas?.includes(selected) && matchesStatus(project));
    if (!matching.length) {
      const message = document.createElement('p');
      message.textContent = selectedStatus === 'all' ? 'Project details for this area are coming soon.' : 'No listed projects match this status.';
      projectResults.append(message);
      return;
    }
    matching.forEach(project => {
      const article = document.createElement('article');
      const title = document.createElement('h3');
      title.textContent = project.title;
      const summary = document.createElement('p');
      summary.textContent = project.summary || '';
      article.append(title, summary);
      if (project.status) {
        const state = document.createElement('p');
        state.className = 'research-project-state';
        state.textContent = `${project.status_label || project.status} · ${dateLabel(project)}`;
        article.append(state);
      }
      if (project.url) {
        let url;
        try { url = new URL(project.url, document.baseURI); } catch { url = null; }
        if (url) {
        if (['http:', 'https:'].includes(url.protocol) ||
            (url.protocol === 'file:' && !/^[a-z]+:/i.test(project.url))) {
          const link = document.createElement('a');
          link.href = url.href;
          link.textContent = 'View project';
          link.setAttribute('aria-label', `View project: ${project.title}`);
          article.append(link);
        }
        }
      }
      projectResults.append(article);
    });
  }

  shell.querySelector('.research-project-close').addEventListener('click', () => {
    panelOpen = false;
    renderProjects();
    const target = view === 'map' ? selectionControl : filters.find(button => button.dataset.researchFilter === selected);
    target?.focus();
  });

  function announce() {
    if (view === 'timeline') { status.textContent = 'Timeline · All projects'; return; }
    const area = selected === 'all' ? 'All research areas' : `${labels[selected]} selected`;
    const count = projects.filter(project => matchesStatus(project) && (selected === 'all' || project.research_areas?.includes(selected))).length;
    status.textContent = `Cognitive Map · ${area}${selectedStatus === 'all' ? '' : ` · ${selectedStatus}`} · ${count} ${count === 1 ? 'project' : 'projects'}`;
  }

  function switchView(next) {
    view = next;
    shell.dataset.view = next;
    shell.querySelector('.research-color-legend').hidden = next !== 'timeline';
    if (next === 'timeline') panelOpen = false;
    hovered = focused = null;
    mapPanel.hidden = view !== 'map';
    timelinePanel.hidden = view !== 'timeline';
    viewButtons.forEach(button => {
      const active = button.dataset.researchView === view;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    shell.querySelector('.research-view-hint').textContent = view === 'map'
      ? 'SELECT AN AREA FOR PROJECTS' : 'SELECT A PROJECT TO READ MORE';
    announce();
    paint();
    renderProjects();
  }

  viewButtons.forEach(button => button.addEventListener('click', () => switchView(button.dataset.researchView)));


  function paint() {

    const area = hovered || focused || selected;
    const active = area !== 'all';
    const statusMatches = id => selectedStatus === 'all' || projects.some(project => project.research_areas?.includes(id) && matchesStatus(project));
    const related = id => statusMatches(id) && (!active || id === area || id === 'consciousness' || area === 'consciousness');
    nodes.forEach(node => {
      const id = node.dataset.researchArea;
      node.classList.toggle('is-dimmed', !related(id));
      node.classList.toggle('is-selected', id === selected);
      node.setAttribute('aria-pressed', String(id === selected));
    });
    filters.forEach(button => {
      const chosen = button.dataset.researchFilter === selected;
      button.classList.toggle('is-active', chosen);
      button.setAttribute('aria-pressed', String(chosen));
    });
    Object.keys(labels).forEach(id => {
      shell.querySelectorAll(`.secondary-cluster--${id}, .constellation--${id}`).forEach(layer => layer.classList.toggle('is-dimmed', !related(id)));
    });
    shell.querySelectorAll('.network-connection').forEach(link => {
      const belongs = !active || area === 'consciousness' || link.classList.contains(`network-connection--${colors[area]}`);
      const owner = Object.keys(colors).find(id => link.classList.contains(`network-connection--${colors[id]}`));
      link.classList.toggle('is-dimmed', !belongs || (selectedStatus !== 'all' && (!owner || !statusMatches(owner) || !statusMatches('consciousness'))));
    });
    shell.querySelector('.secondary-cross-links')?.classList.toggle('is-dimmed', active || selectedStatus !== 'all');
  }

  function select(area) {
    selected = area;
    hovered = focused = null;
    panelOpen = area !== 'all' && view === 'map';
    announce();
    paint();
    renderProjects();
    renderTimeline();
  }

  [...nodes, ...filters].forEach(control => {
    const area = control.dataset.researchArea || control.dataset.researchFilter;
    control.addEventListener('click', () => {
      selectionControl = control;
      select(area);
      if (!projectPanel.hidden) shell.querySelector('#research-project-heading').focus();
    });
    control.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch') return;
      hovered = area;
      paint();
    });
    control.addEventListener('pointerleave', () => { hovered = null; paint(); });
    control.addEventListener('focus', () => { focused = area; paint(); });
    control.addEventListener('blur', () => { focused = null; paint(); });
  });
  shell.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const restoreFocus = projectPanel.contains(document.activeElement);
      selectedStatus = 'all';
      statusFilters.forEach(button => {
        const active = button.dataset.projectStatus === 'all';
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      renderTimeline();
      select('all');
      if (restoreFocus) filters.find(button => button.dataset.researchFilter === 'all')?.focus();
      event.preventDefault();
    }
  });
  paint();
  renderProjects();
  renderTimeline();
  shell.dataset.ready = 'true';
  announce();
})();
