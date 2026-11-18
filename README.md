# Career Explorer (AU)

A node-map explorer of Australian careers: all **357 official ANZSCO job groups**, plus 71 hand-checked jobs and 9 business-only paths (373 nodes), in 23 topic categories. For each job it shows:

- **Explore as Employee:** salary (official AU medians where they exist), training needed (official skill level), and two AI scores:
  - **AI can do the tasks** (official JSA automation exposure).
  - **AI replaces the job** (estimate): how replaceable one worker is. Formula in `replaceRisk()` in `index.html`:
    `automation^1.5 × (automation ÷ augmentation) × 1.25`, ×0.8 if a licence is required, ×0.9 for degree-level roles, capped at 95.
    Generative AI only; robots and self-driving vehicles are not counted.
- **Explore as Business owner:** a business ladder (solo → small → company → large) with real counts of Australian businesses at each size, 4-year survival rates, ATO profit margins, and a "can one person start it?" score.

The map has two views (**View as: Nodes | Constellation**). Constellation is a sky chart: across = AI replacement risk, up = pay,
star size = number of workers, brightness = pay, colour = the "Colour by" choice; selecting a group draws its constellation.
In Business owner mode, across = how hard to start, up = owner earnings ceiling, size = businesses in the industry.

It is a static site: `index.html`, `data.js`, `biz.js` and `groups.js`. No build step and no server.

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
| AI automation and augmentation exposure, topic categories | [JSA Our Gen AI Transition (2025)](https://www.jobsandskills.gov.au/studies/generative-artificial-intelligence-capacity-study/occupation-data-on-ai-exposure) | CC BY 4.0 |
| Skill level, licensing, job descriptions | [ABS ANZSCO 2022](https://www.abs.gov.au/statistics/classifications/anzsco-australian-and-new-zealand-standard-classification-occupations/2022) | CC BY 4.0 |
| Small business cost ratios | [ATO Small business benchmarks 2023-24](https://www.ato.gov.au/businesses-and-organisations/income-deductions-and-concessions/small-business-benchmarks) | CC BY 4.0 |

Some jobs use US wages converted to AUD; these are tagged in the app.

**Physical work and skill complexity filters:** skill complexity comes from the ABS ANZSCO skill level
(Low = level 4–5, Medium = 2–3, High = 1, Very high = level 1 plus postgraduate/specialist training).
Physical work (None/Low/Medium/High) is an estimate set per ANZSCO sub-major group with unit-group exceptions
(`PHYS_SM` and `PHYS_UNIT` in `index.html`).

**Estimates (not official data):** physical work level, the "AI replaces the job" score, own-business margin ranges, salary ranges, start score, money to start, and owner profit for $2m+ firms. For exploring only, not financial or career advice.

## Editing data

- All job groups: re-fetch with `tools/fetch_groups.py` and `tools/fix_desc.py`, then rebuild:

```bash
python3 -I tools/build_groups.py > groups.js
```


- Jobs, salaries, AI risk, margins: `data.js`.
- Business paths (industry mapping, start score, capital, licences): `tools/build_biz.py`, then rebuild:

```bash
python3 -I tools/build_biz.py tools/abs.json tools/ato_bm.json > biz.js
```
