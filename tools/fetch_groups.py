import csv, json, re, sys, html, urllib.request
from concurrent.futures import ThreadPoolExecutor
CSV, OUT = sys.argv[1], sys.argv[2]
UA = {"User-Agent": "Mozilla/5.0"}
def get(url):
    for _ in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
                return r.read().decode("utf-8", "replace")
        except Exception as e:
            err = e
    return None
def text(h): return html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", h)))
codes = []
for r in csv.DictReader(open(CSV, encoding="utf-8-sig")):
    if r["Occupation matrix group"] == "All occupations": codes.append(r["ANZSCO unit code"].strip())
# JSA listing -> slugs for 4-digit pages
base = "https://www.jobsandskills.gov.au/data/occupation-and-industry-profiles/occupations-anzsco"
def listing(p):
    h = get(f"{base}?page={p}") or ""
    return re.findall(r'occupations-anzsco/(\d{4}-[a-z0-9-]+)"', h)
slugs = {}
with ThreadPoolExecutor(8) as ex:
    for lst in ex.map(listing, range(110)):
        for s in lst: slugs.setdefault(s[:4], s)
def jsa(code):
    s = slugs.get(code)
    if not s: return code, None, None
    h = get(f"{base}/{s}")
    if not h: return code, s, None
    m = re.search(r"Median weekly earnings\s*(\$[\d,]+|N/A)", text(h))
    v = m.group(1) if m else None
    return code, s, (int(v.replace("$", "").replace(",", "")) if v and v.startswith("$") else None)
def abs_(code):
    u = f"https://www.abs.gov.au/statistics/classifications/anzsco-australian-and-new-zealand-standard-classification-occupations/2022/browse-classification/{code[0]}/{code[:2]}/{code[:3]}/{code}"
    h = get(u)
    if not h: return code, None
    t = text(h)
    au = re.search(r"In Australia:(.*?)(In New Zealand:|$)", t)
    lv = sorted({int(x) for x in re.findall(r"Skill Level (\d)", au.group(1) if au else t)})
    lic = "Registration or licensing is required" in t
    d = re.search(r"Unit Group \d{4} [^|]*?\s{0,3}(?:Description\s*)?([A-Z][^.]{20,300}\.)\s*Indicative Skill Level", t)
    return code, {"levels": lv, "lic": lic, "desc": d.group(1).strip() if d else None}
res = {c: {} for c in codes}
with ThreadPoolExecutor(8) as ex:
    for c, s, w in ex.map(jsa, codes): res[c].update({"jsaSlug": s, "jsaWeekly": w})
    for c, a in ex.map(abs_, codes): res[c].update(a or {"levels": [], "lic": None, "desc": None})
json.dump(res, open(OUT, "w"), indent=0)
print("codes", len(codes), "slugs", sum(1 for v in res.values() if v["jsaSlug"]), "earnings", sum(1 for v in res.values() if v["jsaWeekly"]),
      "levels", sum(1 for v in res.values() if v["levels"]), "desc", sum(1 for v in res.values() if v["desc"]))
