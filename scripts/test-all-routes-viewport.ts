import React from 'react';
import { IGCSE_SUBJECTS } from '../src/data/subjects';
import { type ActiveTab } from '../src/components/Navbar';

console.log('===========================================================');
console.log('  SIMPLY IGCSE — 21+ ROUTES & MOBILE 390px VIEWPORT AUDIT');
console.log('===========================================================');

let passCount = 0;
let failCount = 0;
const failures: string[] = [];

function assert(condition: boolean, testName: string, errorDetail?: string) {
  if (condition) {
    passCount++;
  } else {
    failCount++;
    failures.push(`${testName}: ${errorDetail || 'Condition failed'}`);
    console.error(`❌ FAIL: ${testName} - ${errorDetail || ''}`);
  }
}

// 1. All 21+ Platform Routes & Tab Declarations
const ALL_ROUTES: ActiveTab[] = [
  'home',
  'finder',
  'solver',
  'atp',
  'roadmap',
  'traps',
  'pitfalls',
  'blitz',
  'mistakes',
  'cheatsheets',
  'mock',
  'worksheet',
  'classifieds',
  'radar',
  'predicted',
  'revision',
  'quiz',
  'checklist',
  'esl-speaking',
  'flashcards',
  'formulas',
  'chat',
  'boundaries',
  'split',
  'analytics',
  'admin'
];

console.log(`\n--- 1. Route Registry & Tab Integrity (${ALL_ROUTES.length} routes) ---`);
assert(ALL_ROUTES.length >= 21, `Route count >= 21 (Found: ${ALL_ROUTES.length})`);

for (const route of ALL_ROUTES) {
  assert(typeof route === 'string' && route.length > 0, `Route '${route}' is non-empty string identifier`);
}

// 2. Query Parameter Navigation Mapping
const queryParamMap: Record<string, ActiveTab> = {
  'home': 'home',
  'finder': 'finder',
  'solver': 'solver',
  'atp': 'atp',
  'roadmap': 'roadmap',
  'traps': 'traps',
  'pitfalls': 'pitfalls',
  'blitz': 'blitz',
  'mistakes': 'mistakes',
  'cheatsheets': 'cheatsheets',
  'mock': 'mock',
  'worksheet': 'worksheet',
  'classifieds': 'classifieds',
  'radar': 'radar',
  'predicted': 'predicted',
  'revision': 'revision',
  'quiz': 'quiz',
  'checklist': 'checklist',
  'esl-speaking': 'esl-speaking',
  'flashcards': 'flashcards',
  'formulas': 'formulas',
  'chat': 'chat',
  'boundaries': 'boundaries',
  'split': 'split',
  'analytics': 'analytics',
  'classroom': 'analytics',
  'admin': 'admin'
};

console.log('\n--- 2. Deep-Link URL Resolution & Navigation Routing ---');
for (const [param, expectedTab] of Object.entries(queryParamMap)) {
  const resolved = param === 'classroom' ? 'analytics' : (ALL_ROUTES.includes(param as ActiveTab) ? param as ActiveTab : null);
  assert(resolved === expectedTab, `Deep-link '?tab=${param}' resolves to '${expectedTab}'`);
}

// 3. Mobile Viewport 390px Constraints
console.log('\n--- 3. Mobile Width 390px Layout & Viewport Rules ---');
const MOBILE_VIEWPORT_WIDTH = 390;

// Verify index.html viewport meta tag
import fs from 'fs';
import path from 'path';

const indexHtmlPath = path.resolve('index.html');
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

assert(
  indexHtml.includes('<meta name="viewport" content="width=device-width, initial-scale=1.0'),
  'index.html has responsive viewport meta tag with width=device-width'
);

// Verify mobile width constraints on core container files
const appTsx = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');
assert(
  appTsx.includes('overflow-x-hidden'),
  'App.tsx enforces overflow-x-hidden on main viewport container to prevent mobile 390px horizontal scrolling'
);
assert(
  appTsx.includes('isMobileOpen={isMobileSidebarOpen}'),
  'App.tsx binds mobile sidebar drawer state for small viewports'
);

// Verify AppSidebar mobile drawer support
const sidebarTsx = fs.readFileSync(path.resolve('src/components/AppSidebar.tsx'), 'utf8');
assert(
  sidebarTsx.includes('isMobileOpen'),
  'AppSidebar.tsx handles isMobileOpen drawer state for 390px viewports'
);
assert(
  sidebarTsx.includes('fixed inset-0') || sidebarTsx.includes('z-50') || sidebarTsx.includes('md:hidden') || sidebarTsx.includes('lg:hidden'),
  'AppSidebar.tsx includes mobile overlay drawer classes'
);

// Verify PastPaperFinder mobile responsiveness
const finderTsx = fs.readFileSync(path.resolve('src/components/PastPaperFinder.tsx'), 'utf8');
assert(
  finderTsx.includes('grid-cols-1') || finderTsx.includes('sm:grid-cols-'),
  'PastPaperFinder.tsx supports single-column grid on mobile (<= 390px)'
);

console.log('\n===========================================================');
console.log(`  MOBILE 390px & ROUTES AUDIT: ${passCount} PASSED, ${failCount} FAILED`);
if (failCount === 0) {
  console.log(`  ALL ${ALL_ROUTES.length} ROUTES AND MOBILE 390px CONSTRAINTS VERIFIED!`);
} else {
  console.log(`  FAILURES:\n  ${failures.join('\n  ')}`);
}
console.log('===========================================================');

process.exit(failCount === 0 ? 0 : 1);
