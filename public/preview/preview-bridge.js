/* Transfer a website prompt into the local concept without starting generation. */
(() => {
  const url = new URL(location.href);
  const idea = url.searchParams.get('idea');
  if (idea === null) return;

  homeState.prompt = idea.slice(0, 2000);
  homeState.section = 'home';
  homeState.menu = false;
  homeState.query = '';

  // Remove the submitted prompt from the visible URL after transferring it.
  url.searchParams.delete('idea');
  url.hash = 'home';
  history.replaceState(history.state, '', url);
  render();
  document.getElementById('idea')?.focus();
})();
