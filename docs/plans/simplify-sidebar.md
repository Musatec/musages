# Implementation Plan - Simplifying Sidebar

The USER finds the sidebar "too loaded" (tres charge). The goal is to make it cleaner, more organized, and visually lighter.

## Proposed Changes

### 1. Compact Logo Area
- Reduce padding from `p-10` to `p-6` or `p-8`.
- Slim down the "Musages OS" text and the "Super Mentor" badge.

### 2. Group Navigation Items
Split the `NAV_ITEMS` into logical sections to improve scanability:
- **Général**: Dashboard, Ma Journée.
- **Créativité**: Le Labo, Studio, Bibliothèque.
- **Expansion**: Social Hub.

### 3. Visual Lightening
- Change labels from `font-black` or `font-bold uppercase` to a more subtle `font-semibold` with normal case or smaller tracking.
- Reduce font size slightly if necessary.
- Tighten spacing between items if they feel too sparse, or increase it if they feel too crowded. (Currently `space-y-1.5`, which is tight).

### 4. Optimize Footer
- Move the Language Switcher or compact it.
- Make the "Go Pro" (Pricing) link less of a "block" if possible, or integrate it better.
- Compact Settings and Logout into a single row or smaller buttons.

## Verification
- Check if the sidebar feels less "heavy".
- Ensure all links still work and are accessible.
