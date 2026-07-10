/**
 * SAAN homepage GSAP scroll animations
 */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray('.gs-reveal').forEach((elem) => {
    gsap.fromTo(
      elem,
      { y: 50, autoAlpha: 0 },
      {
        duration: 1,
        y: 0,
        autoAlpha: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: elem,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  });

  gsap.utils.toArray('.card-parallax-container').forEach((container) => {
    const img = container.querySelector('.parallax-img');
    if (!img) return;

    gsap.to(img, {
      y: '20%',
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  gsap.fromTo(
    '.gs-reveal-promotional',
    { y: 80, autoAlpha: 0, scale: 0.98 },
    {
      duration: 1.2,
      y: 0,
      autoAlpha: 1,
      scale: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.gs-reveal-promotional',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
    }
  );
});
