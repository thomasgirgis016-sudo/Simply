import React from 'react';

/**
 * Handles smooth mouse movement across liquid glass elements,
 * updating the --x and --y custom CSS properties dynamically.
 */
export function handleLiquidMouseMove(e: React.MouseEvent<HTMLElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  e.currentTarget.style.setProperty('--x', `${x}px`);
  e.currentTarget.style.setProperty('--y', `${y}px`);
}

/**
 * Optional custom glare color setter
 */
export function setLiquidGlareColor(el: HTMLElement, color: string) {
  el.style.setProperty('--glare-color', color);
}
