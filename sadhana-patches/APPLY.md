# Ajay extras for Sadhana v29

Prepared against Sandeep's current main:

- Base commit: `78a03fa8ac3cc58c0679f5e1dc562a0786977650`
- Base subject: `Bump cache to sadhana-v29`
- Changed file: `index.html`

Apply the patches in order:

```sh
git am 0001-Add-DOB-based-automatic-age-calculation.patch
git am 0002-Accept-metric-or-imperial-height-and-store-centimetr.patch
git am 0003-Import-weight-waist-steps-and-sleep-from-health-CSV.patch
```

## Patch contents

1. **DOB and automatic age** adds `profile.dob`, replaces the onboarding age number field with a date field, calculates age live and saves the current calculated value in the existing `profile.age` field.
2. **Flexible height** replaces separate feet/inches inputs with one field accepting `178cm`, `1.78m`, `5'10"`, `5ft10`, `5:10` or plain centimetres. It validates 90-250 cm and stores the value in the existing `profile.heightCm` field.
3. **Health CSV import** adds a Data-tab importer for required `date` plus any of `weight_kg`, `weight_lb`, `waist_cm`, `waist_in`, `steps`, `sleep_h`. It converts pounds to kg and inches to cm. It writes waist records using v29's `{date, cm}` shape, so v29 waist tracking and charts stay compatible.

## Integration notes

- These are rebased to v29's waist-centimetre migration, weekly review and cross-signal pattern changes.
- All three patches only change `index.html`; no food.brb branding or assets are included.
- Existing profiles without DOB still load and can add it through Edit setup.
- Imported values update the same date while leaving unrelated data alone. Apple Health raw XML is not parsed; export or convert the selected values to CSV first.
- After applying, bump the cache name in `sw.js` before publishing so installed PWAs receive the update.
- The ordered set was applied to a fresh checkout of the exact base and the combined inline JavaScript passed `node --check`.
