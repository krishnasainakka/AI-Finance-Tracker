import { useRef, useState, useEffect } from 'react';

export function useCardAnimation(initialIndex: number, totalItems: number) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-correct currentIndex if totalItems changes
  useEffect(() => {
    if (currentIndex >= totalItems) {
      setCurrentIndex(Math.max(totalItems - 1, 0));
    }
  }, [currentIndex, totalItems]);

  const next = () => {
    if (isAnimating || currentIndex >= totalItems - 1) return;

    setIsAnimating(true);
    setCurrentIndex((prev) => Math.min(prev + 1, totalItems - 1));

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const previous = () => {
    if (isAnimating || currentIndex <= 0) return;

    setIsAnimating(true);
    setCurrentIndex((prev) => Math.max(prev - 1, 0));

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  useEffect(() => {
    if (!cardsRef.current) return;

    const cards = Array.from(cardsRef.current.children);
    cards.forEach((card, idx) => {
      const htmlCard = card as HTMLElement;
      if (idx === currentIndex) {
        htmlCard.style.transform = `translateX(0) translateY(0) scale(1)`;
        htmlCard.style.zIndex = String(totalItems);
        htmlCard.style.opacity = '1';
      } else {
        const offset = Math.abs(currentIndex - idx);
        const zIndex = totalItems - offset;
        const scale = Math.max(0.95 - offset * 0.05, 0.8);

        htmlCard.style.transform = `
          translateX(${(idx - currentIndex) * 8}px) 
          translateY(${(idx - currentIndex) * 8}px)
          scale(${scale})
        `;
        htmlCard.style.zIndex = String(zIndex);
        htmlCard.style.opacity = offset > 2 ? '0' : '1';
      }
    });
  }, [currentIndex, totalItems]);

  return {
    cardsRef,
    currentIndex,
    next,
    previous,
    isAnimating,
  };
}
