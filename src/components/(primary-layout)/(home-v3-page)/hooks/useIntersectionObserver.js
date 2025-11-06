import { useState, useEffect, useRef } from 'react';

export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);
        
        // Set hasIntersected to true once element becomes visible
        if (isVisible && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.3, // Trigger when 30% of element is visible
        rootMargin: '0px 0px -50px 0px', // Start slightly before element is fully in view
        ...options
      }
    );

    observer.observe(target);

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasIntersected, options]);

  return { targetRef, isIntersecting, hasIntersected };
};
