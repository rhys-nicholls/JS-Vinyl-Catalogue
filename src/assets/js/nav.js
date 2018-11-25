/* globals document */
const nav = document.querySelector('.nav-main');
const navToggle = document.querySelector('.nav-toggle');

navToggle.addEventListener('click', () => {
  nav.classList.toggle('nav-active');
});
