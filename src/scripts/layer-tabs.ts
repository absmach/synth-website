// Copper layer tabs: swap the layer image, its caption and the Zoom/Download links.
// Each tab is a real link to its SVG, so without JavaScript it just opens the file.

export {};

document.querySelectorAll<HTMLElement>("[data-layers]").forEach((box) => {
  const tabs = [...box.querySelectorAll<HTMLAnchorElement>("[data-layer]")];
  const panel = box.querySelector<HTMLElement>("[data-layer-panel]");
  const img = box.querySelector<HTMLImageElement>("[data-layer-img]");
  const note = box.querySelector<HTMLElement>("[data-layer-note]");
  const zoom = box.querySelector<HTMLAnchorElement>("[data-layer-zoom]");
  const download = box.querySelector<HTMLAnchorElement>("[data-layer-download]");
  if (!panel || !img || !note || !zoom || !download) return;

  let pending = { alt: img.alt, note: note.textContent ?? "" };
  // The caption and alt text change only when the new image is on screen, so they never describe the old one.
  const showText = () => {
    img.alt = pending.alt;
    note.textContent = pending.note;
  };

  const select = (tab: HTMLAnchorElement) => {
    const file = tab.dataset.file ?? "";
    const alt = tab.dataset.alt ?? "";
    pending = { alt, note: tab.dataset.note ?? "" };
    img.addEventListener("load", showText, { once: true });
    img.src = file;
    if (img.complete) showText();
    zoom.href = download.href = zoom.dataset.zoom = file;
    zoom.dataset.alt = alt;
    panel.setAttribute("aria-labelledby", tab.id);
    tabs.forEach((t) => {
      t.setAttribute("aria-selected", String(t === tab));
      t.tabIndex = t === tab ? 0 : -1;
    });
  };

  // Keyboard: arrows, Home and End move between tabs. Until a tab is chosen, all of them stay in the tab order.
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      e.preventDefault();
      select(tab);
    });
    tab.addEventListener("keydown", (e) => {
      const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (next === undefined || next < 0 || next >= tabs.length) return;
      e.preventDefault();
      tabs[next].focus();
      select(tabs[next]);
    });
  });
  tabs.forEach((t, i) => (t.tabIndex = i === 0 ? 0 : -1));
});
