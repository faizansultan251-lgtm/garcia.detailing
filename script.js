// Navbar Scroll Effect
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Mobile Menu Toggle logic will go here
const hamburger = document.getElementById('hamburger');

// Animation on scroll observer logic
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-fade-in-up');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.observe-me').forEach(el => observer.observe(el));

// Before & After Slider Logic
const slider = document.getElementById('compare-slider');
const sliderImgAfter = document.querySelector('.slider-img-after');
const sliderHandle = document.querySelector('.slider-handle');

if (slider) {
  slider.addEventListener('input', (e) => {
    const value = e.target.value;
    sliderImgAfter.style.width = `${value}%`;
    sliderHandle.style.left = `${value}%`;
  });
}

// Mobile Menu
const body = document.body;

// Create Mobile Nav Overlay element
const mobileNav = document.createElement('div');
mobileNav.className = 'mobile-nav-overlay';
mobileNav.innerHTML = `
  <a href="#services" class="mobile-link">Services</a>
  <a href="#gallery" class="mobile-link">Before & After</a>
  <a href="#quote" class="mobile-link">Instant Quote</a>
  <a href="#book" class="mobile-link text-glow">Book Now</a>
  <a href="tel:4109292828" class="mobile-link" style="color: var(--accent-blue); font-size: 1.5rem; margin-top: 2rem;">410.929.2828</a>
`;
document.body.appendChild(mobileNav);

hamburger.addEventListener('click', () => {
  mobileNav.classList.toggle('active');

  if (mobileNav.classList.contains('active')) {
    hamburger.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    body.style.overflow = 'hidden';
  } else {
    hamburger.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    body.style.overflow = '';
  }
});

// Close menu when clicking a link
const mobileLinks = document.querySelectorAll('.mobile-link');
mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('active');
    hamburger.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    body.style.overflow = '';
  });
});

// --- Instant Quote Calculator V2 Logic ---
const quoteState = {
  service: null,
  size: null,
  addons: new Set(),
};

const serviceData = {
  maintenance: {
    name: "Maintenance Wash",
    duration: "1 HR",
    requiresSize: true,
    basePrice: { "car": 80, "suv": 90, "truck-large": 100, "minivan": 110 },
    availableAddons: ["engine-bay", "extra-dirty", "headlight"]
  },
  interior: {
    name: "Interior Refresh",
    duration: "1 HR",
    requiresSize: true,
    basePrice: { "car": 100, "suv": 125, "truck-large": 150, "minivan": 175 },
    availableAddons: ["extra-dirty", "light-pet", "heavy-pet"]
  },
  express: {
    name: "Express Clean",
    duration: "2 HR",
    requiresSize: false,
    startingPrice: 170, // No size selection
    availableAddons: []
  },
  full: {
    name: "Full Detail",
    duration: "3 HR",
    requiresSize: true,
    basePrice: { "car": 250, "suv": 280, "truck-large": 310, "minivan": 325 },
    availableAddons: ["engine-bay", "extra-dirty", "headlight", "light-pet", "heavy-pet"]
  }
};

const addonDefinitions = {
  "engine-bay": { name: "Engine Bay Cleaning", price: 50, note: "" },
  "extra-dirty": { name: "Extra Dirty Fee", price: 50, note: "Final confirmation onsite" },
  "headlight": { name: "Headlight Restoration", price: 50, note: "" },
  "light-pet": { name: "Light Pet Hair Removal", price: 40, note: "Final confirmation onsite", conflictsWith: "heavy-pet" },
  "heavy-pet": { name: "Heavy Pet Hair Removal", price: 100, note: "Final confirmation onsite", conflictsWith: "light-pet" }
};

const DOM = {
  serviceCards: document.querySelectorAll('#service-options .selectable-card'),
  sizeCards: document.querySelectorAll('#size-options .selectable-card'),
  addonContainer: document.getElementById('addon-options'),
  step2: document.getElementById('step-2'),
  step3: document.getElementById('step-3'),
  sumService: document.getElementById('summary-service'),
  sumSizeRow: document.getElementById('summary-size-row'),
  sumSize: document.getElementById('summary-size'),
  sumAddons: document.getElementById('summary-addons'),
  sumDuration: document.getElementById('summary-duration'),
  quoteTotal: document.getElementById('quote-total'),
  bookCallBtn: document.getElementById('book-call-btn'),
  bookEmailBtn: document.getElementById('book-email-btn')
};

