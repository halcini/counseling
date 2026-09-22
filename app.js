/**
 * LIVSSTÖD & CEREMONIER — Interaktiv Motor
 * Hanterar bokningsguide, priskalkylator, checklistor, filter, modaler & mjuka scroll-animationer
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  initTriageQuickSelect();
  initWizard();
  initChecklists();
  initReviewFilters();
  initModals();
  initSmoothScroll();
  initScrollAnimations();
});

/* ==========================================================================
   1. Tema-hantering (Ljust / Mörkt / Varmt)
   ========================================================================== */
function initTheme() {
  const themeBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('site-theme') || 'light';
  
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcon(true);
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('site-theme', 'light');
        updateThemeIcon(false);
        showToast('Ljust läge aktiverat');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('site-theme', 'dark');
        updateThemeIcon(true);
        showToast('Mörkt läge aktiverat');
      }
    });
  }
}

function updateThemeIcon(isDark) {
  const icon = document.querySelector('#themeToggleBtn svg');
  if (!icon) return;
  if (isDark) {
    icon.innerHTML = '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
  } else {
    icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
  }
}

/* ==========================================================================
   2. Mobilnavigering
   ========================================================================== */
function initMobileNav() {
  const toggle = document.getElementById('mobileMenuToggle');
  const menu = document.getElementById('navMenu');
  
  if (toggle && menu) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.classList.toggle('active-mobile');
      toggle.classList.toggle('active', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('active-mobile');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !menu.contains(e.target) && menu.classList.contains('active-mobile')) {
        menu.classList.remove('active-mobile');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

/* ==========================================================================
   3. Snabbval från Hero (Triage)
   ========================================================================== */
function initTriageQuickSelect() {
  const triageButtons = document.querySelectorAll('.triage-option');
  triageButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetService = btn.getAttribute('data-service');
      const wizardSection = document.getElementById('bokning');
      
      if (wizardSection) {
        const headerOffset = 90;
        const elementPosition = wizardSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        const radio = document.querySelector(`input[name="wizard-service"][value="${targetService}"]`);
        if (radio) {
          radio.checked = true;
          updateWizardSelectionStyle();
          updateSummary();
        }
      }
    });
  });
}

/* ==========================================================================
   4. Multi-Step Boknings- & Behovsguide (Wizard)
   ========================================================================== */
let currentStep = 1;
const totalSteps = 4;

const bookingData = {
  service: 'familjeradgivning',
  serviceName: 'Familje- & Parrelation',
  format: 'Digitalt (Online via video)',
  urgency: 'Standard (Inom 1-2 veckor)',
  notes: '',
  name: '',
  email: '',
  phone: '',
  estimatedPrice: '1 200 kr / samtal'
};

const servicePricingMap = {
  'familjeradgivning': { name: 'Familje- & Parrelation', price: '1 200 kr / session' },
  'vigsel': { name: 'Borgerlig Vigsel & Ceremoni', price: 'Från 1 800 kr' },
  'social': { name: 'Social Rådgivning & Stöd', price: '950 kr / timme' },
  'kombinerad': { name: 'Helhetspaket (Vigsel + Parsamtal)', price: '3 400 kr' }
};

function initWizard() {
  const nextBtn = document.getElementById('wizardNextBtn');
  const prevBtn = document.getElementById('wizardPrevBtn');
  const serviceCards = document.querySelectorAll('.wizard-select-card');

  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      const radio = card.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        updateWizardSelectionStyle();
        updateSummary();
      }
    });
  });

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (validateStep(currentStep)) {
        if (currentStep < totalSteps) {
          currentStep++;
          goToStep(currentStep);
        } else {
          submitBooking();
        }
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        goToStep(currentStep);
      }
    });
  }
}

function updateWizardSelectionStyle() {
  document.querySelectorAll('.wizard-select-card').forEach(c => {
    const radio = c.querySelector('input[type="radio"]');
    if (radio && radio.checked) {
      c.classList.add('selected');
      if (radio.name === 'wizard-service') {
        bookingData.service = radio.value;
        bookingData.serviceName = servicePricingMap[radio.value]?.name || radio.value;
        bookingData.estimatedPrice = servicePricingMap[radio.value]?.price || '-';
      }
      if (radio.name === 'wizard-format') {
        bookingData.format = radio.value;
      }
      if (radio.name === 'wizard-urgency') {
        bookingData.urgency = radio.value;
      }
    } else {
      c.classList.remove('selected');
    }
  });
}

function goToStep(step) {
  document.querySelectorAll('.wizard-step-pane').forEach((pane, idx) => {
    pane.classList.toggle('active', idx + 1 === step);
  });

  document.querySelectorAll('.step-indicator').forEach((ind, idx) => {
    const stepNum = idx + 1;
    ind.classList.remove('active', 'completed');
    if (stepNum === step) {
      ind.classList.add('active');
    } else if (stepNum < step) {
      ind.classList.add('completed');
    }
  });

  const prevBtn = document.getElementById('wizardPrevBtn');
  const nextBtn = document.getElementById('wizardNextBtn');

  if (prevBtn) {
    prevBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
  }

  if (nextBtn) {
    if (step === totalSteps) {
      nextBtn.textContent = 'Skicka Bokningsförfrågan';
      nextBtn.classList.add('btn-accent');
      nextBtn.classList.remove('btn-primary');
      updateSummary();
    } else {
      nextBtn.textContent = 'Nästa steg';
      nextBtn.classList.add('btn-primary');
      nextBtn.classList.remove('btn-accent');
    }
  }
}

