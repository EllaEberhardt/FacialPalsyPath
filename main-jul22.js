// ─── Load HTML includes (e.g. header/footer components) ───────────────────────
async function loadIncludes() {
  const targets = document.querySelectorAll("[data-include]");

  for (const el of targets) {
    const filePath = el.getAttribute("data-include");
    const response = await fetch(filePath);
    const html = await response.text();
    el.innerHTML = html;
  }

  // Init tabs AFTER includes are loaded (for tabs inside included components)
  initTabs();
}

// ─── Tab functionality ─────────────────────────────────────────────────────────
function initTabs() {
  initTabButtonToggles();
  initTabNeighborFlashOnView();

  document.querySelectorAll('.tab-section').forEach(section => {
    // Prevent double-binding if initTabs() runs more than once on the same section
    if (section.dataset.tabsInitialized === 'true') return;
    section.dataset.tabsInitialized = 'true';

    const buttons = section.querySelectorAll('.tab-button');
    const contents = section.querySelectorAll('.tab-content');

    // Ensure the first tab is active if none already are
    const hasActiveButton = [...buttons].some(b => b.classList.contains('active'));
    if (!hasActiveButton && buttons.length > 0) {
      buttons[0].classList.add('active');
    }

    const hasActiveContent = [...contents].some(c => c.classList.contains('active'));
    if (!hasActiveContent && contents.length > 0) {
      contents[0].classList.add('active');
    }

    // Keep this section's dropdown toggle label (if any) in sync with whichever
    // tab-button is active
    updateTabButtonToggleLabel(section);

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        buttons.forEach(btn => btn.classList.remove('active'));
        contents.forEach(content => content.classList.remove('active'));

        button.classList.add('active');

        const targetID = button.getAttribute('data-target');
        // Scope the lookup to THIS section so duplicate ids elsewhere on the
        // page (e.g. the same component reused) can't steal the match.
        const targetEl = section.querySelector('#' + CSS.escape(targetID));
        if (targetEl) targetEl.classList.add('active');

        // Reflect the newly-selected tab in the dropdown toggle, then close it
        updateTabButtonToggleLabel(section);
        closeTabButtonDropdown(section);
      });
    });
  });
}

// ─── Tab-neighbor flash: replay every time the tab section scrolls into view ──
// (instead of playing immediately on page load). Toggles .in-view on the
// .tab-section as it enters/leaves the viewport; style.css uses that class to
// gate the tabNeighborFlash animation, so it replays each time it re-enters.
function initTabNeighborFlashOnView() {
  const sections = document.querySelectorAll('.tab-section');

  const flashObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else {
        // Remove the class when it scrolls out so the animation can
        // replay (via re-adding .in-view) the next time it scrolls back in
        entry.target.classList.remove('in-view');
      }
    });
  }, {
    threshold: 0.3 // fires once ~30% of the tab section is visible
  });

  sections.forEach(section => {
    // Prevent double-observing if initTabs() runs more than once on the same section
    if (section.dataset.flashObserverInitialized === 'true') return;
    section.dataset.flashObserverInitialized = 'true';

    flashObserver.observe(section);
  });
}

