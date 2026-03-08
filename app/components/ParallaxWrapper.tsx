"use client";

import { useEffect } from "react";

export default function ParallaxWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handleScroll = () => {
      document.body.style.backgroundPositionY = `${window.scrollY * 0.3}px`;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return <>{children}</>;
}
