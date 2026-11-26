import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * HeroSlider - True Infinite image carousel for the homepage
 * Supports infinite looping, auto-slide, manual controls, keyboard navigation, and touch swipe.
 * Slide counter removed per user request.
 * Includes dedicated Live Darshan YouTube badge.
 */
export default function HeroSlider({
  slides = [],
  autoPlay = true,
  autoPlayInterval = 5000,
  showArrows = true,
  showDots = true,
  pauseOnHover = true,
}) {
  const validSlides = slides.filter((s) => s.image && s.image.trim());
  const slideCount = validSlides.length;

  // For infinite looping, create clones: [last, ...slides, first]
  const extendedSlides =
    slideCount > 1
      ? [validSlides[slideCount - 1], ...validSlides, validSlides[0]]
      : validSlides;

  // When slideCount > 1, real first slide is at index 1
  const [currentIndex, setCurrentIndex] = useState(slideCount > 1 ? 1 : 0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  const isAnimatingRef = useRef(false);
  const autoPlayTimerRef = useRef(null);
  const sliderRef = useRef(null);
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  // Keep slide index valid when slides update asynchronously (e.g. from settings API)
  useEffect(() => {
    isAnimatingRef.current = false;
    setTransitionEnabled(false);
    setCurrentIndex(slideCount > 1 ? 1 : 0);
  }, [slideCount]);

  // Active dot index mapped back to original slide array (0 to slideCount - 1)
  const activeDotIndex =
    slideCount <= 1
      ? 0
      : currentIndex === 0
      ? slideCount - 1
      : currentIndex === extendedSlides.length - 1
      ? 0
      : currentIndex - 1;

  // Slide to next (infinite forward)
  const nextSlide = useCallback(() => {
    if (slideCount <= 1 || isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setTransitionEnabled(true);
    setCurrentIndex((prev) => prev + 1);
  }, [slideCount]);

  // Slide to previous (infinite backward)
  const prevSlide = useCallback(() => {
    if (slideCount <= 1 || isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setTransitionEnabled(true);
    setCurrentIndex((prev) => prev - 1);
  }, [slideCount]);

  // Jump to specific slide from dots
  const goToSlide = useCallback(
    (index) => {
      if (slideCount <= 1 || isAnimatingRef.current) return;
      isAnimatingRef.current = true;
      setTransitionEnabled(true);
      setCurrentIndex(index + 1);
    },
    [slideCount]
  );

  // Handle transition end for seamless infinite wrap
  const handleTransitionEnd = useCallback(() => {
    isAnimatingRef.current = false;
    if (slideCount <= 1) return;

    // Reached clone of first slide at the end -> jump silently to real first slide
    if (currentIndexRef.current === extendedSlides.length - 1) {
      setTransitionEnabled(false);
      setCurrentIndex(1);
    }
    // Reached clone of last slide at the start -> jump silently to real last slide
    else if (currentIndexRef.current === 0) {
      setTransitionEnabled(false);
      setCurrentIndex(extendedSlides.length - 2);
    }
  }, [slideCount, extendedSlides.length]);

  // Re-enable transition on the next frame after silent jump
  useEffect(() => {
    if (!transitionEnabled) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitionEnabled(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [transitionEnabled]);

  // Autoplay management
  useEffect(() => {
    if (!autoPlay || slideCount <= 1 || isPaused) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [autoPlay, autoPlayInterval, slideCount, isPaused, nextSlide]);

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
    if (slider) slider.addEventListener('keydown', handleKeyDown);
    return () => {
      if (slider) slider.removeEventListener('keydown', handleKeyDown);
    };
  }, [prevSlide, nextSlide]);

  // Touch swipe handling
  function handleTouchStart(e) {
    setTouchStart(e.touches[0].clientX);
  }

  function handleTouchMove(e) {
    if (touchStart === null) return;
    const touchEnd = e.touches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 45) {
      if (diff > 0) nextSlide();
      else prevSlide();
      setTouchStart(null);
    }
  }

  function handleTouchEnd() {
    setTouchStart(null);
  }

  if (slideCount === 0) {
    return (
      <div className="hero-slider" role="region" aria-label="Temple gallery">
        <div className="hero-slider-slider-wrapper">
          <div className="hero-slider-track">
            <div className="hero-slider-slide">
              <div className="hero-slider-placeholder">
                <span className="hero-slider-icon">🕉️</span>
                <p>Shri Kshetra Brahmadev Devasthan</p>
              </div>
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
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      tabIndex="0"
    >
      <div className="hero-slider-slider-wrapper">
        {/* ── Sliding Track ── */}
        <div
          className="hero-slider-track"
          onTransitionEnd={handleTransitionEnd}
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: transitionEnabled
              ? 'transform 600ms cubic-bezier(.25,.46,.45,.94)'
              : 'none',
          }}
        >
          {extendedSlides.map((slide, index) => (
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
                loading="eager"
                className="hero-slider-image"
                decoding="async"
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
      </div>

      {/* ── Navigation Arrows ── */}
      {showArrows && slideCount > 1 && (
        <>
          <button
            type="button"
            className="hero-slider-arrow hero-slider-prev"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            type="button"
            className="hero-slider-arrow hero-slider-next"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            ›
          </button>
        </>
      )}

      {/* ── Dot Indicators (Slide counter removed per request) ── */}
      {showDots && slideCount > 1 && (
        <div className="hero-slider-dots" role="tablist" aria-label="Slide navigation">
          {validSlides.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`hero-slider-dot${index === activeDotIndex ? ' active' : ''}`}
              onClick={() => goToSlide(index)}
              role="tab"
              aria-selected={index === activeDotIndex}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}