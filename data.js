// Career Explorer data
// -------------------------------------------------------------
// Salary: annual, full-time, AUD, typical band (not entry-to-max extremes).
//   The band is an estimate. Where a verified median exists (see JSA below),
//   the app shows that median, and moves the band if the median falls outside it.
//   src "AU" = Australian figure.
//   src "US" = no good AU figure; US figure (BLS / industry surveys) in USD,
//              converted to AUD with USD_TO_AUD below. Shown with a warning tag.
// t   : training level (see TRAINING)
// ai  : 0-100 estimate of how likely the job is to be largely replaced /
//       heavily automated by AI + robotics in ~10 years. Judgement score,
//       informed by AI-exposure research (e.g. Jobs and Skills Australia
//       "Our Gen AI Transition" 2025, OECD, Frey & Osborne). Not a forecast.
// m   : [low, high] typical NET profit margin % if you start your own business
//       in this field. High end = what good operators / scaled models reach.
// note: business angle.
// ALL NUMBERS ARE ESTIMATES. Check current sources before real decisions.

const USD_TO_AUD = 1.52; // approx rate, late 2025. Update as needed.

const TRAINING = [
  { id: 0, short: "Start now", label: "Start straight away (no quals)" },
  { id: 1, short: "Short course", label: "Short course / Cert II-III (< 1 yr)" },
  { id: 2, short: "Apprenticeship", label: "Apprenticeship (3-4 yrs, paid)" },
  { id: 3, short: "Diploma", label: "TAFE diploma (1-2 yrs)" },
  { id: 4, short: "Bachelor", label: "Bachelor degree (3-4 yrs)" },
  { id: 5, short: "Postgrad", label: "Postgrad / professional (5-7 yrs)" },
  { id: 6, short: "Specialist", label: "PhD / medical specialist (8-15 yrs)" },
];

const O = (n, lo, hi, t, ai, m, note, src = "AU") => ({ n, lo, hi, t, ai, m, note, src });
// US helper: pass USD values, converted at load time
const U = (n, loUsd, hiUsd, t, ai, m, note) => ({ ...O(n, Math.round(loUsd * USD_TO_AUD), Math.round(hiUsd * USD_TO_AUD), t, ai, m, note, "US"), usd: [loUsd, hiUsd] });

