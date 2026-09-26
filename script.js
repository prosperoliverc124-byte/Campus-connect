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
// TOAST NOTIFICATIONS
// =========================
// Reusable "this isn't available yet" message. Use this instead of
// leaving a button that silently does nothing (or worse, jumps
// somewhere unexpected).

const toast = document.getElementById("toast");
let toastTimeout = null;

function showToast(message, duration = 2600) {
  toast.textContent = message;
  toast.classList.add("is-visible");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, duration);
}

document.getElementById("reserveSpotBtn").addEventListener("click", () => {
  showToast("Reservations aren't open yet — check back closer to the event date.");
});


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

const allEvents = [
  {
    id: 1,
    title: "Introduction to Web Development",
    category: "TECH WORKSHOP",
    type: "tech",
    date: "OCT 12, 2026",
    time: "10:00 AM",
    location: "Computer Lab",
    image: "assets/event-tech.jpg",
    description: "A hands-on introduction to HTML, CSS, and JavaScript for students with zero coding experience. Bring a laptop — everything else is provided, including snacks and a take-home project template."
  },
  {
    id: 2,
    title: "Campus Career Seminar",
    category: "CAREER",
    type: "career",
    date: "OCT 15, 2026",
    time: "2:00 PM",
    location: "Main Auditorium",
    image: "assets/event-career.jpg",
    description: "Recruiters from local companies share what they actually look for in graduate applications, followed by a Q&A and informal networking session over refreshments."
  },
  {
    id: 3,
    title: "Student Community Meetup",
    category: "SOCIAL",
    type: "social",
    date: "OCT 18, 2026",
    time: "6:00 PM",
    location: "Student Center",
    image: "assets/event-social.jpg",
    description: "A relaxed evening to meet students outside your usual circle — board games, music, and free food, organized by the Student Community Council."
  },
  {
    id: 4,
    title: "Campus Innovation Challenge",
    category: "COMPETITION",
    type: "competition",
    date: "OCT 22, 2026",
    time: "9:00 AM",
    location: "Innovation Hub",
    image: "assets/event-competition.jpg",
    description: "Teams of up to 4 pitch a solution to a real campus problem in front of a panel of judges. Cash prizes for the top 3 teams, and mentorship for every entrant."
  },
  {
    id: 5,
    title: "AI & Machine Learning Bootcamp",
    category: "TECH WORKSHOP",
    type: "tech",
    date: "OCT 25, 2026",
    time: "11:00 AM",
    location: "Computer Lab",
    image: "assets/event-tech.jpg",
    description: "A full-day intensive covering the basics of machine learning with Python, taught by senior CS students. No prior ML experience required — just some familiarity with Python."
  },
  {
    id: 6,
    title: "Startup Pitch Night",
    category: "CAREER",
    type: "career",
    date: "OCT 28, 2026",
    time: "5:00 PM",
    location: "Innovation Hub",
    image: "assets/event-career.jpg",
    description: "Student founders pitch their startups to a room of alumni investors and local entrepreneurs. Open to all students as spectators — free entry, RSVP required."
  },
  {
    id: 7,
    title: "Campus Photography Walk",
    category: "ARTS",
    type: "arts",
    date: "NOV 2, 2026",
    time: "4:00 PM",
    location: "Main Quad",
    image: "assets/event-arts.jpg",
    description: "Grab a camera or your phone and join a golden-hour walk around campus's most photogenic spots, led by members of the Photography Club. All skill levels welcome."
  },
  {
    id: 8,
    title: "Intramural Basketball Finals",
    category: "SPORTS",
    type: "sports",
    date: "NOV 5, 2026",
    time: "3:00 PM",
    location: "Sports Complex",
    image: "assets/event-sports.jpg",
    description: "The championship game of this semester's intramural league. Come cheer on your hall or department team — concessions and free t-shirts for the first 100 fans."
  },
  {
    id: 9,
    title: "Open Mic Night",
    category: "SOCIAL",
    type: "social",
    date: "NOV 8, 2026",
    time: "7:00 PM",
    location: "Student Center",
    image: "assets/event-social.jpg",
    description: "Music, poetry, comedy — if you've got 5 minutes of material, the stage is yours. Sign-ups open at the door, or reserve a slot in advance online."
  }
];


// =========================
// RENDER EVENT CARDS
// =========================

const eventsContainer = document.getElementById("featuredEvents");
const emptyState = document.getElementById("eventsEmpty");
const searchInput = document.getElementById("eventSearch");
const filterPills = document.getElementById("filterPills");

// Fallback icon shown only when an event has no photo yet
const typeSymbols = {
  tech: "</>",
  career: "↗",
  social: "✦",
  competition: "★",
  arts: "❖",
  sports: "◆"
};

let activeCategory = "all";
let searchTerm = "";

