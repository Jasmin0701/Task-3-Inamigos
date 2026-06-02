import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  initLenis();
  initCursor();
  initStars();
  initGSAPAnimations();
  initServicesHover();
});

/* --- Lenis Smooth Scrolling --- */
let lenis;
function initLenis() {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Handle smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = this.getAttribute('href');
      if (target !== '#') {
        lenis.scrollTo(target);
      }
    });
  });
}

/* --- Custom Space Cursor --- */
function initCursor() {
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorRing = document.querySelector('.cursor-ring');
  
  // Completely disable custom cursor on touch devices to prevent sticking
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    if (cursorDot) cursorDot.style.display = 'none';
    if (cursorRing) cursorRing.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  const links = document.querySelectorAll('a, .btn-primary, .service-row, .marquee-item');

  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Dot follows instantly
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  // Ring follows with a slight delay for trailing effect
  function renderCursor() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Hover state
  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      cursorRing.classList.add('cursor-hover');
      cursorDot.style.opacity = '0';
    });
    link.addEventListener('mouseleave', () => {
      cursorRing.classList.remove('cursor-hover');
      cursorDot.style.opacity = '1';
    });
  });
}

/* --- GSAP Animations --- */
function initGSAPAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // Hero Title Intro Animation
  gsap.fromTo('.title-line', 
    { y: '100%', opacity: 0 }, 
    { y: '0%', opacity: 1, duration: 1.5, stagger: 0.2, ease: "power4.out", delay: 0.5 }
  );
  gsap.fromTo('.hero-subtitle, .scroll-indicator', 
    { opacity: 0 }, 
    { opacity: 1, duration: 1.5, ease: "power2.out", delay: 1.5 }
  );

  // Earth Rotation and Scroll Parallax
  gsap.to('.earth-img', {
    rotation: 360,
    ease: "none",
    duration: 200,
    repeat: -1
  });

  gsap.to('.hero-earth', {
    yPercent: 30,
    ease: "none",
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  // Fade ins for standard sections
  const reveals = gsap.utils.toArray('.gs-reveal');
  reveals.forEach(reveal => {
    gsap.fromTo(reveal, 
      { y: 50, opacity: 0 },
      { 
        y: 0, opacity: 1, 
        duration: 1, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: reveal,
          start: "top 85%"
        }
      }
    );
  });
}

/* --- Interactive Services Setup --- */
function initServicesHover() {
  const rows = document.querySelectorAll('.service-row');
  rows.forEach(row => {
    const bgUrl = row.getAttribute('data-bg');
    const hoverBg = row.querySelector('.service-hover-bg');
    if (bgUrl && hoverBg) {
      hoverBg.style.backgroundImage = `url('${bgUrl}')`;
    }
  });
}

/* --- Canvas Star Particle System --- */
function initStars() {
  const canvas = document.getElementById('star-canvas');
  const ctx = canvas.getContext('2d');
  let width, height;
  let stars = [];
  const numStars = 150;
  
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  
  window.addEventListener('resize', resize);
  resize();

  class Star {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.z = Math.random() * 2 + 0.1; 
      this.radius = Math.random() * 1.5 + 0.5;
      this.opacity = Math.random();
      this.opacitySpeed = (Math.random() * 0.02) - 0.01;
    }
    
    update(scrollOffset) {
      // Twinkle
      this.opacity += this.opacitySpeed;
      if(this.opacity > 1 || this.opacity < 0.1) {
        this.opacitySpeed = -this.opacitySpeed;
      }
      
      // Parallax effect based on scroll (using z depth)
      let visualY = this.y - (scrollOffset * 0.1 / this.z);
      
      // Wrap around
      if (visualY < -10) {
         this.y = height + (scrollOffset * 0.1 / this.z) + 10;
         this.x = Math.random() * width;
      } else if (visualY > height + 10) {
         this.y = -10 + (scrollOffset * 0.1 / this.z);
         this.x = Math.random() * width;
      }
      
      // Draw
      ctx.beginPath();
      ctx.arc(this.x, visualY, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(this.opacity)})`;
      ctx.fill();
    }
  }

  for(let i = 0; i < numStars; i++) {
    stars.push(new Star());
  }
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Slight nebula gradient overlay on canvas
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, height);
    gradient.addColorStop(0, 'rgba(94, 75, 199, 0.03)');
    gradient.addColorStop(1, 'rgba(2, 2, 4, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // We get scroll from Lenis if possible, else window
    let scrollY = window.scrollY;
    
    stars.forEach(star => {
      star.update(scrollY);
    });
    
    requestAnimationFrame(animate);
  }
  
  animate();
}
