(() => {
  "use strict";

  const page = document.documentElement;
  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".main-nav");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionButton = document.querySelector(".motion-toggle");
  const cursor = document.querySelector(".image-cursor");
  const cursorLabel = cursor.querySelector("span");
  const scenes = [...document.querySelectorAll("[data-scroll-image]")].map((section) => ({
    section,
    stage: section.querySelector(".image-stage"),
    frame: section.querySelector(".scroll-frame"),
    caption: section.querySelector(".stage-caption"),
    hint: section.querySelector(".stage-hint"),
  }));
  const chapters = [
    ["pink", "01 / DA ETEC À BENTOTEC", "Uma ideia para cuidar.", "TCC do técnico na ETEC Bento Quirino, apresentado na BENTOTEC: apoio a pessoas com ansiedade, depressão e problemas cardíacos."],
    ["blue", "02 / DART + FLUTTER + IA", "Escutar os sinais.", "Batimentos e temperatura do relógio reunidos no aplicativo para sinalizar possíveis crises e alterações cardíacas, com um assistente de IA."],
    ["purple", "03 / UMA REDE DE APOIO", "Um minuto faz diferença.", "O fluxo proposto acionaria familiares após um minuto sem desligar o alarme. Sem resposta deles, entrariam os hospitais parceiros."],
    ["yellow", "04 / CONCEITOS EM DESENVOLVIMENTO", "O cuidado continua.", "Relógio em Arduino, colete com aquecimento, apoio à postura, respiração e estímulos elétricos leves. Nos planos: terapia online com parceiros voluntários."]
  ];
  const sequence = document.querySelector(".project-sequence");
  const chapterButtons = [...document.querySelectorAll("[data-chapter]")];
  const chapterCopy = document.querySelector(".pulse-copy");
  let currentChapter = -1;
  let scrollChapter = -1;
  function showChapter(index) {
    if (index === currentChapter) return;
    currentChapter = index;
    const [color, label, title, copy] = chapters[index];
    sequence.dataset.color = color;
    chapterCopy.querySelector("span").textContent = label;
    chapterCopy.querySelector("h4").textContent = title;
    chapterCopy.querySelector("p").textContent = copy;
    chapterButtons.forEach((button, i) => {
      button.classList.toggle("is-current", i === index);
      button.setAttribute("aria-pressed", String(i === index));
    });
    if (motionEnabled()) chapterCopy.animate([{opacity: 0, transform: "translateY(12px)"}, {opacity: 1, transform: "translateY(0)"}], {duration: 700, easing: "ease-out"});
  }
  chapterButtons.forEach((button, i) => button.addEventListener("click", () => showChapter(i)));
  const pointer = { x: 0, y: 0, known: false };
  let motionOverride = null;
  let frameRequest = 0;
  let activeTitle = null;
  const motionEnabled = () => motionOverride ?? !reducedMotion.matches;
  const clamp = (value) => Math.max(0, Math.min(1, value));

  function closeMenu(focus = false) {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menu");
    menu.classList.remove("is-open");
    if (focus) menuButton.focus();
  }

  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    menu.classList.toggle("is-open", open);
  });
  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu()));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu(menu.classList.contains("is-open"));
  });
  document.getElementById("year").textContent = new Date().getFullYear();

  function resetTitle() {
    activeTitle?.querySelectorAll(".interactive-letter").forEach((letter) => {
      letter.style.removeProperty("transform");
      letter.classList.remove("is-near");
    });
    activeTitle = null;
  }

  function prepareTitle(title) {
    const accessibleCopy = title.cloneNode(true);
    accessibleCopy.querySelectorAll("br").forEach((line) => line.replaceWith(" "));
    title.setAttribute("aria-label", accessibleCopy.textContent.replace(/\s+/g, " ").trim());
    const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let index = 0;

    nodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part.trim()) return fragment.append(document.createTextNode(part));
        const word = document.createElement("span");
        word.className = "letter-word";
        word.setAttribute("aria-hidden", "true");
        word.style.setProperty("--word-delay", `${index * 30 + 1700}ms`);
        [...part].forEach((character) => {
          const entry = document.createElement("span");
          const letter = document.createElement("span");
          entry.className = "letter-entry";
          entry.style.setProperty("--letter-delay", `${Math.min(index++, 48) * 24}ms`);
          letter.className = "interactive-letter";
          letter.textContent = character;
          entry.append(letter);
          word.append(entry);
        });
        fragment.append(word);
      });
      node.replaceWith(fragment);
    });

    const letters = [...title.querySelectorAll(".interactive-letter")];
    let pending = false;
    let point = { x: 0, y: 0 };
    title.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch" || !motionEnabled()) return;
      activeTitle = title;
      point = { x: event.clientX, y: event.clientY };
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        if (activeTitle !== title) return;
        const positions = letters.map((letter) => ({ letter, box: letter.getBoundingClientRect() }));
        positions.forEach(({ letter, box }) => {
          const dx = box.left + box.width / 2 - point.x;
          const dy = box.top + box.height / 2 - point.y;
          const influence = clamp(1 - Math.hypot(dx, dy) / 110);
          letter.style.transform = `translateY(${-influence * 10}px) rotate(${dx / 110 * influence * 7}deg)`;
          letter.classList.toggle("is-near", influence > 0.25);
        });
      });
    });
    title.addEventListener("pointerleave", resetTitle);
  }

  document.querySelectorAll("[data-interactive-title]").forEach(prepareTitle);
  const revealElements = [...document.querySelectorAll(".reveal")];
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
        else if (entry.target.hasAttribute("data-interactive-title") &&
          (entry.boundingClientRect.bottom <= 0 || entry.boundingClientRect.top >= window.innerHeight)) {
          entry.target.classList.remove("is-visible");
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  function updateCursor(target) {
    const host = pointer.known && target?.closest?.("[data-image-cursor]");
    cursor.classList.toggle("is-active", Boolean(host));
    if (!host) return;
    page.classList.add("custom-cursor-ready");
    cursorLabel.textContent = host.dataset.cursorLabel || "ROLE ↓";
    cursor.style.transform = `translate3d(${pointer.x - 43}px, ${pointer.y - 43}px, 0)`;
  }

  document.addEventListener("pointermove", (event) => {
    pointer.known = event.pointerType !== "touch";
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    updateCursor(event.target);
  }, { passive: true });
  function hideCursor() {
    pointer.known = false;
    cursor.classList.remove("is-active");
    resetTitle();
  }
  page.addEventListener("pointerleave", hideCursor);
  window.addEventListener("blur", hideCursor);

  // A imagem acompanha a rolagem nativa e chega a 100% da tela.
  function render() {
    frameRequest = 0;
    const enabled = motionEnabled();
    const narrow = window.innerWidth <= 560;
    const measurements = scenes.map((scene) => {
      const box = scene.section.getBoundingClientRect();
      const distance = Math.max(1, box.height - scene.stage.offsetHeight);
      const progress = clamp(-box.top / (distance * 0.8));
      const chapter = Math.min(3, Math.floor(clamp(-box.top / distance) * 4));
      if (chapter !== scrollChapter) { scrollChapter = chapter; showChapter(chapter); }
      const growth = clamp(progress * 2.5);
      return { scene, progress: growth * growth * (3 - 2 * growth) };
    });
    measurements.forEach(({ scene, progress }) => {
      const p = enabled ? progress : 1;
      const startWidth = narrow ? 82 : 58;
      scene.frame.style.width = `${startWidth + (100 - startWidth) * p}%`;
      scene.frame.style.height = `${58 + 42 * p}%`;
      scene.caption.style.opacity = String(0.3 + p * 0.7);
      scene.caption.style.transform = `translateY(${(1 - p) * 28}px)`;
      scene.hint.style.opacity = String(1 - p);
    });
    if (pointer.known) updateCursor(document.elementFromPoint(pointer.x, pointer.y));
  }
  function scheduleRender() {
    if (!frameRequest) frameRequest = requestAnimationFrame(render);
  }
  function syncMotion() {
    const enabled = motionEnabled();
    page.dataset.motion = enabled ? "full" : "reduced";
    page.classList.toggle("js-motion", enabled);
    page.classList.toggle("scroll-motion", enabled);
    motionButton.hidden = !reducedMotion.matches;
    motionButton.textContent = enabled ? "Reduzir animações" : "Ativar animações";
    motionButton.setAttribute("aria-pressed", String(enabled));
    resetTitle();
    scheduleRender();
  }
  motionButton.addEventListener("click", () => {
    motionOverride = !motionEnabled();
    syncMotion();
  });
  reducedMotion.addEventListener("change", syncMotion);
  document.addEventListener("scroll", () => { resetTitle(); scheduleRender(); }, { capture: true, passive: true });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
    scheduleRender();
  });
  window.addEventListener("pageshow", scheduleRender);
  document.querySelectorAll(".scroll-image").forEach((image) => image.addEventListener("load", scheduleRender));
  syncMotion();
})();