// ─── Tab-button toggle (mobile dropdown) ───────────────────────────────────────
// Same idea as the sidebar toggle, but scoped to its own .tab-section only —
// it never affects any other tab-section on the page. Shows the active tab's
// label as the toggle text, and closes itself when clicking/tapping outside.
function initTabButtonToggles() {
  document.querySelectorAll('.tab-button-toggle').forEach(toggle => {
    // Prevent double-binding if this runs more than once on the same button
    if (toggle.dataset.toggleInitialized === 'true') return;
    toggle.dataset.toggleInitialized = 'true';

    const tabSection = toggle.closest('.tab-section');
    if (!tabSection) return;

    updateTabButtonToggleLabel(tabSection);

    toggle.addEventListener('click', () => {
      const isOpen = tabSection.classList.toggle('tab-buttons-open');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    const closeOnOutsideInteraction = (event) => {
      if (!tabSection.contains(event.target)) {
        closeTabButtonDropdown(tabSection);
      }
    };

    document.addEventListener('click', closeOnOutsideInteraction);
    document.addEventListener('touchstart', closeOnOutsideInteraction);
  });
}

// Sets a tab-section's dropdown toggle text to match its currently active tab
function updateTabButtonToggleLabel(tabSection) {
  const toggle = tabSection.querySelector('.tab-button-toggle');
  if (!toggle) return;

  const activeButton = tabSection.querySelector('.tab-button.active') || tabSection.querySelector('.tab-button');
  if (activeButton) {
    toggle.textContent = activeButton.textContent.trim();
  }
}

// Closes a tab-section's dropdown (no-op if it has no toggle or is already closed)
function closeTabButtonDropdown(tabSection) {
  const toggle = tabSection.querySelector('.tab-button-toggle');
  if (!toggle) return;

  tabSection.classList.remove('tab-buttons-open');
  toggle.setAttribute('aria-expanded', 'false');
}

// ─── On DOM ready ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Init tabs for tabs already in the static HTML (not inside includes)
  initTabs();

  // Load included components (header, footer), then init tabs inside them too
  loadIncludes();

  // ── Sidebar scroll spy ────────────────────────────────────────────────────
  const sections = document.querySelectorAll('.page-section');
  const navLinks = document.querySelectorAll('.sidebar a');

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active'));

        const activeId = entry.target.getAttribute('id');
        const activeLink = document.querySelector(`.sidebar a[href="#${activeId}"]`);

        if (activeLink) {
          activeLink.classList.add('active');
          // Update mobile sidebar toggle button text
          const sidebarButton = document.getElementById('sidebarToggle');
          if (sidebarButton) {
            sidebarButton.textContent = activeLink.textContent;
          }
        }
      }
    });
  }, {
    root: null,
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
  });

  sections.forEach(section => scrollObserver.observe(section));

  // ── Mobile sidebar toggle ─────────────────────────────────────────────────
  const sidebarButton = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');

  if (sidebarButton && sidebar) {
    // Set initial button text from the first active sidebar link
    const firstActive = document.querySelector('.sidebar a.active');
    if (firstActive) {
      sidebarButton.textContent = firstActive.textContent;
    }

    sidebarButton.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    const closeSidebarOnOutsideTap = (event) => {
      const clickedInsideSidebar = sidebar.contains(event.target) || sidebarButton.contains(event.target);
      if (!clickedInsideSidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
    };

    document.addEventListener('click', closeSidebarOnOutsideTap);
    document.addEventListener('touchstart', closeSidebarOnOutsideTap);

    document.querySelectorAll('.sidebar a').forEach(link => {
      link.addEventListener('click', () => {
        sidebar.classList.remove('open');
      });
    });
  }

  // ── Side panel toggles / DONT DELETE - changing this makes the header disapear??? ────────────────────────────────────────────────────
  document.querySelectorAll('.side-panel-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabSection = btn.closest('.tab-section');
      const isOpen = tabSection.classList.toggle('side-panel-open');
      btn.setAttribute('aria-expanded', isOpen);
    });
  });

});

// ─── Definition Styling - make it follow cursor ─────────────────────────────────
document.querySelectorAll('.definition').forEach(el => {
  el.addEventListener('mousemove', (e) => {
    const tip = el;
    // CSS custom properties let the ::after pseudo-element read the cursor position
    tip.style.setProperty('--tx', (e.clientX + 14) + 'px');
    tip.style.setProperty('--ty', (e.clientY + 14) + 'px');
  });
});

// ------- it works - TEST CODE TO CLICK OFF THE DEFINITION TO CLOSE IT ON MOBILE

document.addEventListener('click', function(e) {
  if (!e.target.classList.contains('definition')) {
    document.querySelectorAll('.definition').forEach(el => {
      el.classList.remove('active');
    });
  }
});

window.addEventListener('scroll', function() {
  document.querySelectorAll('.definition').forEach(el => {
    el.classList.remove('active');
  });
});

// ─── References Toggle ─────────────────────────────────
function toggleReferences() {
  const content = document.getElementById('referencesContent');
  const triangle = document.querySelector('.triangle');
  content.classList.toggle('open');
  triangle.classList.toggle('open');
}