// Event Listeners
DOM.serviceCards.forEach(card => {
  card.addEventListener('click', () => {
    // UI Update
    DOM.serviceCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    
    // State Update
    const serviceKey = card.dataset.service;
    quoteState.service = serviceKey;
    
    // Reset size and addons on service change
    quoteState.size = null;
    quoteState.addons.clear();
    DOM.sizeCards.forEach(c => c.classList.remove('active'));
    
    updateUIForService();
    renderSummary();
  });
});

DOM.sizeCards.forEach(card => {
  card.addEventListener('click', () => {
    DOM.sizeCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    quoteState.size = card.dataset.size;
    renderSummary();
  });
});

function updateUIForService() {
  const data = serviceData[quoteState.service];
  
  if (data.requiresSize) {
    DOM.step2.classList.remove('hidden');
  } else {
    DOM.step2.classList.add('hidden');
  }
  
  // Render Addons
  DOM.addonContainer.innerHTML = '';
  if (data.availableAddons.length > 0) {
    DOM.step3.classList.remove('hidden');
    data.availableAddons.forEach(addonKey => {
      const def = addonDefinitions[addonKey];
      const addonEl = document.createElement('div');
      addonEl.className = 'addon-item';
      addonEl.dataset.addon = addonKey;
      addonEl.innerHTML = `
        <div class="addon-info">
          <span class="addon-name">${def.name}</span>
          ${def.note ? `<span class="addon-note">${def.note}</span>` : ''}
        </div>
        <div class="addon-price">+$${def.price}</div>
      `;
      
      addonEl.addEventListener('click', () => {
        handleAddonClick(addonKey, addonEl);
      });
      
      DOM.addonContainer.appendChild(addonEl);
    });
  } else {
    DOM.step3.classList.add('hidden');
  }
}

function handleAddonClick(addonKey, element) {
  const def = addonDefinitions[addonKey];
  
  if (quoteState.addons.has(addonKey)) {
    quoteState.addons.delete(addonKey);
    element.classList.remove('active');
  } else {
    // Check conflicts
    if (def.conflictsWith && quoteState.addons.has(def.conflictsWith)) {
      quoteState.addons.delete(def.conflictsWith);
      // Visually disable the conflicting element
      const conflictEl = document.querySelector(`.addon-item[data-addon="${def.conflictsWith}"]`);
      if (conflictEl) conflictEl.classList.remove('active');
    }
    
    quoteState.addons.add(addonKey);
    element.classList.add('active');
  }
  renderSummary();
}

function renderSummary() {
  if (!quoteState.service) return;
  const data = serviceData[quoteState.service];
  
  DOM.sumService.textContent = data.name;
  DOM.sumDuration.textContent = data.duration;
  
  if (data.requiresSize) {
    DOM.sumSizeRow.classList.remove('hidden');
    // Display friendly name based on dataset
    if (quoteState.size) {
      const selectedCard = document.querySelector(`#size-options .selectable-card[data-size="${quoteState.size}"] h4`);
      DOM.sumSize.textContent = selectedCard ? selectedCard.textContent : quoteState.size;
    } else {
      DOM.sumSize.textContent = "Please select";
    }
  } else {
    DOM.sumSizeRow.classList.add('hidden');
  }
  
  DOM.sumAddons.innerHTML = '';
  let addonsTotal = 0;
  if (quoteState.addons.size === 0) {
    DOM.sumAddons.innerHTML = '<li class="empty-addon">None</li>';
  } else {
    quoteState.addons.forEach(key => {
      const def = addonDefinitions[key];
      addonsTotal += def.price;
      const li = document.createElement('li');
      li.textContent = `${def.name} (+$${def.price})`;
      DOM.sumAddons.appendChild(li);
    });
  }
  
  // Calculate Grand Total
  let isComplete = false;
  
  if (!data.requiresSize) {
    DOM.quoteTotal.textContent = `Starting at $${data.startingPrice + addonsTotal}`;
    isComplete = true; // Always ready to book
  } else {
    if (quoteState.size) {
      const basePrice = data.basePrice[quoteState.size];
      DOM.quoteTotal.textContent = `$${basePrice + addonsTotal}`;
      isComplete = true;
    } else {
      DOM.quoteTotal.innerHTML = `<span style="font-size: 1.2rem; opacity: 0.6">Select size to see price</span>`;
    }
  }
  
  if (isComplete) {
    DOM.bookCallBtn.classList.remove('disabled');
    DOM.bookCallBtn.disabled = false;
    DOM.bookEmailBtn.classList.remove('disabled');
    DOM.bookEmailBtn.disabled = false;
  } else {
    DOM.bookCallBtn.classList.add('disabled');
    DOM.bookCallBtn.disabled = true;
    DOM.bookEmailBtn.classList.add('disabled');
    DOM.bookEmailBtn.disabled = true;
  }
}

