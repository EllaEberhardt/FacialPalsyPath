
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

