// =========================
// LOADING SCREEN
// =========================
// Fills the progress bar while the page loads, then fades the
// loading screen out once everything (images, fonts, etc.) is ready.
// A minimum display time stops it from flashing on fast connections.

(function initLoadingScreen() {
  const loadingScreen = document.getElementById("loadingScreen");
  const progressBar = document.getElementById("loaderProgress");

  const MIN_DISPLAY_TIME = 900; // ms — avoids an unpleasant flash on fast loads
  const startTime = Date.now();

  let progress = 0;
  let progressInterval = null;
  let pageHasLoaded = false;

  function setProgress(value) {
    progress = value;
    progressBar.style.width = `${progress}%`;
  }

  // Creep the bar up to 90% while we wait for the real "load" event.
  // It never reaches 100% on its own — only real completion does that.
  progressInterval = setInterval(() => {
    if (progress < 90) {
      const step = Math.random() * 8 + 2;
      setProgress(Math.min(progress + step, 90));
    }
  }, 180);

  function finishLoading() {
    clearInterval(progressInterval);
    setProgress(100);

    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(MIN_DISPLAY_TIME - elapsed, 0);

    setTimeout(() => {
      loadingScreen.classList.add("is-hidden");
      loadingScreen.setAttribute("aria-hidden", "true");
    }, remainingTime + 200);
  }

  window.addEventListener("load", () => {
    if (!pageHasLoaded) {
      pageHasLoaded = true;
      finishLoading();
    }
  });

  // Safety net: if the "load" event is ever delayed indefinitely
  // (slow third-party resource, etc.), don't trap the user forever.
  setTimeout(() => {
    if (!pageHasLoaded) {
      pageHasLoaded = true;
      finishLoading();
    }
  }, 6000);
})();


// =========================
// STATS COUNT-UP
// =========================
// Animates each stat number from 0 up to its real value the first
// time the stats section scrolls into view. Runs once per number.

(function initStatsCountUp() {
  const statsGrid = document.getElementById("statsGrid");
  if (!statsGrid) return;

  const numbers = statsGrid.querySelectorAll(".stat-number");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DURATION = 1400; // ms

  let hasAnimated = false;

  function formatValue(rawValue, format) {
    if (format === "k") {
      return `${(rawValue / 1000).toFixed(1)}K`;
    }
    return String(Math.round(rawValue));
  }

  function animateNumber(el) {
    const target = Number(el.dataset.target || 0);
    const format = el.dataset.format || "";

    if (prefersReducedMotion) {
      el.textContent = formatValue(target, format);
      return;
    }

    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      // Ease-out: fast start, gentle settle — feels more natural than linear counting
      const eased = 1 - Math.pow(1 - progress, 3);

      el.textContent = formatValue(target * eased, format);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  function isInView() {
    const rect = statsGrid.getBoundingClientRect();
    // Trigger once the grid's top has entered the lower 85% of the screen —
    // fires a little early so it feels responsive, not right at the edge.
    return rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
  }

  function checkAndRun() {
    if (hasAnimated) return;

    if (isInView()) {
      hasAnimated = true;
      numbers.forEach(animateNumber);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    }
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      checkAndRun();
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  // Covers the case where the stats section is already visible
  // on load (short pages, tall/zoomed-out screens, etc.)
  checkAndRun();
})();


// =========================
// MOBILE NAVIGATION
// =========================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("active");

  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

// Close mobile menu after clicking a navigation link
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  });
});


// =========================
// FEATURED EVENTS DATA
// =========================

const featuredEvents = [
  {
    title: "Introduction to Web Development",
    category: "TECH WORKSHOP",
    date: "OCT 12, 2026",
    location: "Computer Lab",
    type: "tech",
    image: "assets/event-tech.jpg"
  },
  {
    title: "Campus Career Seminar",
    category: "CAREER",
    date: "OCT 15, 2026",
    location: "Main Auditorium",
    type: "career",
    image: "assets/event-career.jpg"
  },
  {
    title: "Student Community Meetup",
    category: "SOCIAL",
    date: "OCT 18, 2026",
    location: "Student Center",
    type: "social",
    image: "assets/event-social.jpg"
  },
  {
    title: "Campus Innovation Challenge",
    category: "COMPETITION",
    date: "OCT 22, 2026",
    location: "Innovation Hub",
    type: "competition",
    image: ""
  }
];


// =========================
// RENDER EVENT CARDS
// =========================

const eventsContainer = document.getElementById("featuredEvents");

// Fallback icon shown only when an event has no photo yet
const typeSymbols = {
  tech: "</>",
  career: "↗",
  social: "✦",
  competition: "★"
};

function renderFeaturedEvents() {
  eventsContainer.innerHTML = featuredEvents
    .slice(0, 3)
    .map((event) => {
      const hasImage = Boolean(event.image);

      const imageStyle = hasImage
        ? ` style="background-image: url('${event.image}')"`
        : "";

      const symbolMarkup = hasImage
        ? ""
        : `<span class="event-symbol">${typeSymbols[event.type] || ""}</span>`;

      return `
        <article class="event-card">
          <div class="event-image ${event.type} ${hasImage ? "has-photo" : ""}"${imageStyle}>
            <span class="event-category">${event.category}</span>
            ${symbolMarkup}
          </div>

          <div class="event-body">
            <p class="event-date">${event.date}</p>
            <h3>${event.title}</h3>
            <p class="event-location">◉ ${event.location}</p>
            <a href="#" class="event-link">View event details →</a>
          </div>
        </article>
      `;
    })
    .join("");
}

renderFeaturedEvents();
                          
