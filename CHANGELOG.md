# Changelog

## 2026-09-22

- Added a layered BRB daily-progress ring led by calories with protein, fibre and steps, plus desktop hover details across rings, charts and diary rows.
- Added private cross-device sync through Cloudflare with a one-time email-code device connection, automatic open/change sync, conflict retry/merge, and explicit device-only progress-photo handling.
- Replaced generic Staples with frequency/recency-based per-meal suggestions and moved the Add flow inline inside the selected meal, while keeping search, barcode, custom and dish-photo overrides.
- Polished meal cards with a compact single-line + Add control and removed empty-meal macro noise.
- Added a self-serve PT tracker XLSX/CSV importer with dry-run preview, anomaly and duplicate counts, field-safe merge, provenance, and historical daily totals that feed monthly archives without inventing meal entries or overwriting Ring/diary data.
- Removed the unnecessary visible Dietary profile controls; vegetarian-with-eggs remains silent context for AI dish estimates.
- Fixed Ultrahuman steps parsing to use the daily `total` instead of the per-sample `avg`, refreshed the dashboard immediately after sync, and clarified today vs 7-day totals/averages. Polished the dashboard into a visual-first BRB layout with progress rings, a 7-day step chart, macro donut, cleaner metric tiles and pill controls.
- Added weekday/date and week navigation, weekly calorie-bank reporting, daily step rows, weekly/monthly averages, a PT-style monthly archive, an explicit vegetarian-with-eggs profile, transparent target maths, and on-device progress-photo poses with optional Gemini side-by-side comparison. Waist is no longer part of setup or the primary progress view.
- Reworked Log food into a MyFitnessPal-style diary: meal-first sections, per-meal Add Food actions and subtotals, plus daily total, goal and remaining macros. Food pickers now stay hidden until requested.
- Rebuilt the product around Ajay’s brief: dashboard-first home, simple date-aware food logging for past/present/future days, clear meal slots, and move-entry controls. Removed mindfulness, training and body tabs from the main experience.
- Connected the private Ultrahuman Ring sync: Access-gated popup, exact-origin postMessage handoff, 7-day on-device import, and honest dashboard cards for sleep, recovery, HRV, resting heart rate and steps.
- Removed the box around the brb mark and reduced the overall food.brb lockup size following Ajay’s design direction.
- Added a one-screen review flow for photo and barcode logging, with editable nutrition before save, half/standard/large/double portion presets, recent meals, favourites and copy-previous-day.
- Added a reporting dashboard with 7/28/90-day intake averages, protein/fibre consistency, weight rate, sleep/steps correlations and explicit data-quality coverage markers.
- Aligned food.brb to the official Big Red Box Brand Identity Guide v1.3 supplied by Ajay.
- Embedded the official Nasalization logo font and Inter web font directly in the app so the brand typography works offline.
- Reworked the food.brb wordmark so the lowercase brb mark uses Nasalization, keeps the r red and has protected clear space inside a restrained lockup.
- Standardised the web palette and UI typography to the official tokens: web red `#E5321B`, ink `#0A0A0A`, off white `#F7F7F7`, white, greys and square controls.
- Recreated the food.brb lockup from the official font and colour rules without hotlinking any assets.
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
