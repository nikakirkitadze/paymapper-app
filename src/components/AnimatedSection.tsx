'use client';

import { type ReactNode, useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [wasVisibleOnMount, setWasVisibleOnMount] = useState(false);

  useEffect(() => {
    // Check if the element is already visible on first render (above the fold).
    // If so, skip the entrance animation entirely to avoid the flash.
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < window.innerHeight + 50) {
        setWasVisibleOnMount(true);
      }
    }
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={wasVisibleOnMount ? false : { opacity: 0, y: 16 }}
      animate={
        wasVisibleOnMount || isInView
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 16 }
      }
      transition={{
        duration: wasVisibleOnMount ? 0 : 0.5,
        delay: wasVisibleOnMount ? 0 : delay,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
