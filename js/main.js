/* Shared behaviour: smooth scroll, cursor, nav, text splitting, scroll reveals */
(function () {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  if (!hasGsap || reduceMotion) root.classList.add("no-motion");
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (typeof window.Lenis !== "undefined" && !reduceMotion) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  // In-page anchors go through Lenis so they glide instead of jumping
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    document.body.classList.remove("nav-open");
    if (lenis) lenis.start();
    const offset = parseInt(a.dataset.offset || "0", 10);
    if (lenis) lenis.scrollTo(target, { offset: -offset, duration: 1.4 });
    else target.scrollIntoView({ behavior: "smooth" });
  });

  /* ---------- Nav: solid on scroll, hide on scroll down ---------- */
  const nav = document.querySelector(".nav");
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    if (nav) {
      nav.classList.toggle("is-scrolled", y > 40);
      const hide = y > lastY && y > 400 && !document.body.classList.contains("nav-open");
      nav.classList.toggle("is-hidden", hide && !nav.dataset.pinned);
    }
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const burger = document.querySelector(".burger");
  if (burger) {
    burger.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", String(open));
      if (lenis) open ? lenis.stop() : lenis.start();
    });
    document.querySelectorAll(".mobile-menu a").forEach((a) =>
      a.addEventListener("click", () => {
        document.body.classList.remove("nav-open");
        if (lenis) lenis.start();
      })
    );
  }

  /* ---------- Custom cursor ---------- */
  const cursor = document.querySelector(".cursor");
  const dot = document.querySelector(".cursor-dot");
  if (cursor && dot && window.matchMedia("(pointer: fine)").matches) {
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });
    const loop = () => {
      cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener("mouseover", (e) => {
      const view = e.target.closest("[data-cursor='view']");
      const link = e.target.closest("a, button, input");
      cursor.classList.toggle("is-view", !!view);
      cursor.classList.toggle("is-link", !view && !!link);
    });
  }

  /* ---------- Text splitting ---------- */
  function splitWords(el) {
    if (el.dataset.splitDone) return el.querySelectorAll(".wi");
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span"); w.className = "w";
            const wi = document.createElement("span"); wi.className = "wi"; wi.textContent = part;
            w.appendChild(wi); frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && !child.classList.contains("w")) {
          walk(child);
        }
      });
    };
    walk(el);
    el.classList.add("split");
    el.dataset.splitDone = "1";
    return el.querySelectorAll(".wi");
  }

  /* ---------- Generic reveals ---------- */
  function initReveals(scope = document) {
    if (!hasGsap || reduceMotion) return;

    scope.querySelectorAll("[data-split]").forEach((el) => {
      const words = splitWords(el);
      gsap.from(words, {
        yPercent: 110, rotate: 4, duration: 1.2, ease: "expo.out", stagger: 0.05,
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
    });

    scope.querySelectorAll(".fade-up").forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1.1, ease: "expo.out",
        delay: parseFloat(el.dataset.delay || 0),
        scrollTrigger: { trigger: el, start: "top 90%" },
      });
    });

    scope.querySelectorAll(".img-reveal").forEach((el) => {
      const img = el.querySelector("img");
      gsap.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, {
        clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut",
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
      if (img) gsap.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.8, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" } });
    });

    scope.querySelectorAll("[data-parallax]").forEach((el) => {
      const amt = parseFloat(el.dataset.parallax) || 10;
      gsap.fromTo(el, { yPercent: -amt }, {
        yPercent: amt, ease: "none",
        scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
      });
    });
  }

  window.SS = { lenis, hasGsap, reduceMotion, splitWords, initReveals };
})();
