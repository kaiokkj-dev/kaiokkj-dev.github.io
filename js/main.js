const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const hasGSAP = !!(window.gsap && window.ScrollTrigger && window.ScrollSmoother);
const animate = hasGSAP && !reduceMotion;

// Se a GSAP não carregou (ou o usuário pediu menos movimento), mostra tudo normalmente
if (!animate) document.documentElement.classList.remove("js-anim");

function refreshIcons() {
  if (window.lucide) lucide.createIcons();
}

/* =========================
ROLAGEM SUAVE (ScrollSmoother)
Mesma técnica da referência: o conteúdo desliza com inércia
e elementos com data-speed ganham um parallax leve.
========================= */
let smoother = null;
if (animate) {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.3,        // quanto maior, mais "macia" (a referência usa 1.5)
    effects: true,      // ativa data-speed
    smoothTouch: false  // no celular a rolagem nativa é melhor
  });
}

function scrollToTarget(target) {
  if (!target) return;
  if (smoother) smoother.scrollTo(target, true, "top 90px");
  else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
}

// Links internos (#projetos, #home...) passam pela rolagem suave
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href");
    const target = id.length > 1 ? document.querySelector(id) : null;
    if (!target) return;
    e.preventDefault();
    if (id === "#home" && smoother) smoother.scrollTo(0, true);
    else scrollToTarget(target);
  });
});

/* =========================
ANIMAÇÕES (ScrollTrigger)
Tocam ao entrar na tela e voltam ao rolar para cima.
========================= */
const replay = "play none none reverse";

function animateCard(card) {
  if (card.dataset.animated) return;
  card.dataset.animated = "1";

  const img = card.querySelector(".card-img");
  const title = card.querySelector("h3");
  const desc = card.querySelector("p");
  const tags = card.querySelectorAll(".tags span");
  const actions = card.querySelector(".actions");

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    scrollTrigger: { trigger: card, start: "top 85%", toggleActions: replay },
    onStart: () => card.classList.remove("is-ready"),
    onComplete: () => {
      gsap.set(img, { clearProps: "transform" });
      card.classList.add("is-ready");
    },
    onReverseComplete: () => card.classList.remove("is-ready")
  });

  tl.fromTo(card, { autoAlpha: 0, scale: 0.95, y: 30 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.4 })
    .fromTo(img, { autoAlpha: 0, scale: 0.95, y: 30 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.6 }, "-=0.4")
    .fromTo(title, { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: 0.4 }, "-=0.4")
    .fromTo(desc, { autoAlpha: 0, filter: "blur(5px)" }, { autoAlpha: 1, filter: "blur(0px)", duration: 0.5 }, "-=0.3");
  if (tags.length) {
    tl.fromTo(tags, { autoAlpha: 0, y: 20, scale: 0.8 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, stagger: 0.05, ease: "back.out(1.5)" }, "-=0.4");
  }
  tl.fromTo(actions, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "back.out(1.3)" }, "-=0.2");
}