function validateStep(step) {
  if (step === 1) {
    const selected = document.querySelector('input[name="wizard-service"]:checked');
    if (!selected) {
      showToast('Vänligen välj ett tjänsteområde', 'warning');
      return false;
    }
  }

  if (step === 3) {
    const notes = document.getElementById('wizardNotes');
    if (notes) {
      bookingData.notes = notes.value;
    }
  }

  if (step === 4) {
    const name = document.getElementById('wizardName');
    const email = document.getElementById('wizardEmail');
    const phone = document.getElementById('wizardPhone');

    if (!name || !name.value.trim()) {
      showToast('Vänligen fyll i ditt namn', 'warning');
      name?.focus();
      return false;
    }

    if (!email || !email.value.trim() || !email.value.includes('@')) {
      showToast('Vänligen ange en giltig e-postadress', 'warning');
      email?.focus();
      return false;
    }

    bookingData.name = name.value.trim();
    bookingData.email = email.value.trim();
    bookingData.phone = phone ? phone.value.trim() : '';
  }

  return true;
}

function updateSummary() {
  const sService = document.getElementById('summaryService');
  const sFormat = document.getElementById('summaryFormat');
  const sUrgency = document.getElementById('summaryUrgency');
  const sPrice = document.getElementById('summaryPrice');

  if (sService) sService.textContent = bookingData.serviceName;
  if (sFormat) sFormat.textContent = bookingData.format;
  if (sUrgency) sUrgency.textContent = bookingData.urgency;
  if (sPrice) sPrice.textContent = bookingData.estimatedPrice;
}

function submitBooking() {
  const wizardBody = document.querySelector('.wizard-body');
  const wizardFooter = document.querySelector('.wizard-footer');
  
  if (wizardBody && wizardFooter) {
    wizardFooter.style.display = 'none';
    wizardBody.innerHTML = `
      <div style="text-align: center; padding: 3rem 1rem;">
        <div style="width: 72px; height: 72px; background: var(--sage-100); color: var(--sage-700); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem auto;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h3 style="font-size: 1.8rem; margin-bottom: 0.8rem;">Tack för din förfrågan, ${bookingData.name}!</h3>
        <p style="font-size: 1.05rem; color: var(--text-secondary); max-width: 540px; margin: 0 auto 1.8rem auto;">
          Vi har mottagit dina uppgifter gällande <strong>${bookingData.serviceName}</strong>. Vi återkommer personligen inom <strong>24 timmar</strong> via ${bookingData.email} för att bekräfta tid och detaljer.
        </p>
        <div style="display: inline-flex; gap: 1rem;">
          <button class="btn btn-secondary" onclick="location.reload()">Gör ny förfrågan</button>
          <a href="#artiklar" class="btn btn-primary">Läs våra förberedande guider</a>
        </div>
      </div>
    `;
    showToast('Bokningsförfrågan skickad!', 'success');
  }
}

/* ==========================================================================
   5. Interaktiva Checklistor & Guider (med LocalStorage)
   ========================================================================== */
function initChecklists() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-content-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const target = btn.getAttribute('data-tab');
      const activePanel = document.getElementById(target);
      if (activePanel) {
        activePanel.classList.add('active');
      }
    });
  });

  const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
  checkboxes.forEach(box => {
    const storageKey = 'check_' + box.id;
    const isChecked = localStorage.getItem(storageKey) === 'true';
    if (isChecked) {
      box.checked = true;
      box.closest('.checklist-item')?.classList.add('checked');
    }

    box.addEventListener('change', () => {
      localStorage.setItem(storageKey, box.checked);
      box.closest('.checklist-item')?.classList.toggle('checked', box.checked);
      if (box.checked) {
        showToast('Punkt avklarad');
      }
    });
  });
}

/* ==========================================================================
   6. Recensionsfilter (Testimonials)
   ========================================================================== */
function initReviewFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const reviewCards = document.querySelectorAll('.review-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-category');

      reviewCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   7. Modaler för Djupare Tjänstedetaljer
   ========================================================================== */
