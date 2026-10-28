import { useEffect } from "react";

/* Fades in elements marked with data-reveal as they enter the viewport. */
export function useReveal() {
  useEffect(() => {
    const items = document.querySelectorAll("[data-reveal]:not(.is-in)");
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.15 },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
}
