import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type ViewName = "top" | "angled" | "bottom";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function mount(root: HTMLElement) {
  const url = root.dataset.glb;
  const stage = root.querySelector<HTMLElement>("[data-viewer-stage]");
  const status = root.querySelector<HTMLElement>("[data-viewer-status]");
  const fallback = root.querySelector<HTMLElement>("[data-viewer-fallback]");
  if (!url || !stage || !status) return;

  const say = (text: string) => {
    status.textContent = text;
  };

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    say("3D is not available in this browser. Showing the still render.");
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute("role", "application");
  canvas.setAttribute("aria-label", root.dataset.label ?? "3D view of the board");
  canvas.hidden = true;
  stage.append(canvas);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  const sun = new THREE.DirectionalLight(0xffffff, 1.1);
  sun.position.set(30, 60, 40);
  scene.add(sun);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 2000);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = !reduceMotion;
  controls.autoRotateSpeed = 1.2;
  controls.listenToKeyEvents(canvas);

  let center = new THREE.Vector3();
  let radius = 50;
  let loaded = false;
  let visible = false;
  let tween: { from: THREE.Vector3; to: THREE.Vector3; start: number } | null = null;

  const viewPosition = (view: ViewName) => {
    const d = radius * 3.3;
    const offset =
      view === "top"
        ? new THREE.Vector3(0, d, 0.001)
        : view === "bottom"
          ? new THREE.Vector3(0, -d, 0.001)
          : new THREE.Vector3(d * 0.45, d * 0.75, d * 0.65);
    return center.clone().add(offset);
  };

  const goTo = (view: ViewName) => {
    if (!loaded) return;
    const to = viewPosition(view);
    if (reduceMotion) {
      camera.position.copy(to);
      controls.update();
    } else {
      tween = { from: camera.position.clone(), to, start: performance.now() };
    }
    root.querySelectorAll<HTMLButtonElement>("[data-view]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.view === view));
    });
  };

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = stage;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(stage);

  let raf = 0;
  const frame = (now: number) => {
    raf = 0;
    if (tween) {
      const t = Math.min((now - tween.start) / 700, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      camera.position.lerpVectors(tween.from, tween.to, eased);
      if (t === 1) tween = null;
    }
    controls.update();
    renderer.render(scene, camera);
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const wake = () => {
    if (loaded && visible && !raf) raf = requestAnimationFrame(frame);
  };
  document.addEventListener("visibilitychange", wake);

  const controlsBar = root.querySelector<HTMLElement>(".sc-controls");
  const spin = root.querySelector<HTMLButtonElement>("[data-spin]");
  spin?.addEventListener("click", () => {
    controls.autoRotate = !controls.autoRotate;
    spin.setAttribute("aria-pressed", String(controls.autoRotate));
  });
  root.querySelectorAll<HTMLButtonElement>("[data-view]").forEach((b) => {
    b.addEventListener("click", () => goTo(b.dataset.view as ViewName));
  });

  const load = () => {
    say("Loading the 3D model…");
    new GLTFLoader().load(
      url,
      (gltf) => {
        scene.add(gltf.scene);
        const box = new THREE.Box3().setFromObject(gltf.scene);
        center = box.getCenter(new THREE.Vector3());
        radius = box.getSize(new THREE.Vector3()).length() / 2;
        controls.target.copy(center);
        controls.minDistance = radius * 0.8;
        controls.maxDistance = radius * 8;
        camera.near = radius * 0.02;
        camera.far = radius * 40;
        camera.position.copy(viewPosition("top"));
        camera.updateProjectionMatrix();
        loaded = true;
        resize();
        canvas.hidden = false;
        if (controlsBar) controlsBar.hidden = false;
        if (fallback) fallback.hidden = true;
        goTo("angled");
        root.dataset.ready = "true";
        say("Drag to rotate, scroll to zoom, arrow keys to move.");
        wake();
      },
      undefined,
      () => say("The 3D model could not load. Showing the still render."),
    );
  };

  new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (visible && !loaded && !root.dataset.started) {
        root.dataset.started = "true";
        load();
      }
      wake();
    },
    { rootMargin: "200px" },
  ).observe(root);
}

document.querySelectorAll<HTMLElement>("[data-board-viewer]").forEach(mount);