// Phone Pass-through
if (DOM.bookCallBtn) {
  DOM.bookCallBtn.addEventListener('click', () => {
    if (DOM.bookCallBtn.disabled) return;
    window.location.href = "tel:4109292828";
  });
}

// Email Pass-through
if (DOM.bookEmailBtn) {
  DOM.bookEmailBtn.addEventListener('click', () => {
    if (DOM.bookEmailBtn.disabled) return;
    
    const data = serviceData[quoteState.service];
    let sizeText = "N/A";
    if (quoteState.size) {
      sizeText = document.querySelector(`#size-options .selectable-card[data-size="${quoteState.size}"] h4`).textContent;
    }
    
    let addonsArr = [];
    quoteState.addons.forEach(k => addonsArr.push(addonDefinitions[k].name));
    const addonsText = addonsArr.length > 0 ? addonsArr.join(", ") : "None";
    
    const totalText = DOM.quoteTotal.textContent;
    
    const subject = encodeURIComponent("New Booking Request - " + data.name);
    const body = encodeURIComponent(
      `Hi Garcia Detailing,\n\nI’d like to request an appointment based on my instant quote:\n\n` +
      `Service: ${data.name}\n` +
      `Vehicle Size: ${sizeText}\n` +
      `Add-Ons: ${addonsText}\n` +
      `Estimated Duration: ${data.duration}\n` +
      `Estimated Total: ${totalText}\n\n` +
      `Please let me know your availability.\n\nThank you!`
    );
    
    window.location.href = `mailto:info@garciadetailing.com?subject=${subject}&body=${body}`;
  });
}

// --- Service Modals Logic ---
const modalTriggers = document.querySelectorAll('.modal-trigger');
const modals = document.querySelectorAll('.modal-overlay');
const closeModals = document.querySelectorAll('.close-modal');

modalTriggers.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = btn.getAttribute('data-target');
    const modal = document.getElementById(targetId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });
});

closeModals.forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.modal-overlay').classList.remove('active');
    document.body.style.overflow = '';
  });
});

modals.forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
});

// --- Chatbot Logic ---
const chatbotTrigger = document.querySelector('.chatbot-trigger');
const chatbotWindow = document.querySelector('.chatbot-window');
const closeChat = document.querySelector('.close-chat');
const chatChips = document.querySelectorAll('.chat-chip');
const chatMessages = document.querySelector('.chatbot-messages');

if (chatbotTrigger && chatbotWindow) {
  chatbotTrigger.addEventListener('click', () => {
    chatbotWindow.classList.toggle('active');
  });

  closeChat.addEventListener('click', () => {
    chatbotWindow.classList.remove('active');
  });

  chatChips.forEach(chip => {
    chip.addEventListener('click', () => {
      // Add user message
      const userMsg = document.createElement('div');
      userMsg.classList.add('msg', 'user');
      userMsg.textContent = chip.textContent;
      chatMessages.appendChild(userMsg);

      // Auto-scroll
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Simulate bot typing delay
      setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.classList.add('msg', 'bot');

        if (chip.textContent === 'View Services') {
          botMsg.innerHTML = 'We offer 4 main packages: Maintenance Wash ($80+), Interior Refresh ($100+), Express Clean ($170+), and Full Detail ($250+). Check the Services section for details!';
        } else if (chip.textContent === 'Pricing Help') {
          botMsg.innerHTML = 'Our pricing depends on your vehicle size and the condition. Use our Instant Quote tool above to get an accurate estimate!';
        } else {
          botMsg.innerHTML = 'Thanks! A team member will be with you shortly or you can always call us at 410.929.2828.';
        }

        chatMessages.appendChild(botMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 800);
    });
  });
}

// --- Gallery Logic (Filtering) ---
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active class from all
    filterBtns.forEach(b => b.classList.remove('active'));
    // Add active class to clicked
    btn.classList.add('active');

    const filterValue = btn.getAttribute('data-filter');

    galleryItems.forEach(item => {
      if (item.getAttribute('data-category').includes(filterValue)) {
        item.style.display = 'block';
        setTimeout(() => {
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        }, 50);
      } else {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.8)';
        setTimeout(() => {
          item.style.display = 'none';
        }, 300);
      }
    });
  });
});