function getFilteredEvents() {
  return allEvents.filter((event) => {
    const matchesCategory = activeCategory === "all" || event.type === activeCategory;

    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      event.title.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });
}

function renderFeaturedEvents() {
  const filtered = getFilteredEvents();

  emptyState.hidden = filtered.length > 0;
  eventsContainer.hidden = filtered.length === 0;

  eventsContainer.innerHTML = filtered
    .map((event) => {
      const hasImage = Boolean(event.image);

      const imageStyle = hasImage
        ? ` style="background-image: url('${event.image}')"`
        : "";

      const symbolMarkup = hasImage
        ? ""
        : `<span class="event-symbol">${typeSymbols[event.type] || ""}</span>`;

      return `
        <article class="event-card" data-event-id="${event.id}" tabindex="0" role="button" aria-haspopup="dialog">
          <div class="event-image ${event.type} ${hasImage ? "has-photo" : ""}"${imageStyle}>
            <span class="event-category">${event.category}</span>
            ${symbolMarkup}
          </div>

          <div class="event-body">
            <p class="event-date">${event.date}</p>
            <h3>${event.title}</h3>
            <p class="event-location">◉ ${event.location}</p>
            <span class="event-link">View event details →</span>
          </div>
        </article>
      `;
    })
    .join("");
}


// =========================
// SEARCH + CATEGORY FILTER
// =========================

searchInput.addEventListener("input", (event) => {
  searchTerm = event.target.value;
  renderFeaturedEvents();
});

filterPills.addEventListener("click", (event) => {
  const pill = event.target.closest(".filter-pill");
  if (!pill) return;

  activeCategory = pill.dataset.category;

  filterPills.querySelectorAll(".filter-pill").forEach((p) => {
    p.classList.toggle("active", p === pill);
  });

  renderFeaturedEvents();
});


// =========================
// EVENT DETAILS MODAL
// =========================

const eventModal = document.getElementById("eventModal");
const eventModalImage = document.getElementById("eventModalImage");
const eventModalCategory = document.getElementById("eventModalCategory");
const eventModalTitle = document.getElementById("eventModalTitle");
const eventModalDate = document.getElementById("eventModalDate");
const eventModalLocation = document.getElementById("eventModalLocation");
const eventModalDescription = document.getElementById("eventModalDescription");

function openEventModal(eventId, updateHistory = true) {
  const event = allEvents.find((e) => e.id === Number(eventId));
  if (!event) return;

  eventModalImage.style.backgroundImage = event.image
    ? `url('${event.image}')`
    : "linear-gradient(135deg, #27365b, #171f37)";

  eventModalCategory.textContent = event.category;
  eventModalTitle.textContent = event.title;
  eventModalDate.textContent = `◷ ${event.date} · ${event.time}`;
  eventModalLocation.textContent = `⌖ ${event.location}`;
  eventModalDescription.textContent = event.description;

  eventModal.classList.add("is-open");
  eventModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  if (updateHistory) {
    history.pushState({ eventId: event.id }, "", `?event=${event.id}`);
  }
}

function closeEventModal(updateHistory = true) {
  eventModal.classList.remove("is-open");
  eventModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (updateHistory && window.location.search.includes("event=")) {
    history.pushState({}, "", window.location.pathname);
  }
}

// Open the modal when a card is clicked or activated by keyboard
eventsContainer.addEventListener("click", (event) => {
  const card = event.target.closest(".event-card");
  if (card) openEventModal(card.dataset.eventId);
});

eventsContainer.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;

  const card = event.target.closest(".event-card");
  if (!card) return;

  event.preventDefault();
  openEventModal(card.dataset.eventId);
});

// Close on backdrop click, close button, or Escape key
eventModal.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-modal]")) closeEventModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && eventModal.classList.contains("is-open")) {
    closeEventModal();
  }
});

// Support the browser back button: closes the modal instead of leaving the page
window.addEventListener("popstate", (event) => {
  if (event.state && event.state.eventId) {
    openEventModal(event.state.eventId, false);
  } else {
    closeEventModal(false);
  }
});

// Deep link support: opening the page with ?event=3 shows that event right away
(function openEventFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("event");
  if (eventId) openEventModal(eventId, false);
})();


// =========================
// DYNAMIC STATS FROM REAL DATA
// =========================
// Keeps the "Upcoming Events" and "Event Categories" numbers
// truthful instead of hardcoded, since the count is now real.

(function syncStatsWithEventData() {
  const eventCountEl = document.getElementById("statEventCount");
  const categoryCountEl = document.getElementById("statCategoryCount");

  if (eventCountEl) eventCountEl.dataset.target = String(allEvents.length);
  if (categoryCountEl) {
    const uniqueCategories = new Set(allEvents.map((e) => e.type));
    categoryCountEl.dataset.target = String(uniqueCategories.size);
  }
})();

renderFeaturedEvents();
  