// -------------------------------------------------------------
// VERIFIED AU MEDIANS (checked 2026-11-18)
// Source: Jobs and Skills Australia occupation profiles (ANZSCO),
//   "Median weekly earnings" = ABS Survey of Employee Earnings and Hours,
//   May 2025, customised report. Full-time employees, before tax.
//   NOTE: employees only. Self-employed / business owners are NOT included.
// Format: name: [median weekly $, "ANZSCO code + title", match]
//   match "exact" = the ANZSCO group is this job.
//   match "group" = the closest ANZSCO group is broader (mixes other jobs).
// Jobs not listed here had no JSA earnings figure ("N/A").
const JSA_SOURCE = "Jobs and Skills Australia / ABS Employee Earnings and Hours, May 2025";
const JSA_URL = "https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations-anzsco/";
const JSA = {
  "General Practitioner": [2446, "2531-general-practitioners-and-resident-medical-officers", "group"],
  "Surgeon": [3905, "2535-surgeons", "exact"],
  "Anaesthetist": [8293, "2532-anaesthetists", "exact"],
  "Registered Nurse": [2192, "2544-registered-nurses", "exact"],
  "Physiotherapist": [1888, "2525-physiotherapists", "exact"],
  "Paramedic": [2852, "4111-ambulance-officers-and-paramedics", "exact"],
  "Psychologist": [2204, "2723-psychologists-and-psychotherapists", "exact"],
  "Dentist": [3232, "2523-dental-practitioners", "exact"],
  "Pharmacist": [1956, "2515-pharmacists", "exact"],
  "Aged Care Worker": [1761, "4231-aged-and-disabled-carers", "exact"],
  "Disability Support Worker": [1761, "4231-aged-and-disabled-carers", "exact"],
  "Accountant": [2003, "2211-accountants", "exact"],
  "Bookkeeper": [1400, "5512-bookkeepers", "exact"],
  "Financial Adviser": [2582, "2223-financial-investment-advisers-and-managers", "group"],
  "Mortgage Broker": [2576, "2221-financial-brokers", "group"],
  "Actuary": [2072, "2241-actuaries-mathematicians-and-statisticians", "group"],
  "Investment Analyst": [2582, "2223-financial-investment-advisers-and-managers", "group"],
  "Insurance Underwriter": [1501, "5523-insurance-money-market-and-statistical-clerks", "group"],
  "Plumber": [1990, "3341-plumbers", "exact"],
  "Electrician": [2191, "3411-electricians", "exact"],
  "Refrigeration & AC Mechanic": [2100, "3421-airconditioning-and-refrigeration-mechanics", "exact"],
  "Carpenter": [1760, "3312-carpenters-and-joiners", "exact"],
  "Bricklayer": [2317, "3311-bricklayers-and-stonemasons", "exact"],
  "Plasterer": [1841, "3332-plasterers", "exact"],
  "Concreter": [2209, "8212-concreters", "exact"],
  "Motor Mechanic": [1622, "3212-motor-mechanics", "exact"],
  "Auto Electrician": [2808, "3211-automotive-electricians", "exact"],
  "Panel Beater": [1848, "3241-panelbeaters", "exact"],
  "Welder / Fabricator": [1688, "3223-structural-steel-and-welding-trades-workers", "exact"],
  "Chef": [1423, "3513-chefs", "exact"],
  "Barista": [1500, "4311-bar-attendants-and-baristas", "group"],
  "Hairdresser": [1209, "3911-hairdressers", "exact"],
  "Beauty Therapist": [1178, "4511-beauty-therapists", "exact"],
  "Personal Trainer": [1500, "4521-fitness-instructors", "exact"],
  "Retail Assistant": [1241, "6211-sales-assistants-general", "exact"],
  "Real Estate Agent": [1504, "6121-real-estate-sales-agents", "exact"],
  "Software Engineer": [2537, "2613-software-and-applications-programmers", "group"],
  "Data Scientist": [2072, "2241-actuaries-mathematicians-and-statisticians", "group"],
  "Cyber Security Analyst": [2461, "2621-database-and-systems-administrators-and-ict-security-specialists", "group"],
  "IT Support Technician": [1687, "3131-ict-support-technicians", "exact"],
  "Early Childhood Teacher": [1906, "2411-early-childhood-pre-primary-school-teachers", "exact"],
  "Primary Teacher": [2226, "2412-primary-school-teachers", "exact"],
  "Secondary Teacher": [2322, "2414-secondary-school-teachers", "exact"],
  "University Lecturer": [2924, "2421-university-lecturers-and-tutors", "exact"],
  "Private Tutor": [2518, "2492-private-tutors-and-teachers", "exact"],
  "Solicitor": [2070, "2713-solicitors", "exact"],
  "Barrister": [3495, "2711-barristers", "exact"],
  "Paralegal": [1575, "5991-conveyancers-and-legal-executives", "group"],
  "Police Officer": [2560, "4413-police", "exact"],
  "Firefighter": [2473, "4412-fire-and-emergency-workers", "exact"],
  "Graphic Designer": [1850, "2324-graphic-and-web-designers-and-illustrators", "group"],
  "Copywriter": [1722, "2124-journalists-and-other-writers", "group"],
  "Photographer": [1840, "2113-photographers", "exact"],
  "Game Developer": [2476, "2612-multimedia-specialists-and-web-developers", "group"],
  "Truck Driver": [1960, "7331-truck-drivers", "exact"],
  "Forklift Operator": [1340, "7213-forklift-drivers", "exact"],
  "Warehouse Worker": [1328, "7411-storepersons", "exact"],
  "Airline Pilot": [2651, "2311-air-transport-professionals", "group"],
  "Mining Engineer": [3518, "2336-mining-engineers", "exact"],
  "Drill Operator (FIFO)": [2908, "7122-drillers-miners-and-shot-firers", "exact"],
  "Solar Installer": [2191, "3411-electricians", "group"],
};

