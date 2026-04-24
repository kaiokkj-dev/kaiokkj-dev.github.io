const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-pill a[href^='#']");
const revealElements = document.querySelectorAll(".card, .edu-card, .sobre-wrapper, .contact-card");

window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        if (scrollY >= sectionTop) {
        current = section.getAttribute("id");
    }
});
    navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
    }
});
})
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
        entry.target.classList.add("reveal-visible");
        revealObserver.unobserve(entry.target); // anima só 1x
        }
});
}, {
threshold: 0.2,
rootMargin: "-80px 0px -10% 0px"
});
revealElements.forEach(el => {
el.classList.add("reveal");
revealObserver.observe(el);
});
/* Tema */
const themeBtn = document.getElementById("theme-toggle");
function applyTheme(theme) {
  document.body.classList.remove("dark", "light");
  document.body.classList.add(theme);
  localStorage.setItem("theme", theme);
  updateThemeIcon(theme);
}
function updateThemeIcon(theme) {
  if (!themeBtn) return;
  themeBtn.innerHTML = `
    <i data-lucide="${theme === "dark" ? "sun" : "moon"}"></i>
  `;
  lucide.createIcons();
}
const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);
if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const newTheme = document.body.classList.contains("dark") ? "light" : "dark";
    applyTheme(newTheme);
  });
}