const pages = Array.from(document.querySelectorAll("[data-page]"));
const pageLinks = Array.from(document.querySelectorAll("[data-page-link]"));
const projectCovers = document.querySelectorAll(".project-cover");
const lightbox = document.getElementById("project-lightbox");
const lightboxStage = lightbox?.querySelector(".lightbox-stage");
const lightboxTitle = lightbox?.querySelector(".lightbox-title");
const lightboxCount = lightbox?.querySelector(".lightbox-count");
const lightboxClose = lightbox?.querySelector(".lightbox-close");
const lightboxPrev = lightbox?.querySelector(".lightbox-nav.prev");
const lightboxNext = lightbox?.querySelector(".lightbox-nav.next");

const REMOTE_VIDEO_BASE_URL = "";

const galleries = {
  pg: {
    title: "瘚瑕??? / PG",
    items: [
      { type: "image", src: "assets/originals/game/cover.png" },
      { type: "image", src: "assets/originals/game/pg/pg-01.png" },
      { type: "image", src: "assets/originals/game/pg/pg-02.png" },
      { type: "image", src: "assets/originals/game/pg/pg-03.png" }
    ]
  },
  hof: {
    title: "瘚瑕??? / HOF",
    items: [
      { type: "image", src: "assets/originals/game/hof/hof-01.png" }
    ]
  },
  sas: {
    title: "瘚瑕??? / SAS",
    items: [
      { type: "image", src: "assets/originals/game/game-01.png" }
    ]
  },
  kit: {
    title: "? 3D ?拇? / 3D Assets",
    items: [
      { type: "image", src: "assets/originals/game/pg/pg-03.png" }
    ]
  },
  ue: {
    title: "UE ?湔閬死",
    items: [
      { type: "image", src: "assets/originals/ue/cover.jpg" },
      { type: "image", src: "assets/originals/ue/ue-01.png" },
      { type: "image", src: "assets/originals/ue/ue-02.png" },
      { type: "image", src: "assets/originals/ue/ue-03.jpg" },
      { type: "image", src: "assets/originals/ue/ue-04.jpg" },
      { type: "image", src: "assets/originals/ue/ue-05.jpg" },
      { type: "image", src: "assets/originals/ue/ue-06.jpg" },
      { type: "image", src: "assets/originals/ue/ue-07.jpg" }
    ]
  },
  brand: {
    title: "??閬死?游?",
    items: [
      { type: "image", src: "assets/originals/brand/cover.png" },
      { type: "image", src: "assets/originals/brand/brand-02.png" },
      { type: "image", src: "assets/originals/brand/brand-03.png" },
      { type: "image", src: "assets/originals/brand/brand-04.png" },
      { type: "image", src: "assets/originals/brand/brand-05.png" },
      { type: "image", src: "assets/originals/brand/brand-06.png" }
    ]
  },
  character: {
    title: "閫撱箸芋??",
    items: [
      { type: "image", src: "assets/originals/character/cover.jpg" },
      { type: "image", src: "assets/originals/character/character-02.jpg" },
      { type: "image", src: "assets/originals/character/character-03.jpg" },
      { type: "image", src: "assets/originals/character/character-04.png" },
      { type: "image", src: "assets/originals/character/character-05.png" },
      { type: "image", src: "assets/originals/character/character-06.png" }
    ]
  }
};

let activeGallery = null;
let activeGalleryIndex = 0;
let activePage = pages.findIndex((page) => page.classList.contains("active"));
let isPageAnimating = false;
let wheelIntent = 0;
let wheelResetTimer;
let touchStartY = 0;
let touchLastY = 0;
let touchTracking = false;

if (activePage < 0) activePage = 0;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function resolveMediaSrc(item) {
  if (item.remoteSrc) return item.remoteSrc;
  if (item.remotePath && REMOTE_VIDEO_BASE_URL) {
    return `${REMOTE_VIDEO_BASE_URL.replace(/\/$/, "")}/${item.remotePath.replace(/^\//, "")}`;
  }
  return item.src;
}

function getPageScrollState(page) {
  const canScrollDown = page.scrollTop + page.clientHeight < page.scrollHeight - 8;
  const canScrollUp = page.scrollTop > 8;
  return { canScrollDown, canScrollUp };
}

function stepPage(direction) {
  if (isPageAnimating) return;
  const nextIndex = clamp(activePage + direction, 0, pages.length - 1);
  if (nextIndex !== activePage) {
    showPage(pages[nextIndex].dataset.page);
  }
}

