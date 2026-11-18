"""Build biz.js (owner view data) from ABS + ATO source data.

Usage:
  python3 -I tools/build_biz.py <abs.json> <ato_bm.json> > biz.js

abs.json    : extracted from ABS 8165.0 data cubes 3 (counts by turnover, June 2025)
              and 6 (survival June 2021 -> June 2025), summed over all states.
ato_bm.json : ATO small business benchmarks 2023-24, "Average total expenses"
              (% of turnover) for 3 turnover bands, read from ato.gov.au.

The mapping below (job -> industry, start-up score, capital, licence) is
judgement and can be edited freely.
"""
import json, sys

abs_d = json.load(open(sys.argv[1]))
ato_d = json.load(open(sys.argv[2]))

# name: (ANZSIC class, ATO benchmark slug or None, business name, start score 0-100,
#        capital low, capital high, licence / barrier, scale note, [max size tier])
# max size tier (optional): 0 solo, 1 small ($200k-2m), 2 company ($2m-10m), 3 large ($10m+).
#   Use it when this path cannot grow as big as the whole industry (e.g. barristers must work alone).
B = {
 "General Practitioner": ("8511", None, "GP clinic", 35, 300e3, 1.5e6, "Medical registration + Medicare provider number", "Multi-clinic groups scale well; doctor recruitment is the limit."),
 "Surgeon": ("8512", None, "Specialist practice / day hospital", 25, 200e3, 5e6, "Specialist registration; hospital licence for day hospital", "Owning a day hospital is where big money is."),
 "Anaesthetist": ("8512", None, "Anaesthetic group practice", 45, 20e3, 200e3, "Specialist registration", "Income scales with your own hours more than with staff.", 1),
 "Psychiatrist": ("8512", None, "Psychiatry practice (incl. telehealth)", 55, 20e3, 150e3, "Specialist registration", "Group practice with psychologists can scale."),
 "Registered Nurse": ("7212", None, "Nursing agency", 50, 30e3, 200e3, "Nurse registration; insurance; labour hire licence in some states", "Big agencies reach $10m+, margins thin."),
 "Physiotherapist": ("8533", "physiotherapy-services", "Physio clinic", 60, 50e3, 300e3, "Physio registration", "Multi-site clinic groups."),
 "Paramedic": ("8591", None, "Event / remote site medical services", 40, 80e3, 500e3, "Paramedic registration; vehicles + equipment", "Mining and event contracts."),
 "Psychologist": ("8539", None, "Psychology clinic", 75, 10e3, 150e3, "Psychology registration", "Hire other psychologists; telehealth extends reach."),
 "Dentist": ("8531", "dental-surgeons-general", "Dental practice", 35, 400e3, 1.5e6, "Dental registration; fit-out is expensive", "Multi-practice groups sell to corporates."),
 "Pharmacist": ("4271", "pharmacy", "Pharmacy", 20, 1e6, 5e6, "Only pharmacists can own; location rules limit new stores", "Groups of pharmacies; thin margin, high turnover."),
 "Genetic Counsellor": ("8539", None, "Genetic counselling practice", 55, 10e3, 100e3, "Professional certification", "Small market.", 1),
 "Aged Care Worker": ("8790", None, "Home care provider", 45, 50e3, 300e3, "Aged care provider registration", "Government-funded; scale matters."),
 "Disability Support Worker": ("8790", None, "NDIS provider", 55, 20e3, 200e3, "NDIS registration for some services", "Price caps limit margin."),
 "Accountant": ("6932", None, "Accounting practice", 75, 10e3, 100e3, "CA/CPA + tax agent registration", "Firms sell for ~1x recurring fees."),
 "Bookkeeper": ("6932", None, "Bookkeeping business", 90, 2e3, 20e3, "BAS agent registration for BAS work", "Cheap to start; software automates more each year."),
 "Financial Adviser": ("6419", None, "Financial advice firm", 45, 50e3, 300e3, "AFSL or authorised representative", "Recurring fees; sellable client book."),
 "Mortgage Broker": ("6419", None, "Mortgage broking business", 75, 10e3, 60e3, "Credit licence or credit representative", "Trail income builds a sellable book."),
 "Actuary": ("6962", None, "Actuarial consultancy", 70, 10e3, 100e3, "Fellowship (FIAA)", "Specialist consulting.", 2),
 "Investment Analyst": ("6419", None, "Investment fund", 30, 200e3, 2e6, "AFSL; you must raise investor money", "Fees on money managed: very high ceiling."),
 "Insurance Underwriter": ("6420", None, "Underwriting agency (MGA)", 30, 200e3, 2e6, "AFSL + an insurer to back you", "High ceiling once capacity is secured."),
 "Plumber": ("3231", "plumbing-services", "Plumbing business", 80, 30e3, 120e3, "Plumbing licence", "Maintenance contracts + crews."),
 "Electrician": ("3232", "electrical-services", "Electrical contracting business", 80, 30e3, 120e3, "Electrical contractor licence", "Commercial + solar/EV work."),
 "Refrigeration & AC Mechanic": ("3233", "air-conditioning-refrigeration-and-heating-services", "AC & refrigeration business", 75, 40e3, 150e3, "ARCtick licence + electrical licence", "Service contracts give recurring revenue."),
 "Roofer": ("3223", "roofing-services-includes-roof-tiling-guttering-and-metal-roofing", "Roofing company", 75, 30e3, 150e3, "Licence varies by state", "Insurance repair + new builds."),
 "Carpenter": ("3242", "carpentry-services", "Carpentry / building company", 85, 20e3, 100e3, "Builder licence for bigger jobs", "Path to builder: much bigger jobs."),
 "Bricklayer": ("3222", "bricklaying-services", "Bricklaying company", 85, 15e3, 80e3, "Licence varies by state", "Crews on volume builders."),
 "Plasterer": ("3241", "plastering-and-ceiling-services", "Plastering company", 85, 15e3, 80e3, "Licence varies by state", "Crew-based; commercial fit-outs."),
 "Concreter": ("3221", "concreting-services", "Concreting company", 75, 50e3, 250e3, "Licence varies by state; equipment", "Commercial + civil work."),
 "Landscaper": ("3291", "landscape-construction", "Landscaping company", 85, 20e3, 120e3, "Licence for structural work in some states", "Design + build + maintenance."),
 "Motor Mechanic": ("9419", None, "Mechanical workshop", 55, 100e3, 500e3, "Workshop lease + equipment; repairer licence in some states", "Fleet contracts help."),
 "Auto Electrician": ("9411", "automotive-electrical-services", "Auto electrical business", 75, 30e3, 200e3, "Electrical licence", "Mobile van start is cheap."),
 "Panel Beater": ("9412", "panel-beating-and-smash-repairs", "Smash repair shop", 40, 200e3, 1e6, "Workshop + spray booth", "Insurer contracts decide volume."),
 "Welder / Fabricator": ("2221", None, "Steel fabrication business", 55, 50e3, 500e3, "Workshop + equipment", "Structural steel contracts are large."),
 "Chef": ("4511", "restaurants", "Restaurant", 40, 150e3, 800e3, "Food licence; fit-out", "Groups of venues; most stay small."),
 "Barista": ("4511", "coffee-shops", "Cafe / coffee cart", 65, 20e3, 400e3, "Food licence", "Coffee cart is cheap; cafe fit-out is not."),
 "Hairdresser": ("9511", "hairdressers", "Hair salon", 70, 30e3, 200e3, "Licence in QLD only", "Chair rental lowers risk."),
 "Beauty Therapist": ("9511", "beauty-services", "Beauty / skin clinic", 70, 20e3, 200e3, "Some treatments need a nurse/doctor", "Cosmetic clinics scale higher."),
 "Personal Trainer": ("9111", "sports-and-physical-recreation-instruction", "PT / online coaching business", 90, 2e3, 30e3, "Cert IV + insurance", "Online coaching has no ceiling on clients."),
 "Retail Assistant": ("4251", "clothing-retailing", "Retail store", 50, 80e3, 400e3, "Lease + stock", "Online stores can scale."),
 "Real Estate Agent": ("6720", None, "Real estate agency", 60, 50e3, 300e3, "Real estate licence (full)", "Rent roll = sellable asset."),
 "Software Engineer": ("7000", None, "Software / SaaS company", 85, 0, 50e3, "None", "SaaS has the highest ceiling of any path here."),
 "Data Scientist": ("7000", None, "Data / analytics consultancy", 85, 0, 30e3, "None", "Consulting, or build a data product."),
 "AI / ML Engineer": ("7000", None, "AI product company", 70, 0, 500e3, "None; compute costs", "Venture-funded path."),
 "AI Solutions Engineer": ("7000", None, "AI implementation consultancy", 85, 0, 30e3, "None", "High demand right now."),
 "Cyber Security Analyst": ("7000", None, "Managed security business", 65, 20e3, 200e3, "Certifications; client trust takes time", "Recurring contracts."),
 "IT Support Technician": ("7000", None, "Managed IT services (MSP)", 80, 10e3, 80e3, "None", "Recurring monthly contracts."),
 "UX / Product Designer": ("6924", None, "Design studio", 85, 5e3, 50e3, "None", "Agency or product studio."),
 "Early Childhood Teacher": ("8710", "child-care-services", "Childcare centre", 30, 500e3, 3e6, "Service approval; building", "Multi-centre groups sell well."),
 "Primary Teacher": ("8219", "tutoring-and-coaching", "Tutoring centre", 80, 10e3, 150e3, "Working with children check", "Franchise or online."),
 "Secondary Teacher": ("8219", "tutoring-and-coaching", "Tutoring / exam prep business", 80, 10e3, 150e3, "Working with children check", "Online courses scale."),
 "University Lecturer": ("8219", None, "Online course / education business", 85, 2e3, 50e3, "None (RTO if accredited)", "Digital products: very high margin."),
 "Private Tutor": ("8219", "tutoring-and-coaching", "Tutoring business", 95, 0, 10e3, "Working with children check", "Hire tutors to grow."),
 "Solicitor": ("6931", None, "Law firm", 60, 30e3, 250e3, "Unrestricted practising certificate", "Partnership model."),
 "Barrister": ("6931", None, "Barrister's practice", 50, 30e3, 150e3, "Bar admission; must work alone by rule", "Cannot hire other barristers: income is your own hours.", 1),
 "Paralegal": ("6931", None, "Conveyancing business", 75, 10e3, 80e3, "Conveyancer licence", "Online conveyancing scales."),
 "Police Officer": ("7712", None, "Security / investigations firm", 60, 30e3, 200e3, "Security licence", "Guarding contracts are large but thin."),
 "Firefighter": ("3234", None, "Fire safety services business", 65, 30e3, 200e3, "Fire protection licence", "Compliance inspections recur every year."),
 "Graphic Designer": ("6924", None, "Design studio", 90, 2e3, 30e3, "None", "AI pushes low-end prices down."),
 "Copywriter": ("6940", None, "Content / marketing agency", 90, 0, 20e3, "None", "Agency model scales."),
 "Photographer": ("6991", None, "Photography business", 85, 10e3, 50e3, "None", "Mostly stays small.", 2),
 "Video Editor": ("5511", None, "Video production company", 80, 10e3, 100e3, "None", "Commercial and brand work."),
 "Game Developer": ("5420", None, "Game studio", 60, 0, 500e3, "None", "Hit-driven: most earn little, a few earn millions."),
 "Truck Driver": ("4610", "road-freight-transport-services", "Trucking company", 55, 150e3, 600e3, "Heavy vehicle licence; truck finance", "Fleets reach $10m+, thin margin."),
 "Forklift Operator": ("7212", None, "Labour hire company", 55, 50e3, 300e3, "Labour hire licence in some states", "Cash-flow heavy."),
 "Warehouse Worker": ("5309", None, "Warehousing / 3PL business", 30, 300e3, 3e6, "Warehouse lease + equipment", "Scale-driven."),
 "Airline Pilot": ("4900", None, "Charter airline", 15, 1e6, 10e6, "CASA Air Operator Certificate", "Very capital heavy."),
 "Drone Operator": ("6923", None, "Drone survey business", 80, 15e3, 100e3, "CASA ReOC + RePL", "Mining, construction, inspection."),
 "Mining Engineer": ("6923", None, "Engineering consultancy", 70, 10e3, 100e3, "Chartered status helps", "Consulting firms scale with staff."),
 "Drill Operator (FIFO)": ("1090", None, "Drilling contractor", 25, 1e6, 10e6, "Rigs cost millions", "Big contracts, big capital."),
 "Solar Installer": ("3232", "electrical-services", "Solar installation business", 75, 30e3, 150e3, "Electrical licence + SAA accreditation", "Rebate changes cause boom and bust."),
 "Wind Turbine Technician": ("3232", None, "Wind O&M contractor", 35, 200e3, 2e6, "Specialist safety certification", "Few large contracts."),
 # ---- business-only nodes (not one job) ----
 "Fencing Company": ("3299", "fence-construction", "Fencing company", 85, 20e3, 100e3, "Licence for larger jobs in some states", "Simple to start; residential + rural + commercial."),
 "Painting Company": ("3244", "painting-services", "Painting company", 90, 5e3, 40e3, "Licence over set job value in some states", "Crews on builders and strata."),
 "Pest Control Business": ("7312", "pest-control-services", "Pest control business", 80, 20e3, 80e3, "Pest management licence", "Recurring annual inspections."),
 "Commercial Cleaning Company": ("7311", "cleaning-services-building-and-other-industrial", "Commercial cleaning company", 95, 2e3, 30e3, "None", "Contracts scale to $10m+; thin margin at scale."),
 "Lawn Mowing & Gardening": ("7313", "lawn-mowing-and-garden-services", "Lawn mowing & gardening", 95, 5e3, 30e3, "None", "Rounds can be sold; franchise model common."),
 "Supermarket": ("4110", "grocery-retailing-and-convenience-stores", "Independent supermarket", 10, 2e6, 20e6, "Huge capital; supplier deals; big chains dominate", "Not realistic to start alone; usually bought or franchised."),
 "Pub / Bar": ("4520", None, "Pub / bar", 20, 1e6, 5e6, "Liquor licence; venue", "Gaming and property drive pub value."),
 "Vet Clinic": ("6970", "veterinary-services", "Vet clinic", 35, 300e3, 1.5e6, "Veterinary registration", "Corporates buy clinics."),
 "Gym": ("9111", "health-and-fitness-centres", "Gym / fitness centre", 45, 100e3, 1e6, "Lease + equipment", "Franchise or boutique studio."),
}

