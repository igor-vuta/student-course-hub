
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector("#primary-nav-menu");
  const header = document.querySelector(".site-header");
  if (!toggleBtn || !navMenu || !header) {
    return;
  }

  const closeMenu = () => {
    navMenu.classList.remove("is-open");
    toggleBtn.setAttribute("aria-expanded", "false");
  };


  toggleBtn.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) {
      closeMenu();
    }
  });

  navMenu.querySelectorAll("a, button").forEach((item) => {
    item.addEventListener("click", () => {
      if (globalThis.matchMedia("(max-width: 768px)").matches) {
        closeMenu();
      }
    });
  });

  globalThis.addEventListener("resize", () => {
    if (!globalThis.matchMedia("(max-width: 768px)").matches) {
      closeMenu();
    }
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const menus = Array.from(document.querySelectorAll(".row-action-menu"));
  if (menus.length === 0) {
    return;
  }

  const closeAll = () => {
    menus.forEach((menu) => menu.removeAttribute("open"));
  };

  const closeAllExcept = (current) => {
    menus.forEach((menu) => {
      if (menu !== current) {
        menu.removeAttribute("open");
      }
    });
  };

  menus.forEach((menu) => {
    menu.addEventListener("toggle", () => {
      if (menu.hasAttribute("open")) {
        closeAllExcept(menu);
      }
    });
  });

  document.addEventListener("mousedown", (event) => {
    const target = event.target;
    if (!target.closest(".row-action-menu")) {
      closeAll();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAll();
    }
  });
});


document.addEventListener("DOMContentLoaded", () => {
  
  document.querySelectorAll(".inline-form").forEach((form) => {
    if (form.classList.contains("logout-form")) return;
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) submitBtn.disabled = true;
      let notice = form.querySelector(".admin-notice");
      if (!notice) {
        notice = document.createElement("span");
        notice.className = "admin-notice";
        notice.setAttribute("role", "status");
        notice.setAttribute("aria-live", "polite");
        form.appendChild(notice);
      }
      notice.textContent = "Updating...";
      try {
        const formData = new FormData(form);
        const params = new URLSearchParams();
        for (const [key, value] of formData.entries()) {
          params.append(key, String(value));
        }
        const response = await fetch(form.action, {
          method: "POST",
          body: params,
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });
        const data = await response.json();
        if (response.ok && data && data.ok) {
          notice.textContent = "Updated.";
          
          setTimeout(() => globalThis.location.reload(), 600);
        } else {
          notice.textContent = data && data.message ? data.message : "Update failed.";
        }
      } catch (_err) {
        notice.textContent = "Network error.";
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });

  
  const adminForm = document.querySelector(".admin-form");
  if (adminForm) {
    adminForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.target;
      
      const formData = new FormData(form);
      const params = new URLSearchParams();
      for (const [key, value] of formData.entries()) {
        params.append(key, value);
      }
      const submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) submitBtn.disabled = true;
      let notice = form.querySelector(".admin-notice");
      if (!notice) {
        notice = document.createElement("p");
        notice.className = "admin-notice";
        notice.setAttribute("role", "status");
        notice.setAttribute("aria-live", "polite");
        form.appendChild(notice);
      }
      notice.textContent = "Submitting...";
      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: params,
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
          },
        });
        const data = await response.json();
        if (response.ok && data && data.ok) {
          notice.textContent = "Programme created.";
          form.reset();
          setTimeout(() => globalThis.location.reload(), 800);
        } else {
          notice.textContent = data && data.message ? data.message : "Creation failed.";
        }
      } catch (_err) {
        notice.textContent = "Network error.";
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const interestForms = document.querySelectorAll(".interest-form");
  interestForms.forEach((interestForm) => {
    interestForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.target;
      const formData = new FormData(form);
      const params = new URLSearchParams();
      for (const [key, value] of formData.entries()) {
        params.append(key, String(value));
      }
      const submitBtn = form.querySelector("button[type='submit']");
      if (submitBtn) submitBtn.disabled = true;
      let notice = form.querySelector(".interest-notice");
      if (!notice) {
        notice = document.createElement("p");
        notice.className = "interest-notice";
        notice.setAttribute("role", "status");
        notice.setAttribute("aria-live", "polite");
        form.appendChild(notice);
      }
      notice.textContent = "Submitting...";
      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: params,
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });
        const data = await response.json();
        if (response.ok && data && data.ok) {
          notice.textContent = data.message || "Request completed successfully.";
          form.reset();
        } else {
          notice.textContent = data && data.message ? data.message : "Submission failed.";
        }
      } catch (_err) {
        notice.textContent = "Network error. Please try again.";
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });
});
const searchForm = document.querySelector("#search-form");
const resultsContainer = document.querySelector("#programme-results");

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function cardHtml(programme) {
  const levelClass = `badge-${esc(programme.level.toLowerCase())}`;
  return `<a href="/programmes/${programme.id}" class="card card-link" data-programme-id="${programme.id}">
    <div class="card-img-wrap">
      <img src="${esc(programme.imageUrl)}" alt="${esc(programme.title)}" loading="lazy" onerror="this.onerror=null;this.src='/public/img/fallback.svg';this.classList.add('img-fallback');" />
    </div>
    <div class="card-content flex-col">
      <span class="badge ${levelClass}">${esc(programme.level)}</span>
      <h3 class="card-title">${esc(programme.title)}</h3>
      <p class="card-desc">${esc(programme.description)}</p>
    </div>
  </a>`;
}