// -------------------------------------------------------------
// ATO TAX DATA (added 2026-11-18)
// Source: ATO Taxation Statistics 2023-24, Individuals, Table 15
//   (data.gov.au). Counts ALL people who lodged a tax return with this job:
//   full-time, part-time, part-year, employees AND self-employed.
//   So medians are often lower than full-time pay.
// Format: name: [median salary/wage $, median total income $, people, "ATO occupation"]
//   "total income" includes business income, so it helps for self-employed jobs.
const ATO_SOURCE = "ATO Taxation Statistics 2023-24, Individuals Table 15";
const ATO_URL = "https://data.gov.au/data/dataset/taxation-statistics-2023-24/resource/3286e287-ee87-4be4-87b2-56c5c6602009";
const ATO = {
  "General Practitioner": [122319, 168497, 27776, "253111 Medical practitioner - general practice"],
  "Surgeon": [200000, 427080, 4280, "2535 Surgeon"],
  "Anaesthetist": [235037, 479642, 3735, "253211 Anaesthetist"],
  "Psychiatrist": [197138, 290835, 3335, "253411 Medical specialist - psychiatrist"],
  "Registered Nurse": [78624, 82640, 360020, "2544 Registered nurse"],
  "Physiotherapist": [76527, 85353, 32906, "252511 Physiotherapist"],
  "Paramedic": [111206, 116527, 23993, "411111 Ambulance officer"],
  "Psychologist": [76640, 94275, 27038, "2723 Psychologist"],
  "Dentist": [95289, 143097, 8859, "252312 Dentist"],
  "Pharmacist": [79058, 89965, 31487, "2515 Pharmacist"],
  "Aged Care Worker": [47498, 52944, 221428, "423111 Aged or disabled carer"],
  "Disability Support Worker": [56964, 63583, 73279, "411712 Disabilities support officer"],
  "Accountant": [98490, 105119, 191675, "2211 Accountant"],
  "Bookkeeper": [47457, 58963, 33700, "551211 Bookkeeper"],
  "Financial Adviser": [109999, 122358, 15802, "222311 Financial adviser"],
  "Mortgage Broker": [81586, 90160, 11049, "222112 Broker - finance"],
  "Actuary": [166678, 176782, 2927, "224111 Actuary"],
  "Investment Analyst": [209537, 222711, 4583, "222312 Financial investment manager"],
  "Plumber": [89052, 95527, 38027, "334116 Plumber (general)"],
  "Electrician": [108626, 116532, 89644, "341111 Electrician (general)"],
  "Refrigeration & AC Mechanic": [94818, 100514, 17317, "342111 Air conditioning mechanic"],
  "Roofer": [57510, 62718, 3777, "333311 Roof tiler"],
  "Carpenter": [76759, 83106, 58544, "331212 Carpenter"],
  "Bricklayer": [64360, 71998, 8066, "331111 Bricklayer"],
  "Plasterer": [64742, 71417, 14428, "3332 Plasterer"],
  "Concreter": [75480, 81023, 24395, "8212 Concreter"],
  "Landscaper": [54924, 58226, 29421, "362711 Landscape gardener"],
  "Motor Mechanic": [83962, 87716, 114450, "3212 Motor mechanic"],
  "Auto Electrician": [102807, 110238, 13604, "321111 Automotive electrician"],
  "Panel Beater": [78194, 81610, 9967, "324111 Panel beater"],
  "Welder / Fabricator": [78658, 81162, 24510, "322313 Welder"],
  "Chef": [57772, 59613, 142550, "351311 Chef"],
  "Barista": [28816, 32054, 44222, "431112 Barista"],
  "Hairdresser": [39758, 45584, 32537, "3911 Hairdresser"],
  "Beauty Therapist": [30756, 36661, 25399, "451111 Beautician"],
  "Personal Trainer": [32718, 45864, 21084, "452111 Fitness instructor"],
  "Retail Assistant": [30817, 35941, 378516, "6211 Sales assistant - general"],
  "Real Estate Agent": [72978, 80905, 76547, "6121 Real estate sales agent"],
  "Software Engineer": [132758, 137846, 84585, "261313 Computing professional - software engineer"],
  "Data Scientist": [105143, 109480, 3332, "224115 Data scientist"],
  "Cyber Security Analyst": [133128, 136560, 2003, "261315 Cyber security engineer"],
  "IT Support Technician": [66980, 68858, 30899, "313112 Computer support or help desk"],
  "UX / Product Designer": [96090, 99660, 1297, "261113 User experience designer (ict)"],
  "Early Childhood Teacher": [63794, 68197, 25422, "241111 School teacher - pre-school or kindergarten"],
  "Primary Teacher": [87539, 91508, 192536, "241213 School teacher - infant or primary school"],
  "Secondary Teacher": [97755, 102460, 172516, "2414 Secondary school teacher"],
  "University Lecturer": [90370, 100598, 72571, "2421 University lecturer or tutor"],
  "Private Tutor": [15655, 24508, 12230, "249299 Private tutor or teacher - other"],
  "Solicitor": [119210, 129879, 73929, "271311 Lawyer"],
  "Barrister": [35830, 61747, 1545, "271111 Barrister"],
  "Paralegal": [60264, 63883, 12004, "599112 Legal executive"],
  "Police Officer": [109409, 120859, 66688, "4413 Police"],
  "Firefighter": [116104, 124886, 16727, "441212 Fire brigade officer"],
  "Graphic Designer": [73392, 78675, 38828, "2324 Graphic or web designer, or illustrator"],
  "Copywriter": [70461, 77468, 2347, "212411 Copywriter"],
  "Photographer": [41821, 55247, 6013, "2113 Photographer"],
  "Video Editor": [69454, 76628, 5088, "212314 Director - film and video editor"],
  "Game Developer": [77289, 82087, 2853, "261211 Computing professional - multimedia specialist"],
  "Truck Driver": [83814, 87658, 162602, "733111 Truck driver"],
  "Forklift Operator": [64549, 66238, 41510, "7213 Forklift driver"],
  "Warehouse Worker": [52871, 54770, 184839, "741111 Storeperson"],
  "Airline Pilot": [161048, 177014, 9840, "231111 Aeroplane pilot"],
  "Mining Engineer": [175193, 190515, 8555, "233611 Engineer - mining"],
  "Drill Operator (FIFO)": [135184, 143478, 59761, "7122 Driller, miner or shot firer"],

};