# Business-only nodes: where they sit on the map + fields the app needs.
# placement: (sector, group), training level, AI risk, margin [lo,hi] fallback
NODES = [
 ("Fencing Company", "Trades", "Construction", 1, 8),
 ("Painting Company", "Trades", "Construction", 1, 8),
 ("Pest Control Business", "Trades", "Building Services", 1, 10),
 ("Commercial Cleaning Company", "Service & Hospitality", "Personal Services", 0, 25),
 ("Lawn Mowing & Gardening", "Service & Hospitality", "Personal Services", 0, 15),
 ("Gym", "Service & Hospitality", "Personal Services", 1, 15),
 ("Supermarket", "Service & Hospitality", "Sales & Retail", 0, 45),
 ("Pub / Bar", "Service & Hospitality", "Food & Drink", 0, 20),
 ("Vet Clinic", "Medical & Health", "Nursing & Allied", 4, 10),
]

cls = abs_d["classes"]; sub = abs_d["sub"]
used = sorted({v[0] for v in B.values()})
ind = {}
for c in used:
    x = cls[c]
    sc = c[:2].lstrip("0") or "0"
    s = sub.get(sc) or sub.get(c[:2])
    ind[c] = {"label": x["label"], "bands": x["bands"], "total": x["total"],
              "sub": s["label"] if s else None, "surv": s["rate4y"] if s else None}
