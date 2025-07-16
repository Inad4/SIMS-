'use client';

import { useEffect } from 'react';

const initFlowbite = async () => {
  if (typeof window !== 'undefined') {
    const { initDropdowns, initCollapses } = await import('flowbite');
    initDropdowns();
    initCollapses();
  }
};

export default function FlowbiteProvider() {
  useEffect(() => {
    initFlowbite();
  }, []);

  return null;
}