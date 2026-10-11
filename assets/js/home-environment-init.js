// Select the Home environment before body content paints.
(() => {
  const environments = ['planet', 'landscape', 'nebula'];
  const key = 'jags-environment';
  const requested = new URLSearchParams(location.search).get('env');
  let selected = environments.includes(requested) ? requested : null;

  try {
    if (!selected) {
      const stored = sessionStorage.getItem(key);
      selected = environments.includes(stored) ? stored : null;
    }
    if (!selected) selected = environments[Math.floor(Math.random() * environments.length)];
    sessionStorage.setItem(key, selected);
  } catch {
    // A privacy setting may block storage; the Home remains usable with a per-load choice.
    if (!selected) selected = environments[Math.floor(Math.random() * environments.length)];
  }

  document.documentElement.dataset.homeEnvironment = selected;
})();