const DATA = {
  n: "Careers",
  c: [
    { n: "Medical & Health", color: "#e5484d", c: [
      { n: "Doctors", c: [
        O("General Practitioner", 150000, 350000, 6, 20, [10, 25], "Own clinic: margin depends on bulk-billing mix and doctor retention."),
        O("Surgeon", 250000, 600000, 6, 8, [25, 45], "Private practice + day hospital stake can lift earnings a lot."),
        O("Anaesthetist", 300000, 600000, 6, 15, [40, 60], "Mostly sole trader. Low overhead, very high income."),
        O("Psychiatrist", 250000, 450000, 6, 18, [35, 55], "Private practice / telehealth. Demand far above supply."),
      ]},
      { n: "Nursing & Allied", c: [
        O("Registered Nurse", 75000, 115000, 4, 10, [5, 15], "Business route = nursing agency. Thin margins, scale matters."),
        O("Physiotherapist", 75000, 120000, 4, 8, [10, 25], "Clinic owner. Multi-site clinics do better."),
        O("Paramedic", 80000, 120000, 4, 6, [10, 20], "Business route = event / remote site medical services."),
        O("Psychologist", 90000, 150000, 5, 18, [30, 50], "Private practice. Low overhead, strong demand."),
        O("Dentist", 120000, 250000, 5, 8, [15, 35], "Practice ownership. High fit-out cost, good returns."),
        O("Pharmacist", 80000, 120000, 5, 40, [3, 8], "Pharmacy ownership: high turnover, thin margin."),
        U("Genetic Counsellor", 85000, 115000, 5, 30, [20, 40], "Small field in AU. Telehealth consulting possible."),
      ]},
      { n: "Care Work", c: [
        O("Aged Care Worker", 55000, 70000, 1, 6, [3, 10], "Home care provider. Heavily regulated, thin margin."),
        O("Disability Support Worker", 55000, 75000, 1, 6, [5, 15], "NDIS provider. Margin set by NDIS price caps."),
      ]},
    ]},
    { n: "Financial", color: "#30a46c", c: [
      { n: "Accounting & Advice", c: [
        O("Accountant", 70000, 130000, 4, 60, [20, 40], "Own practice. Advisory work beats compliance work."),
        O("Bookkeeper", 55000, 80000, 1, 80, [20, 50], "Cheap to start. Software does more of the work each year."),
        O("Financial Adviser", 80000, 180000, 4, 40, [15, 35], "Licensing / compliance costs are high. Recurring fees."),
        O("Mortgage Broker", 60000, 200000, 1, 50, [20, 40], "Trail commissions = recurring income. Sellable book."),
      ]},
      { n: "Markets & Risk", c: [
        O("Actuary", 110000, 250000, 5, 45, [25, 45], "Consulting. Small, high-skill market."),
        O("Investment Analyst", 90000, 200000, 4, 55, [30, 70], "Fund management: fees on assets. Very high ceiling."),
        O("Insurance Underwriter", 80000, 140000, 4, 70, [15, 35], "Underwriting agency (MGA). Needs capacity partner."),
      ]},
    ]},
    { n: "Trades", color: "#f76b15", c: [
      { n: "Building Services", c: [
        O("Plumber", 75000, 130000, 2, 5, [10, 25], "Emergency + maintenance contracts lift margin."),
        O("Electrician", 80000, 140000, 2, 7, [10, 25], "Solar, batteries, EV chargers = growth niche."),
        O("Refrigeration & AC Mechanic", 80000, 130000, 2, 8, [10, 25], "Service contracts give steady recurring work."),
        O("Roofer", 65000, 100000, 2, 8, [8, 18], "Weather-dependent. Insurance repair work helps."),
      ]},
      { n: "Construction", c: [
        O("Carpenter", 70000, 110000, 2, 8, [8, 20], "Builder licence later opens bigger jobs."),
        O("Bricklayer", 70000, 120000, 2, 10, [10, 20], "Labour shortage keeps rates high."),
        O("Plasterer", 65000, 100000, 2, 10, [10, 20], "Crew-based. Margin from running teams well."),
        O("Concreter", 70000, 110000, 2, 10, [10, 20], "Equipment heavy. Commercial work pays better."),
        O("Landscaper", 55000, 85000, 1, 10, [8, 20], "Design + maintenance contracts beat one-off jobs."),
      ]},
      { n: "Automotive & Metal", c: [
        O("Motor Mechanic", 60000, 95000, 2, 18, [5, 15], "Workshop. EV shift changes the work."),
        O("Auto Electrician", 65000, 100000, 2, 15, [8, 20], "EV + fleet work = good niche."),
        O("Panel Beater", 60000, 90000, 2, 15, [5, 12], "Insurer pricing squeezes margin."),
        O("Welder / Fabricator", 65000, 110000, 2, 25, [8, 20], "Custom fab beats volume work (robots)."),
      ]},
    ]},
    { n: "Service & Hospitality", color: "#ffb224", c: [
      { n: "Food & Drink", c: [
        O("Chef", 60000, 85000, 2, 15, [3, 10], "Restaurant: long hours, tough margins."),
        O("Barista", 50000, 60000, 0, 30, [3, 10], "Cafe: thin margin. Coffee carts do better."),
      ]},
      { n: "Personal Services", c: [
        O("Hairdresser", 50000, 70000, 2, 5, [5, 15], "Salon. Chair rental model lowers risk."),
        O("Beauty Therapist", 50000, 70000, 1, 8, [8, 20], "Cosmetic / skin treatments have better margin."),
        O("Personal Trainer", 50000, 80000, 1, 15, [20, 50], "Online coaching scales well."),
      ]},
      { n: "Sales & Retail", c: [
        O("Retail Assistant", 50000, 60000, 0, 50, [2, 8], "Retail store: thin margin, online competition."),
        O("Real Estate Agent", 60000, 200000, 1, 40, [10, 30], "Rent roll = recurring, sellable asset."),
      ]},
    ]},
    { n: "Technology", color: "#3e63dd", c: [
      { n: "Software & Data", c: [
        O("Software Engineer", 100000, 180000, 4, 45, [20, 80], "SaaS product: very high ceiling, investor-friendly."),
        O("Data Scientist", 110000, 170000, 5, 45, [25, 50], "Consulting or data products."),
        U("AI / ML Engineer", 130000, 220000, 5, 25, [20, 75], "AI products: high ceiling. AU pay data still thin."),
        U("AI Solutions Engineer", 100000, 180000, 4, 30, [25, 60], "AI implementation consultancy. Hot demand."),
      ]},
      { n: "Infrastructure & Security", c: [
        O("Cyber Security Analyst", 100000, 170000, 4, 25, [15, 40], "Managed security services: recurring revenue."),
        O("IT Support Technician", 60000, 85000, 1, 55, [10, 25], "Managed IT services (MSP). Recurring contracts."),
      ]},
      { n: "Design", c: [
        O("UX / Product Designer", 90000, 150000, 4, 40, [15, 35], "Design agency or product studio."),
      ]},
    ]},
    { n: "Education", color: "#8e4ec6", c: [
      { n: "Schools", c: [
        O("Early Childhood Teacher", 75000, 105000, 4, 8, [8, 18], "Childcare centre: capital heavy, subsidy funded."),
        O("Primary Teacher", 75000, 120000, 4, 15, [20, 50], "Business route = tutoring centre."),
        O("Secondary Teacher", 75000, 125000, 4, 20, [20, 50], "Tutoring / exam prep. Online scales."),
      ]},
      { n: "Higher Ed & Tutoring", c: [
        O("University Lecturer", 110000, 150000, 6, 35, [30, 80], "Online courses: very high ceiling if audience exists."),
        O("Private Tutor", 40000, 80000, 0, 50, [30, 60], "Low cost start. AI tutors are strong competition."),
      ]},
    ]},
    { n: "Legal & Public Safety", color: "#0d74ce", c: [
      { n: "Legal", c: [
        O("Solicitor", 80000, 180000, 5, 45, [20, 40], "Own firm. Fixed-fee + tech-enabled firms do best."),
        O("Barrister", 150000, 500000, 5, 25, [40, 60], "Sole trader by rule. Low overhead, high ceiling."),
        O("Paralegal", 60000, 85000, 3, 75, [15, 30], "Conveyancing / legal services business."),
      ]},
      { n: "Emergency & Safety", c: [
        O("Police Officer", 75000, 110000, 3, 10, [5, 15], "Business route = security / investigations firm."),
        O("Firefighter", 80000, 120000, 3, 5, [15, 30], "Business route = fire safety compliance services."),
      ]},
    ]},
    { n: "Creative & Media", color: "#d6409f", c: [
      { n: "Design & Writing", c: [
        O("Graphic Designer", 60000, 95000, 3, 65, [15, 40], "Studio. AI tools cut low-end work."),
        O("Copywriter", 65000, 110000, 4, 80, [30, 60], "Low cost, but AI pressure on price is high."),
      ]},
      { n: "Visual & Interactive", c: [
        O("Photographer", 50000, 90000, 1, 45, [15, 35], "Weddings / commercial. Personal brand matters."),
        O("Video Editor", 60000, 95000, 3, 60, [15, 35], "Video production house."),
        O("Game Developer", 80000, 140000, 4, 40, [5, 70], "Indie studio: hit-driven. Most lose, few win big."),
      ]},
    ]},
    { n: "Transport & Logistics", color: "#12a594", c: [
      { n: "Road & Warehouse", c: [
        O("Truck Driver", 65000, 100000, 1, 40, [3, 8], "Owner-driver. Fuel + finance costs squeeze margin."),
        O("Forklift Operator", 55000, 70000, 1, 50, [5, 12], "Business route = labour hire."),
        O("Warehouse Worker", 52000, 65000, 0, 65, [3, 8], "3PL warehouse business: thin, scale-driven."),
      ]},
      { n: "Air", c: [
        O("Airline Pilot", 120000, 350000, 5, 25, [5, 15], "Charter operator: capital heavy, thin margin."),
        U("Drone Operator", 45000, 85000, 1, 20, [15, 40], "Survey / inspection services. Niche, growing."),
      ]},
    ]},
    { n: "Mining & Energy", color: "#978365", c: [
      { n: "Mining", c: [
        O("Mining Engineer", 130000, 220000, 4, 20, [15, 35], "Engineering consultancy."),
        O("Drill Operator (FIFO)", 110000, 170000, 1, 35, [8, 20], "Drilling contractor: equipment heavy. Autonomy rising."),
      ]},
      { n: "Renewables", c: [
        O("Solar Installer", 65000, 100000, 1, 10, [8, 18], "Install business. Rebate changes cause swings."),
        U("Wind Turbine Technician", 55000, 80000, 3, 8, [8, 15], "O&M contractor. Small AU field, growing."),
      ]},
    ]},
  ],
};
