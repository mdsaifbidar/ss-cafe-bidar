/* Menu page: data (transcribed from the café's printed menu), rendering, scroll-spy tabs, live search */
(function () {
  const img = (id, w = 1100) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

  // sig: house signature (also featured on the home page)
  const MENU = [
    {
      id: "fresh-fruit-juice", title: "Fresh Fruit Juice", img: img("1613478223719-2ab802602423"),
      desc: "Everyday fruit, pressed to order. Light, bright and the easiest way to start.",
      items: [
        ["Banana", 50], ["Papaya", 50], ["Mosambi", 50], ["Pineapple", 60],
        ["Ganga Jamuna", 70, "Mosambi & orange"], ["Orange", 70], ["Apple", 70], ["Grapes", 80],
        ["Chikoo / Sapota", 70], ["Watermelon", 70], ["Muskmelon", 70], ["Mix Juice", 70], ["Anar", 100, "Pomegranate"],
      ],
    },
    {
      id: "season-juices", title: "Season Juices", img: img("1619566636858-adf3ef46400b"), tag: "Only in season",
      desc: "Arrives with the harvest, leaves with it. Ask what's in today.",
      items: [
        ["Anjeer", 110, "Fig"], ["Kiwi", 110], ["Dragon Fruit", 110], ["Avocado", 130, "Butter fruit"],
        ["Sitaphal", 130, "Custard apple"], ["Strawberry", 130], ["Mango", 130], ["Jamun", 130],
      ],
    },
    {
      id: "dryfruit-juices", title: "Dryfruit Juices", img: img("1550583724-b2692b85b150"),
      desc: "Rich, nutty and filling. Cashew, almond and fig blended thick.",
      items: [
        ["Anjeer Badam", 210], ["Kaju Badam", 200], ["Kaju Shake", 200], ["Kaju Anjeer", 210],
        ["Mix Dryfruit Juice", 230], ["Mix Dryfruit Punch", 280, null, true],
      ],
    },
    {
      id: "scoop-ice-cream", title: "Scoop Ice Cream", img: img("1497034825429-c343d7c6a68f"),
      desc: "Classic scoops, served cold and simple.",
      items: [["Vanilla", 80], ["Strawberry", 80], ["Butterscotch", 80], ["Chocolate", 100], ["Black Currant", 100]],
    },
    {
      id: "ice-cream-shakes", title: "Ice Cream Shakes", img: img("1572490122747-3968b75cc699"),
      desc: "Thick, cold, blended with ice cream. Dessert you can drink.",
      items: [
        ["Vanilla", 110], ["Oreo", 130, null, true], ["Kitkat", 110], ["Chocolate", 110], ["Cold Coffee", 100],
        ["Blackcurrant", 110], ["Butterscotch", 110], ["Choco Banana", 130, null, true], ["Boost Banana", 130],
        ["Banana with Dryfruit", 100], ["Cold Boost", 100],
      ],
    },
    {
      id: "juice-with-ice-cream", title: "Juice with Ice Cream", img: img("1623065422902-30a2d299bbe4"),
      desc: "Our punches: fresh fruit juice topped with a scoop of ice cream.",
      items: [
        ["Papaya Punch", 100], ["Banana Punch", 100], ["Pineapple Punch", 110], ["Mix Fruit Punch", 120],
        ["Chikoo Punch", 120], ["Muskmelon Punch", 120], ["Anjeer Punch", 160], ["Dragon Punch", 180],
        ["Sitaphal Punch", 160], ["Strawberry Punch", 180, null, true], ["Mango Punch", 180, null, true], ["Avocado Punch", 180, null, true],
      ],
    },
    {
      id: "vegetable-juices", title: "Vegetable Juices", img: img("1560508180-03f285f67ded"),
      desc: "Earthy, clean and good for you.",
      items: [["Carrot", 90], ["Beetroot", 90], ["Carrot Beetroot", 110], ["ABC", 120, "Apple · Carrot · Beetroot"]],
    },
    {
      id: "mocktails", title: "Mocktails", img: img("1595981267035-7b04ca84a82d"),
      desc: "Fizzy, colourful and made to be photographed.",
      items: [["Blueberry", 110], ["Watermelon", 100, null, true], ["Blue Ice", 100]],
    },
  ];

  const { hasGsap, reduceMotion, initReveals, lenis } = window.SS;
  const animate = hasGsap && !reduceMotion;
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- Render ---------- */
  const tabs = document.querySelector(".m-tabs");
  const body = document.getElementById("menu-body");

  tabs.innerHTML = MENU.map((c) => `<a class="m-tab" href="#${c.id}" data-offset="0" data-tab="${c.id}">${c.title}</a>`).join("");

  body.innerHTML = MENU.map((c, ci) => `
    <section class="m-cat" id="${c.id}">
      <div class="container m-cat__grid">
        <div class="m-cat__aside">
          <div class="m-cat__img img-reveal">
            <img src="${c.img}" alt="${esc(c.title)}" loading="${ci < 2 ? "eager" : "lazy"}" data-parallax="6" />
            ${c.tag ? `<span class="m-cat__tag">${c.tag}</span>` : ""}
          </div>
        </div>
        <div>
          <div class="m-cat__num">${String(ci + 1).padStart(2, "0")} / ${String(MENU.length).padStart(2, "0")}</div>
          <h2 class="m-cat__title" data-split>${c.title}</h2>
          <p class="m-cat__desc fade-up">${c.desc}</p>
          <ul class="m-list">
            ${c.items.map(([name, price, note, sig]) => `
              <li class="m-item fade-up" data-name="${esc(name.toLowerCase())}" data-note="${esc((note || "").toLowerCase())}">
                <span class="m-item__name"><span class="nm">${esc(name)}</span></span>
                <span class="m-item__price"><span>₹</span>${price}</span>
                ${note || sig ? `<span class="m-item__note">${sig ? '<b class="accent">★ House signature</b>' : ""}${sig && note ? " · " : ""}${note ? esc(note) : ""}</span>` : ""}
              </li>`).join("")}
          </ul>
        </div>
      </div>
    </section>`).join("");

  const total = MENU.reduce((n, c) => n + c.items.length, 0);
  document.querySelectorAll("[data-total]").forEach((el) => (el.textContent = total));
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Hero intro ---------- */
  if (animate) {
    const titleWords = window.SS.splitWords(document.querySelector(".m-hero__title"));
    gsap.timeline()
      .from(".m-hero__media img", { scale: 1.4, duration: 2.2, ease: "expo.out" }, 0)
      .from(titleWords, { yPercent: 120, duration: 1.4, ease: "expo.out", stagger: 0.08 }, 0.1)
      .from(".m-hero .hero-anim", { y: 30, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.08 }, 0.5);
  }

  /* ---------- Scroll-spy for the tab bar ---------- */
  const setActive = (id) => {
    tabs.querySelectorAll(".m-tab").forEach((t) => {
      const on = t.dataset.tab === id;
      t.classList.toggle("is-active", on);
      if (on) tabs.scrollTo({ left: t.offsetLeft - tabs.clientWidth / 2 + t.clientWidth / 2, behavior: "smooth" });
    });
  };
  if (hasGsap) {
    MENU.forEach((c) => {
      ScrollTrigger.create({
        trigger: "#" + c.id, start: "top 50%", end: "bottom 50%",
        onToggle: (self) => self.isActive && setActive(c.id),
      });
    });
  } else {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-50% 0px -50% 0px" });
    MENU.forEach((c) => io.observe(document.getElementById(c.id)));
  }

  // Keep the big nav out of the way while browsing the list; the tab bar takes over
  const nav = document.querySelector(".nav");
  const bar = document.querySelector(".m-bar");
  const syncBar = () => bar.classList.toggle("under-nav", !nav.classList.contains("is-hidden") && bar.getBoundingClientRect().top <= 80);
  window.addEventListener("scroll", syncBar, { passive: true });

  /* ---------- Live search ---------- */
  const input = document.getElementById("m-search");
  const empty = document.querySelector(".m-empty");
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    document.querySelectorAll(".m-cat").forEach((cat) => {
      let catShown = 0;
      cat.querySelectorAll(".m-item").forEach((it) => {
        const nm = it.querySelector(".nm");
        const label = nm.textContent;
        const hit = !q || it.dataset.name.includes(q) || it.dataset.note.includes(q) || cat.id.replace(/-/g, " ").includes(q);
        it.style.display = hit ? "" : "none";
        if (hit) {
          catShown++;
          const i = q ? label.toLowerCase().indexOf(q) : -1;
          nm.innerHTML = i >= 0 ? esc(label.slice(0, i)) + "<mark>" + esc(label.slice(i, i + q.length)) + "</mark>" + esc(label.slice(i + q.length)) : esc(label);
          // ensure items revealed by scroll are visible when filtered in
          it.style.opacity = 1; it.style.transform = "none";
        }
      });
      cat.style.display = catShown ? "" : "none";
      shown += catShown;
    });
    empty.classList.toggle("is-on", shown === 0);
    if (hasGsap) ScrollTrigger.refresh();
  });

  /* ---------- Reveals + deep links (menu.html#mocktails) ---------- */
  initReveals();

  window.addEventListener("load", () => {
    if (hasGsap) ScrollTrigger.refresh();
    const target = location.hash && document.querySelector(location.hash);
    if (target) {
      setTimeout(() => {
        if (lenis) lenis.scrollTo(target, { immediate: false, duration: 1.6 });
        else target.scrollIntoView();
      }, 300);
    }
  });
})();
