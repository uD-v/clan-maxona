const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxZoPBSz0igOvGsbMEL05qxn3c5_IdHyJQSMoltjifZlu1MClyO0hjfL9DDwKUiYaDA/exec";

const SELECTORS = {
  faqItem: ".faq-item",
  faqBtn: ".faq-btn",
  header: "header",
  hero: ".hero-section",
  ctaForm: ".cta-form",
  loader: ".loader",
  ctaSection: "#cta",
  lessonsHero: ".lesson-hero-section",
  join: "#join",
  menuBtn: ".menu-btn",
};

//UTILS
const getLessonsPath = () => window.location.pathname.includes("/pages/") ? "lessons.html" : "pages/lessons.html";
const getRemInPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));


//INITIALIZATION AT TOP
const handleInitialLoader = async () => {
    const transitionData = sessionStorage.getItem("isTransitioning");
    if (transitionData) {
        let startTime = parseInt(transitionData, 10);
        if (isNaN(startTime)) startTime = Date.now();

        const loader = document.querySelector(SELECTORS.loader);
        if (loader) {
            loader.style.transition = 'none';
            loader.classList.add("visible");
            
            const defaultContainer = loader.querySelector(".default");
            const loaderText = defaultContainer?.querySelector(".loader-text");
            if (defaultContainer && loaderText) {
                loaderText.textContent = "CLAN MAXONA";
                defaultContainer.classList.add("visible");
            }

            await Promise.all(
                Array.from(document.images)
                    .filter(img => !img.complete)
                    .map(img => new Promise(resolve => {
                        img.onload = img.onerror = resolve;
                    }))
            );

            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 1000 - elapsed);
            await sleep(remaining);

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    loader.style.transition = 'opacity 0.5s';
                    loader.classList.remove("visible");
                    
                    setTimeout(() => {
                       sessionStorage.removeItem("isTransitioning");
                    }, 500);
                });
            });
        }
    }
}
handleInitialLoader();


//COMPONENTS

const initMobileMenu = () => {
  const header = document.querySelector(SELECTORS.header);
  const menuBtn = document.querySelector(SELECTORS.menuBtn);
  if (!menuBtn || !header) return;

  menuBtn.addEventListener("click", () => {
    header.classList.toggle("open");
  });
};

const initFAQ = () => {
  const setHeight = (item, isOpen) => {
    const container = item.querySelector(".faq-answer-container");
    if (container) {
      container.style.maxHeight = isOpen ? `${container.scrollHeight}px` : "0px";
    }
  };

  document.querySelectorAll(`${SELECTORS.faqItem}.active`).forEach((item) => setHeight(item, true));

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(SELECTORS.faqBtn);
    if (!btn) return;

    const currentItem = btn.closest(SELECTORS.faqItem);
    const isOpen = currentItem.classList.contains("active");

    document.querySelectorAll(SELECTORS.faqItem).forEach((item) => {
      if (item !== currentItem) {
        item.classList.remove("active");
        setHeight(item, false);
      }
    });

    currentItem.classList.toggle("active", !isOpen);
    setHeight(currentItem, !isOpen);
  });
};

const initObservers = () => {
  const header = document.querySelector(SELECTORS.header);
  const hero = document.querySelector(SELECTORS.hero) || document.querySelector(SELECTORS.lessonsHero);
  const ctaBtn = header?.querySelector("#btn--cta");
  const ctaTarget = document.querySelector(SELECTORS.ctaSection) || document.querySelector(SELECTORS.join);

  if (!header || !hero) return;

  const headerObs = new IntersectionObserver(
    ([entry]) => {
      header.classList.toggle("sticky", !entry.isIntersecting);
    },
    { threshold: 0, rootMargin: `-${getRemInPx() * 8}px` },
  );

  headerObs.observe(hero);

  if (ctaBtn && ctaTarget) {
    const btnObs = new IntersectionObserver(
      ([entry]) => {
        ctaBtn.classList.toggle("in-range", entry.isIntersecting);
      },
      { threshold: 0 },
    );
    btnObs.observe(ctaTarget);
  }
};

const initSmoothScrollAndTransition = () => {
  document.addEventListener("click", async (e) => {
    const link = e.target.closest("a:link");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href) return;

    if (href.startsWith("#")) {
      e.preventDefault();
      const section = href === "#" ? document.body : document.querySelector(href);

      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
        document.querySelector(SELECTORS.header)?.classList.remove("open");
      }
      return;
    }

    const targetUrl = new URL(link.href, window.location.href);
    if (targetUrl.origin === window.location.origin && !link.hasAttribute("download") && link.target !== "_blank") {
      if (targetUrl.pathname === window.location.pathname && targetUrl.hash) {
         return; 
      }

      e.preventDefault();
      const loader = document.querySelector(SELECTORS.loader);
      
      if (loader) {
        loader.querySelectorAll(".success, .fail, .btn--close").forEach(el => {
          if (el.classList.contains('visible') || el.style.opacity === "1") {
            el.classList.remove("visible");
            if (el.style) el.style.opacity = "0";
            if (el.style) el.style.display = "none";
          }
        });
        
        const defaultContainer = loader.querySelector(".default");
        const loaderText = defaultContainer?.querySelector(".loader-text");
        
        if (defaultContainer && loaderText) {
          loaderText.textContent = "CLAN MAXONA";
          defaultContainer.classList.add("visible");
        }

        sessionStorage.setItem("isTransitioning", Date.now().toString());

        loader.classList.add("visible");
        
        await sleep(300); 
        window.location.href = link.href;
      } else {
        window.location.href = link.href;
      }
    }
  });

  document.addEventListener("mouseover", (e) => {
    const link = e.target.closest("a:link");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return;

    const targetUrl = new URL(link.href, window.location.href);

    if (targetUrl.origin === window.location.origin && !link.hasAttribute("data-prefetched")) {
      link.setAttribute("data-prefetched", "true");
      
      const prefetchLink = document.createElement("link");
      prefetchLink.rel = "prefetch";
      prefetchLink.href = link.href;
      document.head.appendChild(prefetchLink);
    }
  });
};