ato = {k: {"bands": v[0], "exp": v[1]} for k, v in ato_d.items() if k in {b[1] for b in B.values()}}
biz = {k: {"anz": v[0], "ato": v[1], "name": v[2], "start": v[3], "cap": [v[4], v[5]], "lic": v[6], "scale": v[7],
          "max": v[8] if len(v) > 8 else 3} for k, v in B.items()}

out = []
out.append("// AUTO-GENERATED by tools/build_biz.py. Edit the mapping there, then re-run.")
out.append("// ABS: 8165.0 Counts of Australian Businesses, June 2025 (data cube 3), all states summed.")
out.append("// ABS survival: 8165.0 data cube 6, businesses operating June 2021 still operating June 2025, by subdivision.")
out.append("// ATO: Small business benchmarks 2023-24, average total expenses as % of turnover.")
out.append("// Start score, capital and licence notes are judgement estimates.")
out.append("const ABS_TURNOVER_BANDS = ['<$50k','$50k–200k','$200k–2m','$2m–5m','$5m–10m','$10m+'];")
out.append("const ABS_SOURCE = 'ABS 8165.0 Counts of Australian Businesses, June 2025';")
out.append("const ABS_URL = 'https://www.abs.gov.au/statistics/economy/business-indicators/counts-australian-businesses-including-entries-and-exits/jul2021-jun2025';")
out.append("const ATO_BM_SOURCE = 'ATO Small business benchmarks 2023-24';")
out.append("const ATO_BM_URL = 'https://www.ato.gov.au/businesses-and-organisations/income-deductions-and-concessions/small-business-benchmarks/in-detail/';")
out.append("const IND = " + json.dumps(ind, indent=0) + ";")
out.append("const ATO_BM = " + json.dumps(ato, indent=0) + ";")
out.append("const BIZ = " + json.dumps(biz, indent=0) + ";")
out.append("const BIZ_NODES = " + json.dumps([{"n": n, "sector": s, "group": g, "t": t, "ai": ai} for n, s, g, t, ai in NODES]) + ";")
print("\n".join(out))
