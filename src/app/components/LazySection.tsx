"use client";

import { useEffect, useRef, useState } from "react";

type LazySectionProps = {
  children: React.ReactNode;
  minHeight?: string;
  rootMargin?: string;
};

export default function LazySection({
  children,
  minHeight = "200px",
  rootMargin = "200px",
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || isVisible) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return (
    <div ref={ref} style={{ minHeight }}>
      {isVisible ? children : null}
    </div>
  );
}
