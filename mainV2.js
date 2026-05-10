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
  document.querySelectorAll('.tab-section').forEach(section => {
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

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        buttons.forEach(btn => btn.classList.remove('active'));
        contents.forEach(content => content.classList.remove('active'));

        button.classList.add('active');

        const targetID = button.getAttribute('data-target');
        const targetEl = document.getElementById(targetID);
        if (targetEl) targetEl.classList.add('active');
      });
    });
  });
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
            sidebarButton.textContent = activeLink.textContent + ' ▼';
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
      sidebarButton.textContent = firstActive.textContent + ' ▼';
    }

    sidebarButton.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    document.querySelectorAll('.sidebar a').forEach(link => {
      link.addEventListener('click', () => {
        sidebar.classList.remove('open');
      });
    });
  }

});