function showPage(pageId, updateHash = true) {
  const nextIndex = pages.findIndex((page) => page.dataset.page === pageId);
  if (nextIndex === -1 || nextIndex === activePage || isPageAnimating) return;

  const nextPage = pages[nextIndex];
  const currentPage = pages[activePage];

  isPageAnimating = true;
  wheelIntent = 0;
  currentPage.classList.remove("active");
  nextPage.classList.add("active");
  nextPage.scrollTop = 0;
  activePage = nextIndex;

  pageLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.pageLink === pageId);
  });

  if (updateHash) {
    history.replaceState(null, "", `#${pageId}`);
  }

  window.setTimeout(() => {
    isPageAnimating = false;
  }, 1050);
}

pageLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const pageId = link.dataset.pageLink;
    if (!pageId) return;
    showPage(pageId);
  });
});

function renderLightbox() {
  if (!activeGallery || !lightboxStage) return;

  const gallery = galleries[activeGallery];
  const item = gallery.items[activeGalleryIndex];

  lightboxStage.innerHTML = "";

  const media = document.createElement(item.type === "video" ? "video" : "img");
  media.src = resolveMediaSrc(item);

  if (item.type === "video") {
    media.controls = true;
    media.autoplay = true;
    media.playsInline = true;
  } else {
    media.alt = gallery.title;
  }

  lightboxStage.appendChild(media);
  lightboxTitle.textContent = gallery.title;
  lightboxCount.textContent = `${activeGalleryIndex + 1} / ${gallery.items.length}`;
}

function openGallery(galleryId) {
  if (!galleries[galleryId] || !lightbox) return;
  activeGallery = galleryId;
  activeGalleryIndex = 0;
  renderLightbox();
  lightbox.classList.add("active");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
}

function closeGallery() {
  if (!lightbox) return;
  lightbox.classList.remove("active");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  activeGallery = null;
  activeGalleryIndex = 0;
  if (lightboxStage) lightboxStage.innerHTML = "";
}

function stepGallery(direction) {
  if (!activeGallery) return;
  const total = galleries[activeGallery].items.length;
  activeGalleryIndex = (activeGalleryIndex + direction + total) % total;
  renderLightbox();
}

projectCovers.forEach((cover) => {
  cover.addEventListener("click", () => {
    const galleryId = cover.dataset.gallery;
    if (!galleryId) return;
    openGallery(galleryId);
  });
});

lightboxClose?.addEventListener("click", closeGallery);
lightboxPrev?.addEventListener("click", () => stepGallery(-1));
lightboxNext?.addEventListener("click", () => stepGallery(1));
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeGallery();
});

function setupScrollFloatText() {
  const headings = document.querySelectorAll(".section-heading h2, .contact-grid h2");

  headings.forEach((heading) => {
    if (heading.dataset.floatReady) return;
    const text = heading.textContent;
    heading.textContent = "";
    heading.classList.add("scroll-float");
    heading.dataset.floatReady = "true";

    Array.from(text).forEach((char, index) => {
      const span = document.createElement("span");
      span.className = "char";
      span.style.setProperty("--char-index", index);
      span.textContent = char === " " ? "\u00a0" : char;
      heading.appendChild(span);
    });
  });
}

function setupPressureText() {
  const textElement = document.querySelector("[data-pressure-text]");
  if (!textElement) return;

  const chars = textElement.dataset.pressureText.split("");
  textElement.textContent = "";

  chars.forEach((char, index) => {
    const span = document.createElement("span");
    span.textContent = char === " " ? "\u00a0" : char;
    span.style.setProperty("--pressure-index", index);
    textElement.appendChild(span);
  });

  const spans = Array.from(textElement.querySelectorAll("span"));
  const cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const eased = { x: cursor.x, y: cursor.y };
  let pressureEnabled = false;

  function updateCursor(event) {
    const point = event.touches ? event.touches[0] : event;
    cursor.x = point.clientX;
    cursor.y = point.clientY;
  }

  window.addEventListener("mousemove", updateCursor);
  window.addEventListener("touchmove", updateCursor, { passive: true });

  function animate() {
    eased.x += (cursor.x - eased.x) / 14;
    eased.y += (cursor.y - eased.y) / 14;

    if (pressureEnabled) {
      const titleRect = textElement.getBoundingClientRect();
      const maxDist = Math.max(220, titleRect.width * 0.48);

      spans.forEach((span) => {
        const rect = span.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.hypot(eased.x - centerX, eased.y - centerY);
        const force = clamp(1 - distance / maxDist, 0, 1);
        const weight = Math.round(210 + force * 690);
        const width = Math.round(72 + force * 128);
        const skew = (force * 7).toFixed(2);
        const lift = (force * -18).toFixed(2);
        const scaleY = (1 + force * 0.18).toFixed(3);

        span.style.fontVariationSettings = `"wght" ${weight}, "wdth" ${width}, "ital" ${force.toFixed(2)}`;
        span.style.transform = `translateY(${lift}px) skewX(${-skew}deg) scaleY(${scaleY})`;
        span.style.color = force > 0.38 ? "#ff2f9e" : "#f7fbff";
        span.style.opacity = String(0.82 + force * 0.18);
      });
    }

    requestAnimationFrame(animate);
  }

  window.setTimeout(() => {
    pressureEnabled = true;
    spans.forEach((span) => {
      span.style.animation = "none";
    });
  }, 1450);

  animate();
}

