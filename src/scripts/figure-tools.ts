// Zoom lightbox for the figures and Copy buttons for the code blocks.

export {};

const dialog = document.querySelector<HTMLDialogElement>("[data-lightbox]");
const stage = dialog?.querySelector<HTMLElement>("[data-lb-stage]");
const download = dialog?.querySelector<HTMLAnchorElement>('[data-lb="download"]');
const img = stage ? Object.assign(document.createElement("img"), { alt: "", draggable: false }) : null;
if (img) stage?.append(img);

let scale = 1;
let x = 0;
let y = 0;
const MAX_SCALE = 12;

// Keep the picture on screen: it can only be panned as far as the zoom reveals.
const apply = () => {
  if (!img) return;
  const maxX = ((scale - 1) * img.clientWidth) / 2;
  const maxY = ((scale - 1) * img.clientHeight) / 2;
  x = Math.max(-maxX, Math.min(maxX, x));
  y = Math.max(-maxY, Math.min(maxY, y));
  img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
};
const reset = () => {
  scale = 1;
  x = 0;
  y = 0;
  apply();
};
// Zoom about a point given relative to the stage centre, so the point stays put.
const zoom = (factor: number, cx = 0, cy = 0) => {
  const next = Math.min(MAX_SCALE, Math.max(1, scale * factor));
  const k = next / scale;
  x = cx - (cx - x) * k;
  y = cy - (cy - y) * k;
  scale = next;
  apply();
};

if (dialog && stage && img && download && typeof dialog.showModal === "function") {
  document.querySelectorAll<HTMLAnchorElement>("[data-zoom]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      img.src = link.dataset.zoom ?? "";
      img.alt = link.dataset.alt ?? "";
      download.href = img.src;
      reset();
      dialog.showModal();
    });
    // The image itself also opens the zoom view.
    link.closest("figure")?.querySelector("img")?.addEventListener("click", () => link.click());
  });

  dialog.querySelector('[data-lb="in"]')?.addEventListener("click", () => zoom(1.5));
  dialog.querySelector('[data-lb="out"]')?.addEventListener("click", () => zoom(1 / 1.5));
  dialog.querySelector('[data-lb="reset"]')?.addEventListener("click", reset);
  dialog.querySelector('[data-lb="close"]')?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  stage.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const r = stage.getBoundingClientRect();
      zoom(Math.exp(-e.deltaY * 0.002), e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2);
    },
    { passive: false },
  );

  let drag: { id: number; px: number; py: number } | null = null;
  const endDrag = (e: PointerEvent) => {
    if (drag?.id === e.pointerId) drag = null;
  };
  stage.addEventListener("pointerdown", (e) => {
    if (drag) return;
    drag = { id: e.pointerId, px: e.clientX, py: e.clientY };
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener("pointermove", (e) => {
    if (drag?.id !== e.pointerId) return;
    x += e.clientX - drag.px;
    y += e.clientY - drag.py;
    drag.px = e.clientX;
    drag.py = e.clientY;
    apply();
  });
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
  stage.addEventListener("lostpointercapture", endDrag);

  // Keys work anywhere in the dialog, so they do not need the stage focused first.
  dialog.addEventListener("keydown", (e) => {
    const step = 40;
    if (e.key === "+" || e.key === "=") zoom(1.5);
    else if (e.key === "-") zoom(1 / 1.5);
    else if (e.key === "0") reset();
    else if (e.key === "ArrowLeft") x += step;
    else if (e.key === "ArrowRight") x -= step;
    else if (e.key === "ArrowUp") y += step;
    else if (e.key === "ArrowDown") y -= step;
    else return;
    e.preventDefault();
    apply();
  });
}

const status = document.querySelector<HTMLElement>("[data-copy-status]");

async function copyText(text: string, from: HTMLElement) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.cssText = "position:fixed;opacity:0";
    document.body.append(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    from.focus();
    if (!ok) throw new Error("copy was refused");
  }
}

const announce = (message: string) => {
  if (!status) return;
  status.textContent = "";
  setTimeout(() => (status.textContent = message), 50);
};

document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => {
  const label = button.textContent ?? "Copy";
  let timer = 0;
  button.addEventListener("click", async () => {
    try {
      let text = document.getElementById(button.dataset.copyTarget ?? "")?.textContent ?? "";
      if (button.dataset.copyUrl) {
        const res = await fetch(button.dataset.copyUrl);
        if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
        text = await res.text();
      }
      await copyText(text, button);
      button.textContent = "Copied";
      announce("Copied to the clipboard.");
    } catch {
      button.textContent = "Copy failed";
      announce("Copy failed. Use the download link instead.");
    }
    clearTimeout(timer);
    timer = window.setTimeout(() => (button.textContent = label), 1800);
  });
});