if (animate) {
  // Topo: foto cresce e o texto entra da esquerda, em sequência
  gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.1 })
    .fromTo(".avatar-frame", { autoAlpha: 0, scale: 0.8, y: 30 }, { autoAlpha: 1, scale: 1, y: 0, duration: 1.2 })
    .fromTo(".hero-left > *", { autoAlpha: 0, x: -50 }, { autoAlpha: 1, x: 0, duration: 1, stagger: 0.1 }, "-=0.9");

  // Títulos das seções: entrada com leve giro e efeito elástico
  gsap.utils.toArray(".sobre h2, .projetos h2, .educacao h2").forEach(title => {
    gsap.fromTo(title, { autoAlpha: 0, x: -100, rotation: -5 }, {
      autoAlpha: 1, x: 0, rotation: 0, duration: 1, ease: "elastic.out(1, 0.75)",
      scrollTrigger: { trigger: title, start: "top 80%", toggleActions: replay }
    });
  });

  // Texto do Sobre sai do desfoque
  gsap.fromTo(".about-text", { autoAlpha: 0, y: 50, filter: "blur(10px)" }, {
    autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.2, ease: "power3.out",
    scrollTrigger: { trigger: ".about-text", start: "top 85%", toggleActions: replay }
  });

  // Carrossel de tecnologias gira para frente
  gsap.fromTo(".tech-surface", { autoAlpha: 0, scale: 0.5, rotateY: 90 }, {
    autoAlpha: 1, scale: 1, rotateY: 0, duration: 1.5, ease: "back.out(1.7)",
    scrollTrigger: { trigger: ".tech-surface", start: "top 90%", toggleActions: replay }
  });

  // Cards de projeto montam peça por peça
  document.querySelectorAll(".card").forEach(card => {
    if (getComputedStyle(card).display !== "none") animateCard(card);
  });

  // Formação: um card de cada vez
  gsap.utils.toArray(".edu-card").forEach(card => {
    gsap.fromTo(card, { autoAlpha: 0, y: 30, scale: 0.95 }, {
      autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out",
      scrollTrigger: { trigger: card, start: "top 88%", toggleActions: replay }
    });
  });

  // Divisórias se desenham da esquerda para a direita
  gsap.utils.toArray(".section-divider").forEach(hr => {
    gsap.fromTo(hr, { scaleX: 0 }, {
      scaleX: 1, duration: 1.2, ease: "power3.out",
      scrollTrigger: { trigger: hr, start: "top 90%", toggleActions: replay }
    });
  });

  // Contato: o bloco sobe e o conteúdo entra em sequência
  const contact = gsap.timeline({
    defaults: { ease: "power3.out" },
    scrollTrigger: { trigger: ".contact-card", start: "top 85%", toggleActions: replay }
  });
  contact
    .fromTo(".contact-card", { autoAlpha: 0, y: 40, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7 })
    .fromTo(".contact-copy > *", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 }, "-=0.4")
    .fromTo(".contact-btn", { autoAlpha: 0, x: 20 }, { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.4)" }, "-=0.3");

  // Pontinho de "disponível" pulsando devagar
  gsap.to(".contact-status, .badge-available .dot", {
    scale: 1.35, duration: 1.1, repeat: -1, yoyo: true, ease: "power1.inOut"
  });
}

/* =========================
"LER MAIS" NAS DESCRIÇÕES
========================= */
function setupReadMore(card) {
  const desc = card.querySelector(":scope > p");
  if (!desc || card.querySelector(".read-more")) return;
  desc.classList.add("is-clamped");
  if (desc.scrollHeight <= desc.clientHeight + 2) {
    desc.classList.remove("is-clamped");
    return;
  }
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "read-more";
  btn.textContent = "Ler mais";
  btn.setAttribute("aria-expanded", "false");
  desc.after(btn);

  btn.addEventListener("click", () => {
    const open = desc.classList.toggle("is-clamped") === false;
    btn.textContent = open ? "Ler menos" : "Ler mais";
    btn.setAttribute("aria-expanded", String(open));
    if (animate) {
      gsap.fromTo(desc, { autoAlpha: 0.6, y: -5 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  });
}
document.querySelectorAll(".card").forEach(card => {
  if (getComputedStyle(card).display !== "none") setupReadMore(card);
});

/* =========================
NAV ATIVA + BARRA DE PROGRESSO
========================= */
const navLinks = document.querySelectorAll(".nav-pill a[href^='#']");
const progressBar = document.querySelector(".scroll-progress");

function setActive(id) {
  navLinks.forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
  });
}

if (animate) {
  // A seção que cruza o meio da tela é a ativa
  document.querySelectorAll("section[id]").forEach(section => {
    ScrollTrigger.create({
      trigger: section,
      start: "top 55%",
      end: "bottom 55%",
      onToggle: (self) => { if (self.isActive) setActive(section.id); }
    });
  });
  if (progressBar) {
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => progressBar.style.setProperty("--progress", self.progress)
    });
  }
} else {
  let scrollTicking = false;
  const onScroll = () => {
    let current = "";
    document.querySelectorAll("section[id]").forEach(section => {
      if (section.getBoundingClientRect().top <= innerHeight * 0.55) current = section.id;
    });
    setActive(current);
    if (progressBar) {
      const max = document.documentElement.scrollHeight - innerHeight;
      progressBar.style.setProperty("--progress", max > 0 ? Math.min(1, scrollY / max) : 0);
    }
    scrollTicking = false;
  };
  window.addEventListener("scroll", () => {
    if (!scrollTicking) { requestAnimationFrame(onScroll); scrollTicking = true; }
  }, { passive: true });
  onScroll();
}

