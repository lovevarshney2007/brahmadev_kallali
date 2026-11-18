import { useEffect, useRef, useState } from 'react';

/**
 * HeroSlider - Accessible image carousel for the homepage
 * Supports auto-slide, manual controls, keyboard navigation, and touch swipe
 * Uses CSS transitions for smooth animations
 */
export default function HeroSlider({
  slides = [],
  autoPlay = true,
  autoPlayInterval = 5000,
  showArrows = true,
  showDots = true,
  pauseOnHover = true
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const autoPlayRef = useRef(null);
  const sliderRef = useRef(null);

  // Validate slides
  const validSlides = slides.filter(s => s.image && s.image.trim());
  const slideCount = validSlides.length;

  // Auto-play logic
  useEffect(() => {
    if (!autoPlay || slideCount <= 1) return;

    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, autoPlayInterval);
    };

    const stopAutoPlay = () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    };

    startAutoPlay();

    // Pause on hover
    if (pauseOnHover) {
      const slider = sliderRef.current;
      if (slider) {
        slider.addEventListener('mouseenter', stopAutoPlay);
        slider.addEventListener('mouseleave', startAutoPlay);
      }
    }

    // Pause when tab is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) stopAutoPlay();
      else startAutoPlay();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopAutoPlay();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (sliderRef.current) {
        sliderRef.current.removeEventListener('mouseenter', stopAutoPlay);
        sliderRef.current.removeEventListener('mouseleave', startAutoPlay);
      }
    };
  }, [autoPlay, autoPlayInterval, slideCount, pauseOnHover]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    }
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      if (slider) slider.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex]);

  function nextSlide() {
    if (isAnimating || slideCount <= 1) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % slideCount);
    // Reset animation flag after transition
    setTimeout(() => setIsAnimating(false), 500);
  }

  function prevSlide() {
    if (isAnimating || slideCount <= 1) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount);
    setTimeout(() => setIsAnimating(false), 500);
  }

  function goToSlide(index) {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  }

  // Touch swipe handling
  function handleTouchStart(e) {
    setTouchStart(e.touches[0].clientX);
  }

  function handleTouchMove(e) {
    if (touchStart === null) return;
    const touchEnd = e.touches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0) nextSlide();
      else prevSlide();
      setTouchStart(null);
    }
  }

  function handleTouchEnd() {
    setTouchStart(null);
  }

  const currentSlide = validSlides[currentIndex];

  // Safe to return early here — all hooks have already been called above
  if (slideCount === 0) {
    return (
      <div className="hero-slider" role="region" aria-label="Temple gallery">
        <div className="hero-slider-track">
          <div className="hero-slider-slide">
            <div className="hero-slider-placeholder">
              <span className="hero-slider-icon">🕉️</span>
              <p>Shri Kshetra Brahmadev Devasthan</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={sliderRef}
      className="hero-slider"
      role="region"
      aria-label="Temple photo gallery"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex="0"
    >
      <div
        className="hero-slider-track"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          display: 'flex',
          width: '100%',
        }}
      >
        {validSlides.map((slide, index) => (
          <div
            key={index}
            className="hero-slider-slide"
            style={{
              flex: '0 0 100%',
              minWidth: '100%',
              width: '100%',
            }}
          >
            <img
              src={slide.image}
              alt={slide.alt || `Temple view ${index + 1}`}
              loading={index === 0 ? 'eager' : 'lazy'}
              className="hero-slider-image"
            />
            {(slide.caption || slide.title) && (
              <div className="hero-slider-caption">
                {slide.title && <h3 className="hero-slider-title">{slide.title}</h3>}
                {slide.caption && <p className="hero-slider-desc">{slide.caption}</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && slideCount > 1 && (
        <>
          <button
            className="hero-slider-arrow hero-slider-prev"
            onClick={prevSlide}
            aria-label="Previous slide"
            disabled={isAnimating}
          >
            ‹
          </button>
          <button
            className="hero-slider-arrow hero-slider-next"
            onClick={nextSlide}
            aria-label="Next slide"
            disabled={isAnimating}
          >
            ›
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {showDots && slideCount > 1 && (
        <div className="hero-slider-dots" role="tablist" aria-label="Slide navigation">
          {validSlides.map((_, index) => (
            <button
              key={index}
              className={`hero-slider-dot${index === currentIndex ? ' active' : ''}`}
              onClick={() => goToSlide(index)}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter */}
      {slideCount > 1 && (
        <div className="hero-slider-counter" aria-live="polite">
          <span className="current">{currentIndex + 1}</span> / <span className="total">{slideCount}</span>
        </div>
      )}
    </div>
  );
}