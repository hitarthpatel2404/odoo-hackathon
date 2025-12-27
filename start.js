function goLogin() {
  // Add a slight delay for ripple effect if you add one later
  window.location.href = "login.html";
}

// Optional: Add scroll reveal animations
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.feature-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.style.opacity = 1;
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    // Set initial state for JS animation
    card.style.opacity = 0;
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.6s ease-out';
    observer.observe(card);
  });
});