window.addEventListener(
  "wheel",
  (event) => {
    if (isPageAnimating) {
      event.preventDefault();
      return;
    }

    const active = pages[activePage];
    if (!active) return;

    const forcePaged = active.classList.contains("cover-page");
    const { canScrollDown, canScrollUp } = getPageScrollState(active);

    if ((event.deltaY > 0 && !forcePaged && canScrollDown) || (event.deltaY < 0 && !forcePaged && canScrollUp)) {
      return;
    }

    wheelIntent += event.deltaY;
    clearTimeout(wheelResetTimer);
    wheelResetTimer = window.setTimeout(() => {
      wheelIntent = 0;
    }, 180);

    if (Math.abs(wheelIntent) < 150) {
      event.preventDefault();
      return;
    }

    const direction = wheelIntent > 0 ? 1 : -1;
    event.preventDefault();
    stepPage(direction);
  },
  { passive: false }
);

window.addEventListener(
  "touchstart",
  (event) => {
    if (lightbox?.classList.contains("active") || event.touches.length !== 1) return;
    touchStartY = event.touches[0].clientY;
    touchLastY = touchStartY;
    touchTracking = true;
  },
  { passive: true }
);

window.addEventListener(
  "touchmove",
  (event) => {
    if (!touchTracking || isPageAnimating || event.touches.length !== 1) return;
    touchLastY = event.touches[0].clientY;

    const active = pages[activePage];
    if (!active) return;

    const deltaY = touchStartY - touchLastY;
    const direction = deltaY > 0 ? 1 : -1;
    const forcePaged = active.classList.contains("cover-page");
    const { canScrollDown, canScrollUp } = getPageScrollState(active);
    const canScrollInDirection = !forcePaged && ((direction > 0 && canScrollDown) || (direction < 0 && canScrollUp));

    if (Math.abs(deltaY) > 18 && !canScrollInDirection) {
      event.preventDefault();
    }
  },
  { passive: false }
);

window.addEventListener(
  "touchend",
  () => {
    if (!touchTracking || isPageAnimating) return;
    touchTracking = false;

    const active = pages[activePage];
    if (!active) return;

    const deltaY = touchStartY - touchLastY;
    if (Math.abs(deltaY) < 72) return;

    const direction = deltaY > 0 ? 1 : -1;
    const forcePaged = active.classList.contains("cover-page");
    const { canScrollDown, canScrollUp } = getPageScrollState(active);
    const canScrollInDirection = !forcePaged && ((direction > 0 && canScrollDown) || (direction < 0 && canScrollUp));

    if (!canScrollInDirection) {
      stepPage(direction);
    }
  },
  { passive: true }
);

window.addEventListener("touchcancel", () => {
  touchTracking = false;
});

window.addEventListener("keydown", (event) => {
  if (lightbox?.classList.contains("active")) {
    if (event.key === "Escape") closeGallery();
    if (event.key === "ArrowLeft") stepGallery(-1);
    if (event.key === "ArrowRight") stepGallery(1);
    return;
  }

  const downKeys = ["ArrowDown", "PageDown", " "];
  const upKeys = ["ArrowUp", "PageUp"];
  if (![...downKeys, ...upKeys].includes(event.key)) return;

  event.preventDefault();

  const direction = downKeys.includes(event.key) ? 1 : -1;
  stepPage(direction);
});

let initialPage = window.location.hash.replace("#", "");
if (initialPage && pages.some((page) => page.dataset.page === initialPage)) {
  showPage(initialPage, false);
} else if (!initialPage) {
  history.replaceState(null, "", "#welcome");
}

setupScrollFloatText();
setupPressureText();