const serviceModalData = {
  familjeradgivning: {
    title: 'Rådgivning för Familjer & Par',
    content: `
      <p style="margin-bottom: 1rem;">Familjelivet bjuder på fantastiska stunder men kan också innebära påfrestande faser, kommunikationslåsningar eller kriser vid förändrade livsförhållanden.</p>
      <h4 style="margin-bottom: 0.5rem; font-size: 1.1rem;">Vad vi arbetar med:</h4>
      <ul style="list-style: disc; margin-left: 1.5rem; margin-bottom: 1.5rem; color: var(--text-secondary);">
        <li>Konstruktiv kommunikation och konflikthantering</li>
        <li>Småbarnsårens utmaningar och föräldrasamarbete</li>
        <li>Återuppbyggnad av tillit och närhet</li>
        <li>Hjälp vid separation och samförstånd kring barnens bästa</li>
      </ul>
      <p style="font-size: 0.9rem; color: var(--text-muted);">Samtalen sker under strikt sekretess och tystnadsplikt i en trygg och neutral miljö.</p>
    `
  },
  vigsel: {
    title: 'Borgerlig Vigselförrättare',
    content: `
      <p style="margin-bottom: 1rem;">Som officiellt förordnad borgerlig vigselförrättare skapar jag ceremonier som speglar er kärlek, era personligheter och era värderingar.</p>
      <h4 style="margin-bottom: 0.5rem; font-size: 1.1rem;">Vigselns delar:</h4>
      <ul style="list-style: disc; margin-left: 1.5rem; margin-bottom: 1.5rem; color: var(--text-secondary);">
        <li>Vägledning kring hindersprövning och formella intyg hos Skatteverket</li>
        <li>Val av vigseltext: Från det klassiska korta protokollet till skräddarsydda personliga löften</li>
        <li>Platsval: Skärgårdsklippan, trädgården, festlokalen eller rådhuset</li>
        <li>Möjlighet till förberedande parsamtal inför äktenskapet</li>
      </ul>
    `
  },
  social: {
    title: 'Professionell Social Rådgivning',
    content: `
      <p style="margin-bottom: 1rem;">När samhällets system känns ogenomträngliga eller när en livskris inträffar finns jag där med socionomkompetens för att ge struktur, vägledning och stöd.</p>
      <h4 style="margin-bottom: 0.5rem; font-size: 1.1rem;">Områden vi stöttar inom:</h4>
      <ul style="list-style: disc; margin-left: 1.5rem; margin-bottom: 1.5rem; color: var(--text-secondary);">
        <li>Stöd vid kontakt med Socialtjänst, Försäkringskassa och Vård</li>
        <li>Rättighetsfrågor, bistånd, LSS och ekonomisk vägledning</li>
        <li>Krisbearbetning och anhörigstöd vid sjukdom eller beroende</li>
        <li>Konkreta handlingsplaner för långsiktig trygghet</li>
      </ul>
    `
  }
};

function initModals() {
  const modalOverlay = document.getElementById('serviceModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const closeBtn = document.getElementById('modalCloseBtn');

  document.querySelectorAll('.open-service-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceKey = btn.getAttribute('data-service');
      const data = serviceModalData[serviceKey];
      if (data && modalOverlay && modalTitle && modalBody) {
        modalTitle.textContent = data.title;
        modalBody.innerHTML = data.content;
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const closeModal = () => {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
}

/* ==========================================================================
   8. Toast Notiser
   ========================================================================== */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>';
  if (type === 'warning') {
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
  }

  toast.innerHTML = `${iconSvg} <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/* ==========================================================================
   9. Mjuk Skroll med Header-Offset & Aktiv Länk-indikator
   ========================================================================== */
function initSmoothScroll() {
  const navLinks = document.querySelectorAll('a[href^="#"]');
  const sections = document.querySelectorAll('section[id]');

  navLinks.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 85;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

/* ==========================================================================
   10. Animerade Övergångar vid Scroll (Scroll Reveal Observer)
   ========================================================================== */
function initScrollAnimations() {
  // Samla alla sektionselement och kort för mjuk intoning
  const targetSelectors = [
    '.section-header',
    '.pillar-card',
    '.timeline-step',
    '.synergy-card-quote',
    '.wizard-wrapper',
    '.pricing-card',
    '.checklist-card',
    '.about-photo-card',
    '.about-text-content',
    '.review-card',
    '.contact-info-card',
    '#quickContactForm'
  ];

  const elementsToAnimate = document.querySelectorAll(targetSelectors.join(', '));
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  // Tilldela reveal-klasser endast till element under folden för att eliminera CLS
  elementsToAnimate.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const isAboveTheFold = rect.top < viewportHeight;

    if (isAboveTheFold) {
      el.classList.add('is-visible');
      return;
    }

    if (!el.classList.contains('reveal-on-scroll')) {
      el.classList.add('reveal-on-scroll');

      // Tilldela fördröjning för element i samma rutnät
      const parentGrid = el.closest('.pillars-grid, .pricing-grid, .reviews-grid, .timeline-flow');
      if (parentGrid) {
        const siblings = Array.from(parentGrid.children);
        const childIndex = siblings.indexOf(el.closest('.timeline-step') || el);
        if (childIndex >= 0) {
          el.classList.add(`reveal-delay-${(childIndex % 4) + 1}`);
        }
      }
    }
  });

  // IntersectionObserver för element som scrollas in
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    elementsToAnimate.forEach(el => {
      if (el.classList.contains('reveal-on-scroll')) {
        revealObserver.observe(el);
      }
    });
  } else {
    // Fallback om webbläsaren inte stöder IntersectionObserver
    elementsToAnimate.forEach(el => el.classList.add('is-visible'));
  }
}