//REGISTRATION LOGIC

const updateUIForRegistered = () => {
  const ctaSection = document.querySelector(SELECTORS.ctaSection);
  const heroSection = document.querySelector(SELECTORS.hero) || document.querySelector(SELECTORS.lessonsHero);

  if (ctaSection) {
    ctaSection.innerHTML = `
      <span class="subheading">ПРОЙТИ ОБУЧЕНИЕ</span>
      <h2 class="heading-secondary" style="margin-bottom: 1.2rem;">Форма отправлена!</h2>
      <p class="join-text" style="margin-left: auto; margin-right: auto; display: block;">Мы подготовили три эксклюзивных урока, которые заложат фундамент твоего успеха</p>
      <a href="${getLessonsPath()}" class="btn--cta btn--big btn--center">ПЕРЕЙТИ К ОБУЧЕНИЮ</a>
    `;
  }

  const updates = {
    "#hero-title": "ВЫ УСПЕШНО ОТПРАВИЛИ ФОРМУ ДЛЯ ОБРАТНОЙ СВЯЗИ!",
    "#hero-text": "А это значит, что вы готовы перейти к <strong>бесплатному</strong> обучению и 3 месяцам сопровождения от экспертов с капиталом более <strong>$20,000,000</strong>.",
    "#hero-btn": "ПЕРЕЙТИ К ОБУЧЕНИЮ",
    ".small-screen": "ПЕРЕЙТИ К ОБУЧЕНИЮ",
  };

  Object.entries(updates).forEach(([selector, text]) => {
    const el = document.querySelector(selector);
    if (el) el.innerHTML = text;
  });

  const heroBtn = document.querySelector("#hero-btn");
  if (heroBtn) heroBtn.setAttribute("href", getLessonsPath());
  const smallBtn = document.querySelector(".small-screen");
  if (smallBtn) heroBtn.setAttribute("href", getLessonsPath());

  heroSection?.classList.add("registered");
};

const initFormHandler = () => {
  const form = document.querySelector(SELECTORS.ctaForm);
  if (!form) return;

  const validators = {
    name: (val) => (val.length < 2 ? "Имя слишком короткое" : /[0-9]/.test(val) ? "Имя не должно содержать цифры" : ""),
    phone: (val) => (val.replace(/\D/g, "").length < 10 ? "Номер слишком короткий" : ""),
    telegram: (val) => (!val.startsWith("@") ? "Ник должен начинаться с @" : val.length < 4 ? "Слишком короткий ник" : /[а-яА-Я]/.test(val) ? "Используйте латиницу" : ""),
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const loader = document.querySelector(SELECTORS.loader);
    const submitBtn = form.querySelector('button[type="submit"]');

    let hasError = false;
    Object.entries(validators).forEach(([id, validator]) => {
      const input = form.querySelector(`#${id}`);
      const errorMsg = validator(input?.value.trim() || "");
      const errorSpan = form.querySelector(`#error-${id}`);

      if (errorSpan) errorSpan.textContent = errorMsg;
      input?.classList.toggle("invalid", !!errorMsg);
      if (errorMsg) hasError = true;
    });

    if (hasError) return;

    if (loader) {
      const defaultContainer = loader.querySelector(".default");
      const loaderText = defaultContainer?.querySelector(".loader-text");
      if (defaultContainer && loaderText) {
        loaderText.textContent = "Идет обработка данных";
        defaultContainer.classList.add("visible");
      }
      loader.querySelectorAll(".success, .fail").forEach(el => el.classList.remove("visible"));
      loader.classList.add("visible");
    }
    
    if (submitBtn) submitBtn.disabled = true;

    try {
      const response = await fetch(SCRIPT_URL, { method: "POST", body: new FormData(form) });
      if (!response.ok) throw new Error();

      loader.querySelector(".default")?.classList.remove("visible");
      await sleep(1000);
      loader.querySelector(".success")?.classList.add("visible");

      localStorage.setItem("registered", "true");
      updateUIForRegistered();
      form.reset();
    } catch {
      loader.querySelector(".default")?.classList.remove("visible");
      await sleep(1000);
      loader.querySelector(".fail")?.classList.add("visible");
    } finally {
      const closeBtn = loader.querySelector(".btn--close");
      if (closeBtn) {
        closeBtn.style.display = "block";
        closeBtn.style.opacity = "1";
        closeBtn.onclick = () => {
          loader.classList.remove("visible");
          if (submitBtn) submitBtn.disabled = false;
        };
      }
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initFAQ();
  initObservers();
  initSmoothScrollAndTransition();
  initFormHandler();

  if (localStorage.getItem("registered")) {
    updateUIForRegistered();
  }
});
