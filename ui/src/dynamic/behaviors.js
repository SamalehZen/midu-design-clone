// Dynamic behaviours measured on https://midu.design
//   HeroSection   translateY(0.4 * scrollY)        (10243 px scroll -> 4097.2 px)
//   HeroMetaBar   translateY(0.2 * scrollY)        (10243 px scroll -> 2048.6 px)
//   logo strip    translateX leftward at 38.771 px/s (linear, continuous)
//   reviews       one 1040 px step every ~4.10 s, ~640 ms ease-out
//   About image   reversible scroll link, linear over scroll 1339 -> 2354:
//                 scale 0.9 -> 1.0 and translateY -80px -> 0
//                 (least-squares fit over 24 measured points, max error 4.6e-7)
//   sun icon      rotates 68.42 deg/s (360 deg per 5.262 s)
//   day / night   measured against shifted clocks on the live site:
//                 01:00-08:59 -> moon (IconSleep), 09:00-18:59 -> sun (IconSun)
const HERO_K = 0.4;
const META_K = 0.2;
const ABOUT_FROM = 1339;
const ABOUT_TO = 2354;
const ABOUT_SCALE_FROM = 0.9;
const ABOUT_TY_FROM = -80;
export const MARQUEE_PX_PER_S = 38.771;
export const CAROUSEL_STEP_PX = 1040;
export const CAROUSEL_PERIOD_MS = 4100;
export const CAROUSEL_DUR_MS = 640;
export const SUN_DEG_PER_S = 68.42; // measured: 338.5 deg in 4947 ms over 10 samples
export const DAY_FROM_HOUR = 9;
export const DAY_TO_HOUR = 18;

// The live site reads the London clock (the LocalTime label is "London, UK" and
// its value tracks Europe/London).  The icon switches on the whole hour.
export function isDaytime(d) {
  const h = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "numeric", hour12: false }).format(d)
  );
  return h >= DAY_FROM_HOUR && h <= DAY_TO_HOUR;
}


const easeOut = (t) => 1 - Math.pow(1 - t, 3);

export function startBehaviors(root) {
  const doc = root || document;
  const hero = doc.querySelector('[data-midu-dyn="hero-parallax"]');
  const meta = doc.querySelector('[data-midu-dyn="hero-meta-parallax"]');
  const marquee = doc.querySelector('[data-midu-dyn="logo-marquee"]');
  const carousel = doc.querySelector('[data-midu-dyn="reviews-carousel"]');
  const aboutImg = doc.querySelector('[data-framer-name="AboutBrandImage"]');
  const suns = doc.querySelectorAll('[data-framer-name="IconSunAnimation"]');
  const sunBoxes = doc.querySelectorAll('[data-framer-name="IconSun"]');
  const moonBoxes = doc.querySelectorAll('[data-framer-name="IconSleep"]');

  // Day / night switch (measured: sun for Europe/London hours 9..18, moon otherwise)
  const applyDayNight = () => {
    const day = isDaytime(new Date());
    sunBoxes.forEach((e) => {
      e.style.display = day ? "flex" : "none";
    });
    moonBoxes.forEach((e) => {
      e.style.display = day ? "none" : "flex";
    });
  };
  applyDayNight();
  const dayTimer = window.setInterval(applyDayNight, 30000);

  const onScroll = () => {
    const y = window.scrollY || window.pageYOffset || 0;
    if (hero) hero.style.transform = y ? "translateY(" + y * HERO_K + "px)" : "";
    if (meta) meta.style.transform = y ? "translateY(" + y * META_K + "px)" : "";
    if (aboutImg) {
      const t = Math.min(1, Math.max(0, (y - ABOUT_FROM) / (ABOUT_TO - ABOUT_FROM)));
      if (t <= 0) aboutImg.style.transform = "translateY(" + ABOUT_TY_FROM + "px) scale(" + ABOUT_SCALE_FROM + ")";
      else if (t >= 1) aboutImg.style.transform = "none";
      else
        aboutImg.style.transform =
          "translateY(" + ABOUT_TY_FROM * (1 - t) + "px) scale(" + (ABOUT_SCALE_FROM + (1 - ABOUT_SCALE_FROM) * t) + ")";
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  let period = 0;
  if (marquee && marquee.children.length) {
    const n = marquee.children.length;
    period = (marquee.children[1].getBoundingClientRect().left - marquee.children[0].getBoundingClientRect().left) * (n / 2);
  }
  const carouselBase = carousel ? carousel.style.transform : "";

  let raf = 0;
  const t0 = performance.now();
  const tick = () => {
    const ms = performance.now() - t0;
    if (marquee && period > 0) {
      const x = -(((ms / 1000) * MARQUEE_PX_PER_S) % period);
      marquee.style.transform = "translateX(" + x + "px)";
    }
    suns.forEach((s) => {
      s.style.transform = "rotate(" + (((ms / 1000) * SUN_DEG_PER_S) % 360).toFixed(3) + "deg)";
    });
    if (carousel) {
      const phase = ms % CAROUSEL_PERIOD_MS;
      const k = Math.floor(ms / CAROUSEL_PERIOD_MS) % 5;
      if (phase < CAROUSEL_DUR_MS) {
        const off = CAROUSEL_STEP_PX * (1 - easeOut(phase / CAROUSEL_DUR_MS));
        carousel.style.transform = "translateX(" + (off - k * CAROUSEL_STEP_PX) + "px)";
      } else {
        carousel.style.transform = "translateX(" + -k * CAROUSEL_STEP_PX + "px)";
      }
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.clearInterval(dayTimer);
    cancelAnimationFrame(raf);
    if (carousel) carousel.style.transform = carouselBase;
  };
}
