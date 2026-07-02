const canvas = document.querySelector("#thermal-field");
const ctx = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;
let particles = [];
let width = 0;
let height = 0;
let animationFrame = 0;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.min(96, Math.max(42, Math.floor((width * height) / 18000)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.6 + 0.4,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.24 - 0.05,
    hue: Math.random() > 0.72 ? 272 : 190,
    alpha: Math.random() * 0.36 + 0.08,
  }));
}

function drawThermalField() {
  ctx.clearRect(0, 0, width, height);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -20) p.x = width + 20;
    if (p.x > width + 20) p.x = -20;
    if (p.y < -20) p.y = height + 20;
    if (p.y > height + 20) p.y = -20;

    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8);
    gradient.addColorStop(0, `hsla(${p.hue}, 95%, 68%, ${p.alpha})`);
    gradient.addColorStop(1, `hsla(${p.hue}, 95%, 68%, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2);
    ctx.fill();
  }

  animationFrame = requestAnimationFrame(drawThermalField);
}

function drawStaticThermalField() {
  ctx.clearRect(0, 0, width, height);
  for (const p of particles) {
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8);
    gradient.addColorStop(0, `hsla(${p.hue}, 95%, 68%, ${p.alpha})`);
    gradient.addColorStop(1, `hsla(${p.hue}, 95%, 68%, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function setupReveal() {
  const revealItems = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    observer.observe(item);
  });
}

function setupTimelineFocus() {
  const items = document.querySelectorAll(".timeline-item");
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle("is-active", entry.isIntersecting);
      });
    },
    { threshold: 0.58 }
  );

  items.forEach(item => observer.observe(item));
}

function setupHeaderState() {
  const header = document.querySelector(".site-header");
  const setState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  setState();
  window.addEventListener("scroll", setState, { passive: true });
}

function setupThemeToggle() {
  const toggle = document.querySelector(".theme-toggle");
  const label = toggle.querySelector(".toggle-text");

  const syncToggle = () => {
    const isLight = root.dataset.theme === "light";
    toggle.setAttribute("aria-pressed", String(isLight));
    toggle.setAttribute("aria-label", isLight ? "切换到深色主题" : "切换到浅色主题");
    label.textContent = isLight ? "深色" : "浅色";
  };

  toggle.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = nextTheme;
    try {
      localStorage.setItem("thermal-theme", nextTheme);
    } catch (error) {
      // Theme still switches even when local storage is unavailable.
    }
    syncToggle();

    if (reduceMotion) {
      drawStaticThermalField();
    }
  });

  syncToggle();
}

function handleResize() {
  resizeCanvas();
  if (reduceMotion) {
    drawStaticThermalField();
  }
}

window.addEventListener("resize", handleResize);
window.addEventListener("beforeunload", () => cancelAnimationFrame(animationFrame));

resizeCanvas();
if (reduceMotion) {
  drawStaticThermalField();
} else {
  drawThermalField();
}
setupReveal();
setupTimelineFocus();
setupHeaderState();
setupThemeToggle();
