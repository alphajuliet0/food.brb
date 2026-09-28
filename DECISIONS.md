# form.brb — Decisions

## 2026-09-28 — Nightly MyFitnessPal sync retired

**What:** The nightly MFP→form.brb sync (wake schedule `wakeschedule-01M37QTN5JZFPEN7YNZDFAMYAF`, cron 21:30 Europe/London) was stood down on 28 Sep 2026.

**Why:** Ajay switched fully to form.brb. 28 Sep was his first full day of native logging (12 items, all manual/barcode/estimate in-app); his MFP diary held zero genuine entries — only the "form.brb - …" personal-food mirrors the app itself wrote. With form.brb as the primary (and only) logger, the sync is structurally a no-op. Ajay approved retirement via Instinct on 28 Sep. MFP mirror write-path (personal foods) also ends with it.

**Kept intact:** The Cloudflare worker (super-poetry-42d8) is untouched — it is form.brb's live sync store, not part of the retired MFP job. The MFP personal foods and diary history stay in MFP. Nothing in the app code was removed; the sync was agent-side, not app code.

**How to re-enable:** create an agent wake schedule, cron `30 21 * * *` Europe/London, threshold 45, with the runbook below as the prompt.

### Runbook (last live version, 28 Sep 2026)

1. Acquire a cloud browser lease (config-c); log into myfitnesspal.com via vault entry "MyFitnessPal" if the session is absent (fill username, then re-find the password ref — the form rerenders — then fill password and submit).
2. Scrape `https://www.myfitnesspal.com/reports/printable-diary/alpha_juliet?from=TODAY&to=TODAY` plus YESTERDAY (Europe/London dates); parse the FOODS rows per meal.
3. Open form.brb, connect sync if needed (Cloudflare Access auto-completes; email code fallback from ajaypanch@gmail.com Gmail).
4. Push missing entries via localStorage `sadhana-v1` edit + reload. Entry shape: `{id:"mfp-"+hex, name, kcal, protein, carbs, fat, fibre, slot, snack:false, source:"myfitnesspal", sourceDate, trigger:"", ts}`.
   - DEDUPE BY NAME **AND SLOT**: the same food can legitimately appear in two meals on one day (e.g. cottage cheese at lunch AND dinner) — only skip when name+slot already exists.
   - Never touch entries without `source:"myfitnesspal"` (e.g. Ajay's manual entries).
   - MIRROR GUARD: skip any MFP row whose name starts with `form.brb - ` — those rows are the app's own manual entries mirrored INTO MFP via personal foods; pushing them back would duplicate the manual entries they mirror.
5. Verify: fetch `https://super-poetry-42d8.ajay-7a2.workers.dev/data` with the Bearer token from localStorage `foodBrbSyncToken` — response shape `{state, rev, updatedAt}` — and confirm the pushed days' MFP-sourced totals match the MFP TOTALS row exactly (kcal/P/C/F/fibre), excluding `form.brb - ` rows from both sides.
6. Record browser_guidance, release the lease. Quiet on success: report ONLY on failure, totals mismatch, or an unusually empty day.

### MFP write path (for future mirroring, if ever needed)

MFP free tier quick-add is calories-only (macro quick-add is Premium). Exact macros: create a private Personal Food at /food/new (step 1 brand+description via React-safe native setter → Continue → "Create Food" on the duplicates page → full nutrition form; ids: serving, unit, container, caloriesCapitalized, protein, carbohydrates, total_fat, "food.dietaryFiber" → SAVE CHANGES, lands /food/mine). Then on /food/mine trusted-click the food name (JS .click() does NOT expand the row), click ADD TO DIARY, open the Meal Name combobox (custom MUI div combobox — click ref, then click the option), set input#date via native setter (M/D/YYYY), click ADD FOOD. Verify via the printable diary URL above.
