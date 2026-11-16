import { useState, useEffect, useRef } from 'react';

/**
 * Animated rolling number count-up hook & component.
 * Features:
 * - Uses requestAnimationFrame with smooth cubic-bezier easing.
 * - IntersectionObserver: Only rolls when scrolled into view.
 * - Respects prefers-reduced-motion (instant rendering).
 * - Formats currency with Indian numbering system (e.g. ₹ 1,25,000).
 */
export default function CountUpNumber({
  value = 0,
  duration = 1200,
  prefix = '',
  suffix = '',
  isCurrency = false,
  className = '',
  style = {},
}) {
  const target = Number(value) || 0;
  const [displayValue, setDisplayValue] = useState(0);
  const elementRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    // If user prefers reduced motion, set value instantly
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(target);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          startAnimation();
        }
      },
      { threshold: 0.15 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    function startAnimation() {
      const startTime = performance.now();
      const startVal = 0;

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out expo: fast start, soft gentle landing
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.round(startVal + (target - startVal) * ease);

        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          setDisplayValue(target);
        }
      }

      requestAnimationFrame(update);
    }

    return () => {
      observer.disconnect();
    };
  }, [target, duration]);

  // Format with Indian numbering system
  const formatted = displayValue.toLocaleString('en-IN');
  const renderedPrefix = isCurrency && !prefix ? '₹' : prefix;

  return (
    <span ref={elementRef} className={`count-up-number ${className}`.trim()} style={style}>
      {renderedPrefix}
      {formatted}
      {suffix}
    </span>
  );
}
