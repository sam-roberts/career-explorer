# Career Explorer (AU)

A node-map explorer of Australian careers. For each job it shows:

- **Employee view:** salary (official AU medians where they exist), training needed, AI replacement risk.
- **Owner view:** a business ladder (solo → small → company → large) with real counts of Australian businesses at each size, 4-year survival rates, ATO profit margins, and a "can one person start it?" score.

It is a static site: `index.html`, `data.js` and `biz.js`. No build step and no server.

## Run locally

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765.

## Data sources

| Data | Source | Licence |
|---|---|---|
| Full-time employee median earnings | [Jobs and Skills Australia occupation profiles](https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles) (ABS Employee Earnings and Hours, May 2025) | CC BY 4.0 |
| Salary and total income by occupation | [ATO Taxation Statistics 2023-24, Individuals Table 15](https://data.gov.au/data/dataset/taxation-statistics-2023-24/resource/3286e287-ee87-4be4-87b2-56c5c6602009) | CC BY 2.5 AU |
| Business counts by turnover, survival | [ABS 8165.0 Counts of Australian Businesses, Jul 2021 – Jun 2025](https://www.abs.gov.au/statistics/economy/business-indicators/counts-australian-businesses-including-entries-and-exits/jul2021-jun2025) | CC BY 4.0 |
| Small business cost ratios | [ATO Small business benchmarks 2023-24](https://www.ato.gov.au/businesses-and-organisations/income-deductions-and-concessions/small-business-benchmarks) | CC BY 4.0 |

Some jobs use US wages converted to AUD; these are tagged in the app.

**Estimates (not official data):** AI replacement risk, own-business margin ranges, salary ranges, start score, money to start, and owner profit for $2m+ firms. For exploring only, not financial or career advice.

## Editing data

- Jobs, salaries, AI risk, margins: `data.js`.
- Business paths (industry mapping, start score, capital, licences): `tools/build_biz.py`, then rebuild:

```bash
python3 -I tools/build_biz.py tools/abs.json tools/ato_bm.json > biz.js
```
