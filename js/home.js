/* Home page: preloader, hero intro, manifesto scrub, horizontal signatures, counters, season hover, lightbox */
(function () {
  const { hasGsap, reduceMotion, splitWords, initReveals, lenis } = window.SS;
  const animate = hasGsap && !reduceMotion;
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Preloader → hero intro ---------- */
  const pre = document.querySelector(".preloader");
  const heroLines = document.querySelectorAll("[data-hero]");
  const heroBits = document.querySelectorAll(".hero-anim");

  function heroIntro() {
    if (!animate) return;
    const words = [];
    heroLines.forEach((l) => words.push(...splitWords(l)));
    gsap.timeline()
      .from(".hero__media img", { scale: 1.5, duration: 2.4, ease: "expo.out", clearProps: "transform" }, 0)
      .from(words, { yPercent: 120, rotate: 6, duration: 1.4, ease: "expo.out", stagger: 0.08 }, 0.15)
      .from(heroBits, { y: 30, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.08 }, 0.6)
      // opacity only: the nav's transform belongs to the CSS hide-on-scroll transition
      .from(".nav", { opacity: 0, duration: 1, ease: "power2.out" }, 0.8);
  }

  if (!animate || sessionStorage.getItem("ss-loaded")) {
    pre.remove();
    heroIntro();
  } else {
    if (lenis) lenis.stop();
    const counter = { v: 0 };
    const countEl = pre.querySelector(".preloader__count");
    gsap.set(".preloader__word span", { yPercent: 110 });
    gsap.timeline({
      onComplete() {
        pre.remove();
        sessionStorage.setItem("ss-loaded", "1");
        if (lenis) lenis.start();
      },
    })
      .to(".preloader__word span", { yPercent: -110, duration: 1, ease: "expo.out", stagger: 0.06 }, 0)
      .to(counter, { v: 100, duration: 1.6, ease: "power2.inOut", onUpdate: () => (countEl.textContent = Math.round(counter.v)) }, 0)
      .to(".preloader__bar", { width: "100%", duration: 1.6, ease: "power2.inOut" }, 0)
      .to(".preloader__word span", { yPercent: -220, duration: 0.7, ease: "expo.in", stagger: 0.03 }, 1.6)
      .to(pre, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut" }, 2.0)
      .add(heroIntro, 2.2);
  }

  /* ---------- Manifesto: words light up as you scroll ---------- */
  const manifesto = document.getElementById("manifesto");
  if (manifesto && animate) {
    manifesto.innerHTML = manifesto.textContent.trim().split(/\s+/).map((w) => `<span class="mw">${w}</span>`).join(" ");
    gsap.to(manifesto.querySelectorAll(".mw"), {
      opacity: 1, stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: manifesto, start: "top 80%", end: "bottom 45%", scrub: true },
    });
  }

  /* ---------- Count-up numbers ---------- */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const end = parseInt(el.dataset.count, 10);
    if (!animate) { el.textContent = end; return; }
    const o = { v: 0 };
    gsap.to(o, {
      v: end, duration: 2, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%" },
      onUpdate: () => (el.textContent = Math.round(o.v)),
    });
  });

  /* ---------- Signatures: pinned horizontal scroll (desktop) ---------- */
  if (animate) {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", () => {
      const track = document.querySelector(".h-track");
      const distance = () => track.scrollWidth - window.innerWidth;
      const tween = gsap.to(track, {
        x: () => -distance(), ease: "none",
        scrollTrigger: {
          trigger: ".signatures", start: "top top", end: () => "+=" + distance(),
          pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        },
      });
      // gentle inner parallax on each card image while it travels
      gsap.utils.toArray(".sig-card__media img").forEach((img) => {
        gsap.fromTo(img, { xPercent: -8 }, {
          xPercent: 8, ease: "none",
          scrollTrigger: { trigger: img.closest(".sig-card"), containerAnimation: tween, start: "left right", end: "right left", scrub: true },
        });
      });
    });
  }

  /* ---------- Season list: cursor-following image ---------- */
  const float = document.querySelector(".season-float");
  if (float && window.matchMedia("(pointer: fine)").matches) {
    const imgs = float.querySelectorAll("img");
    let x = 0, y = 0, fx = 0, fy = 0, raf = null;
    const follow = () => {
      fx += (x - fx) * 0.14; fy += (y - fy) * 0.14;
      float.style.left = fx + "px"; float.style.top = fy + "px";
      raf = requestAnimationFrame(follow);
    };
    document.querySelectorAll(".season-row").forEach((row) => {
      row.addEventListener("mouseenter", (e) => {
        imgs.forEach((im, i) => im.classList.toggle("is-on", i === +row.dataset.img));
        if (!float.classList.contains("is-on")) { fx = e.clientX; fy = e.clientY; }
        float.classList.add("is-on");
        if (!raf) follow();
      });
      row.addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; });
    });
    document.querySelector(".season-list").addEventListener("mouseleave", () => {
      float.classList.remove("is-on");
      cancelAnimationFrame(raf); raf = null;
    });
  }

  /* ---------- Gallery lightbox ---------- */
  const items = [...document.querySelectorAll(".g-item img")];
  const box = document.querySelector(".lightbox");
  const boxImg = box.querySelector("img");
  let idx = 0;
  const show = (i) => {
    idx = (i + items.length) % items.length;
    boxImg.src = items[idx].src.replace(/w=\d+/, "w=1800").replace(/&h=\d+/, "");
    boxImg.alt = items[idx].alt;
  };
  const open = (i) => { show(i); box.classList.add("is-open"); if (lenis) lenis.stop(); };
  const close = () => { box.classList.remove("is-open"); if (lenis) lenis.start(); };
  items.forEach((img, i) => img.parentElement.addEventListener("click", () => open(i)));
  box.querySelector(".lightbox__close").addEventListener("click", close);
  box.querySelector(".lightbox__prev").addEventListener("click", (e) => { e.stopPropagation(); show(idx - 1); });
  box.querySelector(".lightbox__next").addEventListener("click", (e) => { e.stopPropagation(); show(idx + 1); });
  box.addEventListener("click", (e) => { if (e.target === box) close(); });
  document.addEventListener("keydown", (e) => {
    if (!box.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });

  /* ---------- Shared reveals ---------- */
  initReveals();
  window.addEventListener("load", () => hasGsap && ScrollTrigger.refresh());
})();
