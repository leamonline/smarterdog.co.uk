/**
 * Lightbox Module
 * Gallery image viewer with keyboard navigation
 * @module lightbox
 */

let isLightboxInitialized = false;
let lightboxElement = null;
let currentIndex = 0;
let galleryImages = [];

/**
 * Initialize lightbox
 */
export function initLightbox() {
  if (isLightboxInitialized) {
    console.warn('Lightbox already initialized');
    return;
  }

  try {
    createLightboxHTML();
    setupGalleryImages();
    setupEventListeners();

    isLightboxInitialized = true;
    console.log('Lightbox initialized successfully');
  } catch (error) {
    console.error('Failed to initialize lightbox:', error);
  }
}

/**
 * Create lightbox HTML structure
 */
function createLightboxHTML() {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.id = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Image gallery lightbox');

  lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
    <button class="lightbox-nav prev" aria-label="Previous image">&lsaquo;</button>
    <button class="lightbox-nav next" aria-label="Next image">&rsaquo;</button>
    <div class="lightbox-content">
      <img src="" alt="" id="lightbox-image">
    </div>
    <div class="lightbox-caption" id="lightbox-caption"></div>
  `;

  document.body.appendChild(lightbox);
  lightboxElement = lightbox;
}

/**
 * Setup gallery images
 */
function setupGalleryImages() {
  const gallerySection = document.querySelector('.gallery');
  if (!gallerySection) {
    console.log('Gallery section not found');
    return;
  }

  const galleryItems = gallerySection.querySelectorAll('.gallery-item img');
  galleryImages = Array.from(galleryItems).map((img, index) => ({
    src: img.src,
    alt: img.alt,
    index
  }));

  // Add click handlers to gallery images
  galleryItems.forEach((img, index) => {
    img.parentElement.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(index);
    });

    // Make images keyboard accessible
    img.parentElement.setAttribute('tabindex', '0');
    img.parentElement.setAttribute('role', 'button');
    img.parentElement.setAttribute('aria-label', `View ${img.alt}`);

    // Keyboard handler for gallery items
    img.parentElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });

  console.log(`Setup ${galleryImages.length} gallery images`);
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  if (!lightboxElement) return;

  // Close button
  const closeBtn = lightboxElement.querySelector('.lightbox-close');
  closeBtn.addEventListener('click', closeLightbox);

  // Navigation buttons
  const prevBtn = lightboxElement.querySelector('.prev');
  const nextBtn = lightboxElement.querySelector('.next');

  prevBtn.addEventListener('click', showPrevious);
  nextBtn.addEventListener('click', showNext);

  // Click outside to close
  lightboxElement.addEventListener('click', (e) => {
    if (e.target === lightboxElement) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', handleKeyboard);
}

/**
 * Handle keyboard events
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeyboard(e) {
  if (!lightboxElement || !lightboxElement.classList.contains('active')) {
    return;
  }

  switch (e.key) {
    case 'Escape':
      closeLightbox();
      break;
    case 'ArrowLeft':
      showPrevious();
      break;
    case 'ArrowRight':
      showNext();
      break;
  }
}

/**
 * Open lightbox
 * @param {number} index - Image index
 */
function openLightbox(index) {
  if (!lightboxElement || galleryImages.length === 0) return;

  currentIndex = index;
  updateLightboxImage();

  lightboxElement.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent scrolling

  // Focus close button for accessibility
  const closeBtn = lightboxElement.querySelector('.lightbox-close');
  setTimeout(() => closeBtn.focus(), 100);

  // Track event
  if (window.gtag) {
    window.gtag('event', 'gallery_image_view', {
      event_category: 'engagement',
      event_label: galleryImages[index].alt
    });
  }
}

/**
 * Close lightbox
 */
function closeLightbox() {
  if (!lightboxElement) return;

  lightboxElement.classList.remove('active');
  document.body.style.overflow = ''; // Restore scrolling
}

/**
 * Show previous image
 */
function showPrevious() {
  currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
  updateLightboxImage();
}

/**
 * Show next image
 */
function showNext() {
  currentIndex = (currentIndex + 1) % galleryImages.length;
  updateLightboxImage();
}

/**
 * Update lightbox image
 */
function updateLightboxImage() {
  if (!lightboxElement || galleryImages.length === 0) return;

  const img = lightboxElement.querySelector('#lightbox-image');
  const caption = lightboxElement.querySelector('#lightbox-caption');

  const currentImage = galleryImages[currentIndex];

  img.src = currentImage.src;
  img.alt = currentImage.alt;
  caption.textContent = currentImage.alt;

  // Update navigation button visibility
  const prevBtn = lightboxElement.querySelector('.prev');
  const nextBtn = lightboxElement.querySelector('.next');

  if (galleryImages.length === 1) {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
  } else {
    prevBtn.style.display = '';
    nextBtn.style.display = '';
  }
}

/**
 * Cleanup lightbox
 */
export function cleanupLightbox() {
  if (lightboxElement) {
    lightboxElement.remove();
    lightboxElement = null;
  }

  document.removeEventListener('keydown', handleKeyboard);
  document.body.style.overflow = '';

  galleryImages = [];
  currentIndex = 0;
  isLightboxInitialized = false;
}

export default {
  initLightbox,
  cleanupLightbox
};
