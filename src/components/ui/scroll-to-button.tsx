'use client';

import { Button } from './button';
import { Sparkles } from 'lucide-react';

interface ScrollToButtonProps {
  targetId: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  children: React.ReactNode;
}

export function ScrollToButton({ targetId, className, size = "default", children }: ScrollToButtonProps) {
  const handleScrollTo = () => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Button 
      size={size}
      className={className}
      onClick={handleScrollTo}
    >
      {children}
    </Button>
  );
}