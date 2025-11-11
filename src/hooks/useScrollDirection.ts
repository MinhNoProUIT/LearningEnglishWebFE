// hooks/useScrollDirection.ts
"use client";
import { useEffect, useRef, useState } from "react";

export default function useScrollDirection(minDelta = 5) {
  const [scrollUp, setScrollUp] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (Math.abs(delta) < minDelta) return;
      setScrollUp(delta < 0); // lên = true, xuống = false
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [minDelta]);

  return scrollUp;
}
