# Task 3-a: Layout & Auth Components

## Summary
Created three core UI components for the Flash Buy crypto eCommerce platform:

### Files Created
1. **Header.tsx** - Sticky header with logo, nav, search, cart badge, user dropdown, mobile Sheet menu
2. **Footer.tsx** - Comprehensive footer with brand, links, crypto payments, newsletter, mt-auto sticky
3. **AuthDialog.tsx** - Tabbed Login/Register dialog with form validation, API calls, store integration

### Key Design Choices
- Dark zinc-950 theme with emerald-600 accents (crypto aesthetic)
- All components are 'use client' with proper TypeScript typing
- Zustand store integration for auth, cart, navigation, search
- Mobile responsive: Sheet sidebar for header, responsive grid in footer
- Form validation with visual error feedback (red borders, error messages)
- API endpoints: POST /api/auth/login, POST /api/auth/register
