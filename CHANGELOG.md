# Changelog

## 2026-09-22

- Aligned food.brb to the official Big Red Box Brand Identity Guide v1.3 supplied by Ajay.
- Added the official embedded Nasalization logo font and Inter web font as local app assets.
- Reworked the food.brb wordmark so the lowercase brb mark uses Nasalization, keeps the r red and has protected clear space inside a restrained lockup.
- Standardised the web palette and UI typography to the official tokens: web red `#E5321B`, ink `#0A0A0A`, off white `#F7F7F7`, white, greys and square controls.
- Added the official light-background brb SVG artwork as a local brand-reference asset. No assets are hotlinked.
- Bumped the PWA cache so installed copies receive the branding update.

## 2026-09-21

- Copied the Sadhana app into Ajay's separate `alphajuliet0/food.brb` repository. Sandeep gave written permission to copy, host and modify it; his source repository records this in `LICENSE`.
- Rebranded the app as `food.brb` using the Big Red Box black, red and off-white palette, with a new wordmark treatment and app icon.
- Changed onboarding to ask for date of birth and calculate age automatically.
- Replaced separate height fields with one flexible field that accepts metric or imperial input, such as `178cm`, `1.78m` or `5'10"`, and stores centimetres consistently.
- Kept and rebranded the existing charts for nutrition, weight and progress.
- Added health-data CSV import for dated weight (`weight_kg` or `weight_lb`), waist (`waist_in`), steps and sleep (`sleep_h`). Added in-app notes on preparing Apple Health data as CSV.
- Pulled in Sandeep's latest Open Food Facts search fix: retry across two endpoints with backoff and clearer connection or service error messages.
- Updated the PWA manifest, offline service worker cache and export filenames for `food.brb`.
