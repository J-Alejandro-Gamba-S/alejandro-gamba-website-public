/* Progressive enhancement: every record and link is already rendered by Quarto. */
(() => {
  const shell = document.querySelector('.deliverables-shell');
  if (!shell) return;
  const form = shell.querySelector('form');
  const disclosure = shell.querySelector('.deliverables-filter-disclosure');
  const narrow = matchMedia('(max-width: 768px)');
  disclosure.open = !narrow.matches;
  narrow.addEventListener('change', () => { disclosure.open = !narrow.matches; });
  const list = shell.querySelector('.deliverables-list');
  const rows = [...list.querySelectorAll('.deliverable')];
  const count = shell.querySelector('.deliverables-count');
  const sortNames = {category:'By type, then newest',recent:'Newest first',oldest:'Oldest first',title:'Title A–Z','title-desc':'Title Z–A'};
  const headings = shell.querySelector('.deliverables-column-headings');
  const types = {all:'All types',preprints:'Preprints',articles:'Articles',abstracts:'Published abstracts',posters:'Posters',writing:'Other writing'};
  const collator = new Intl.Collator('en', {sensitivity:'base'});
  function update() {
    const values = new FormData(form);
    const type = values.get('type'), year = values.get('year'), sort = values.get('sort');
    let visible = 0;
    rows.sort((a,b) => {
      if (sort === 'category') return Number(a.dataset.order)-Number(b.dataset.order);
      if (sort === 'recent' || sort === 'oldest') {
        // Undated manuscripts belong last in either chronological direction.
        if (!a.dataset.date || !b.dataset.date) return Number(!a.dataset.date)-Number(!b.dataset.date) || Number(a.dataset.order)-Number(b.dataset.order);
        return (sort === 'recent' ? -1 : 1)*a.dataset.date.localeCompare(b.dataset.date) || Number(a.dataset.order)-Number(b.dataset.order);
      }
      return (sort === 'title-desc' ? -1 : 1)*collator.compare(a.querySelector('h2').textContent,b.querySelector('h2').textContent) || Number(a.dataset.order)-Number(b.dataset.order);
    });
    rows.forEach(row => {
      row.hidden = !((type === 'all' || row.dataset.category === type) && (year === 'all' || row.dataset.year === year));
      if (!row.hidden) visible++;
      list.append(row);
    });
    count.textContent = `${visible} ${visible===1?'result':'results'} of ${rows.length} · ${types[type]} · ${year==='all'?'All years':year==='undated'?'Undated':year} · ${sortNames[sort]}`;
    headings.querySelectorAll('button').forEach(button => {
      const column = button.dataset.sortColumn;
      const active = column === 'year' ? ['recent','oldest'].includes(sort) : column === 'title' ? ['title','title-desc'].includes(sort) : sort === 'category';
      button.setAttribute('aria-pressed', String(active));
      button.querySelector('span').textContent = active ? (['oldest','title'].includes(sort) ? '↑' : '↓') : '↕';
      const next = column === 'year' ? (sort === 'recent' ? 'oldest' : 'recent') : column === 'title' ? (sort === 'title' ? 'title-desc' : 'title') : 'category';
      const label = column === 'year' ? 'Year' : column === 'title' ? 'Title' : 'Deliverable type';
      button.setAttribute('aria-label', `${label}${active ? ': '+sortNames[sort] : ''}. Sort ${sortNames[next].toLowerCase()}`);
    });
    shell.querySelector('.deliverables-sort-note').textContent = sortNames[sort];
    shell.querySelector('.deliverables-empty').hidden = visible !== 0;
    shell.querySelector('.deliverables-end').hidden = visible === 0;
  }
  form.addEventListener('change',update);
  headings.addEventListener('click', event => {
    const button = event.target.closest('button[data-sort-column]');
    if (!button) return;
    const current = new FormData(form).get('sort');
    const column = button.dataset.sortColumn;
    const next = column === 'year' ? (current === 'recent' ? 'oldest' : 'recent') : column === 'title' ? (current === 'title' ? 'title-desc' : 'title') : 'category';
    form.querySelector(`[name="sort"][value="${next}"]`).checked = true;
    update();
  });
  form.addEventListener('submit',event=>event.preventDefault());
  // Native reset updates the radios after the reset event has dispatched.
  form.addEventListener('reset',()=>queueMicrotask(update));
  shell.querySelector('[data-deliverables-reset]').addEventListener('click',()=>{
    form.reset();
    disclosure.open = true;
    form.querySelector('[name="type"][value="all"]').focus();
  });
  update();
  form.hidden = false;
  disclosure.hidden = false;
  headings.hidden = false;
  shell.dataset.ready = 'true';
})();