/* =========================
BRILHO DO GRID SEGUINDO O CURSOR
========================= */
const glow = document.querySelector(".cursor-glow");
if (glow && finePointer && !reduceMotion) {
  let mx = 0, my = 0, glowTicking = false;
  window.addEventListener("pointermove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    document.body.classList.add("pointer-active");
    if (!glowTicking) {
      requestAnimationFrame(() => {
        glow.style.setProperty("--mx", `${mx}px`);
        glow.style.setProperty("--my", `${my}px`);
        glowTicking = false;
      });
      glowTicking = true;
    }
  }, { passive: true });
  document.addEventListener("pointerleave", () => document.body.classList.remove("pointer-active"));
}

/* =========================
CARDS: LUZ NA BORDA
========================= */
if (finePointer) {
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--cx", `${e.clientX - r.left}px`);
      card.style.setProperty("--cy", `${e.clientY - r.top}px`);
    });
  });
}

/* =========================
CARGO DIGITADO
========================= */
const typed = document.querySelector(".typed");
if (typed && !reduceMotion) {
  let words = [];
  try { words = JSON.parse(typed.dataset.words || "[]"); } catch (e) { words = []; }

  if (words.length > 1) {
    let w = 0;
    let c = words[0].length;
    let deleting = true;
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    (async function loop() {
      await sleep(3000);
      while (true) {
        const word = words[w];
        if (deleting) {
          c--;
          typed.textContent = word.slice(0, c);
          if (c === 0) {
            deleting = false;
            w = (w + 1) % words.length;
            await sleep(350);
          } else {
            await sleep(32);
          }
        } else {
          const next = words[w];
          c++;
          typed.textContent = next.slice(0, c);
          if (c === next.length) {
            deleting = true;
            await sleep(2400);
          } else {
            await sleep(55 + Math.random() * 45);
          }
        }
      }
    })();
  }
}

/* =========================
TEMA
========================= */
const themeBtn = document.getElementById("theme-toggle");

function readTheme() {
  try { return localStorage.getItem("theme"); } catch (e) { return null; }
}
function saveTheme(theme) {
  try { localStorage.setItem("theme", theme); } catch (e) { /* sem armazenamento */ }
}
function updateThemeIcon(theme) {
  if (!themeBtn) return;
  themeBtn.innerHTML = `<i data-lucide="${theme === "dark" ? "sun" : "moon"}"></i>`;
  refreshIcons();
}
function applyTheme(theme) {
  document.body.classList.remove("dark", "light");
  document.body.classList.add(theme);
  saveTheme(theme);
  updateThemeIcon(theme);
}
applyTheme(readTheme() || "dark");

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    applyTheme(document.body.classList.contains("dark") ? "light" : "dark");
  });
}

/* =========================
MOSTRAR MAIS PROJETOS
========================= */
const btnMostrar = document.getElementById("mostrarMais");
const projetosEscondidos = document.querySelectorAll(".hidden-project");
let aberto = false;

if (btnMostrar) {
  btnMostrar.addEventListener("click", () => {
    aberto = !aberto;
    projetosEscondidos.forEach(projeto => {
      projeto.style.display = aberto ? "flex" : "none";
      if (aberto) {
        setupReadMore(projeto);
        if (animate) animateCard(projeto);
      }
    });
    btnMostrar.textContent = aberto ? "Mostrar menos" : "Mostrar mais projetos";
    btnMostrar.setAttribute("aria-expanded", String(aberto));

    if (animate) requestAnimationFrame(() => ScrollTrigger.refresh());
    if (!aberto) scrollToTarget(document.getElementById("projetos"));
  });
}

/* =========================
COPIAR E-MAIL
========================= */
const copyBtn = document.querySelector(".copy-email");
if (copyBtn) {
  const label = copyBtn.querySelector(".copy-email-text");
  const email = copyBtn.dataset.email;
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
      label.textContent = "E-mail copiado!";
    } catch (e) {
      window.location.href = `mailto:${email}`;
      return;
    }
    copyBtn.classList.add("is-copied");
    setTimeout(() => {
      label.textContent = email;
      copyBtn.classList.remove("is-copied");
    }, 1800);
  });
}
