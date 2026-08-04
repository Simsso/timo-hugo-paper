document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const viewport = carousel.querySelector('[data-carousel-viewport]');
  const slides = Array.from(carousel.querySelectorAll('[data-carousel-slide]'));
  const controls = carousel.querySelector('[data-carousel-controls]');
  const previous = carousel.querySelector('[data-carousel-previous]');
  const next = carousel.querySelector('[data-carousel-next]');
  const dots = carousel.querySelector('[data-carousel-dots]');
  const counter = carousel.querySelector('[data-carousel-counter]');

  if (!viewport || slides.length < 2) return;

  let activeIndex = 0;
  let ticking = false;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  carousel.classList.add('image-carousel--enhanced');
  controls.hidden = false;

  const dotButtons = slides.map((slide, index) => {
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${index + 1} of ${slides.length}`);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'image-carousel__dot';
    button.setAttribute('aria-label', `Show image ${index + 1} of ${slides.length}`);
    button.addEventListener('click', () => goTo(index));
    dots.append(button);
    return button;
  });

  function update(index) {
    activeIndex = Math.max(0, Math.min(index, slides.length - 1));
    previous.disabled = activeIndex === 0;
    next.disabled = activeIndex === slides.length - 1;
    counter.textContent = `${activeIndex + 1} / ${slides.length}`;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      slide.toggleAttribute('inert', !isActive);
    });
    dotButtons.forEach((dot, dotIndex) => {
      if (dotIndex === activeIndex) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }

  function goTo(index) {
    const target = slides[Math.max(0, Math.min(index, slides.length - 1))];
    const viewportLeft = viewport.getBoundingClientRect().left;
    const targetLeft = viewport.scrollLeft + target.getBoundingClientRect().left - viewportLeft;
    viewport.scrollTo({
      left: targetLeft,
      behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
    });
  }

  function updateFromScroll() {
    const viewportLeft = viewport.getBoundingClientRect().left;
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.getBoundingClientRect().left - viewportLeft);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    update(nearestIndex);
    ticking = false;
  }

  viewport.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateFromScroll);
      ticking = true;
    }
  }, { passive: true });

  viewport.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(activeIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(activeIndex + 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      goTo(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      goTo(slides.length - 1);
    }
  });

  previous.addEventListener('click', () => goTo(activeIndex - 1));
  next.addEventListener('click', () => goTo(activeIndex + 1));
  update(0);
});