async function updateProgrammes(event) {
  event.preventDefault();
  if (!resultsContainer) {
    return;
  }

  const countEl = document.getElementById("result-count");
  const formData = new FormData(searchForm);
  const params = new URLSearchParams();

  const search = String(formData.get("search") || "").trim();
  const level = String(formData.get("level") || "").trim();

  if (search) {
    params.set("search", search);
  }

  if (level) {
    params.set("level", level);
  }

  const response = await fetch(`/api/programmes?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    resultsContainer.innerHTML = "<p>Unable to load results right now.</p>";
    return;
  }

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    resultsContainer.innerHTML = `<div class="empty-state">
      <img src="/public/img/empty-state.svg" alt="No results" class="empty-img" />
      <h3>No programmes found</h3>
      <p>Try adjusting your filters or search keywords.</p>
    </div>`;
    if (countEl) countEl.textContent = "Showing 0 programmes";
    return;
  }

  resultsContainer.innerHTML = data.map(cardHtml).join("\n");
  if (countEl) {
    const n = data.length;
    countEl.textContent = `Showing ${n} programme${n === 1 ? "" : "s"}`;
  }
}

if (searchForm && resultsContainer) {
  searchForm.addEventListener("submit", (event) => {
    updateProgrammes(event).catch(() => {
      resultsContainer.innerHTML = "<p>Unexpected error while fetching programmes.</p>";
    });
  });
}


document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("level-select");
  if (!select) return;

  const open = () => select.setAttribute("aria-expanded", "true");
  const close = () => select.setAttribute("aria-expanded", "false");
  const isOpen = () => select.getAttribute("aria-expanded") === "true";

  
  select.addEventListener("click", (e) => {
    if (e.target.closest(".custom-select-option")) return;
    e.stopPropagation();
    isOpen() ? close() : open();
  });

  
  select.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      isOpen() ? close() : open();
    } else if (e.key === "Escape") {
      close();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const options = Array.from(select.querySelectorAll(".custom-select-option"));
      const currentIdx = options.findIndex((o) => o.classList.contains("is-selected"));
      let nextIdx = e.key === "ArrowDown"
        ? Math.min(currentIdx + 1, options.length - 1)
        : Math.max(currentIdx - 1, 0);
      options[nextIdx].click();
    }
  });

  select.querySelectorAll(".custom-select-option").forEach((option) => {
    option.addEventListener("click", (e) => {
      e.stopPropagation();
      const value = option.dataset.value ?? "";
      const label = option.textContent.trim();

      select.querySelectorAll(".custom-select-option").forEach((o) => {
        o.classList.remove("is-selected");
        o.setAttribute("aria-selected", "false");
      });
      option.classList.add("is-selected");
      option.setAttribute("aria-selected", "true");

      select.querySelector(".custom-select-value").textContent = label;
      select.querySelector("input[name='level']").value = value;
      close();
    });
  });

  document.addEventListener("mousedown", (e) => {
    if (!select.contains(e.target)) {
      close();
    }
  });
});
