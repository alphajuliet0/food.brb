# Changelog

## 2026-09-21

- Copied the Sadhana app into Ajay's separate `alphajuliet0/food.brb` repository. Sandeep gave written permission to copy, host and modify it; his source repository records this in `LICENSE`.
- Rebranded the app as `food.brb` using the Big Red Box black, red and off-white palette, with a new wordmark treatment and app icon.
- Changed onboarding to ask for date of birth and calculate age automatically.
- Replaced separate height fields with one flexible field that accepts metric or imperial input, such as `178cm`, `1.78m` or `5'10"`, and stores centimetres consistently.
- Kept and rebranded the existing charts for nutrition, weight and progress.
- Added health-data CSV import for dated weight (`weight_kg` or `weight_lb`), waist (`waist_in`), steps and sleep (`sleep_h`). Added in-app notes on preparing Apple Health data as CSV.
- Pulled in Sandeep's latest Open Food Facts search fix: retry across two endpoints with backoff and clearer connection or service error messages.
- Updated the PWA manifest, offline service worker cache and export filenames for `food.brb`.
