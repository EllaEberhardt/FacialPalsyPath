
async function loadIncludes() {
 // Find every element that has a data-include attribute
const targets = document.querySelectorAll("[data-include]");


for (const el of targets) {
   // Get the file path from the data-include attribute
const filePath = el.getAttribute("data-include");


   // Ask the browser to fetch (load) that file
const response = await fetch(filePath);


   // Turn the response into text (HTML code)
const html = await response.text();


   // Put the HTML inside this element
el.innerHTML = html;
}
}


// Run the function when the page loads
loadIncludes();

// Add scroll event listener to update active link in sidebar

document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.page-section');
  const navLinks = document.querySelectorAll('.sidebar a');

  const options = {
    root: null, // use viewport
    rootMargin: '-50% 0px -50% 0px', // check at center of screen
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Remove active class from all links
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Add active class to the link that matches the current section ID
        const activeId = entry.target.getAttribute('id');
        document.querySelector(`.sidebar a[href="#${activeId}"]`).classList.add('active');
      }
    });
  }, options);

  sections.forEach(section => observer.observe(section));
});

/////////// Sidebar turn to toggle on mobile //////////

document.addEventListener('DOMContentLoaded', () => {
  const sidebarButton = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');

  // Toggle open/close
  sidebarButton.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // Close after clicking a link
  const sidebarLinks = document.querySelectorAll('.sidebar a');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      sidebar.classList.remove('open');
    });
  });
});

//shows active page
const sidebarButton = document.getElementById('sidebarToggle');
const sections = document.querySelectorAll('.page-section');
const navLinks = document.querySelectorAll('.sidebar a');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {

      // Remove active from all links
      navLinks.forEach(link => link.classList.remove('active'));

      const activeId = entry.target.getAttribute('id');

      // Find matching link
      const activeLink = document.querySelector(`.sidebar a[href="#${activeId}"]`);

      if (activeLink) {
        activeLink.classList.add('active');

        // ✅ Update button text to match active section
        sidebarButton.textContent = activeLink.textContent;
      }
    }
  });
}, {
  root: null,
  rootMargin: '-50% 0px -50% 0px',
  threshold: 0
});

sections.forEach(section => observer.observe(section));

const firstActive = document.querySelector('.sidebar a.active');
if (firstActive) {
  sidebarButton.textContent = firstActive.textContent;
}

sidebarButton.textContent = activeLink.textContent + ' ▼';