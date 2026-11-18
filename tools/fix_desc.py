import json, re, sys, html, urllib.request, csv
from concurrent.futures import ThreadPoolExecutor
J, CSV = sys.argv[1], sys.argv[2]
d = json.load(open(J))
titles = {r["ANZSCO unit code"].strip(): r["ANZSCO unit title"].strip() for r in csv.DictReader(open(CSV, encoding="utf-8-sig"))}
def get(u):
    try:
        with urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=40) as r: return r.read().decode("utf-8", "replace")
    except Exception: return None
def text(h): return html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", h)))
def desc(code):
    h = get(f"https://www.abs.gov.au/statistics/classifications/anzsco-australian-and-new-zealand-standard-classification-occupations/2022/browse-classification/{code[0]}/{code[:2]}/{code[:3]}/{code}")
    if not h: return code, None
    t = text(h); i = t.find("Indicative Skill Level")
    if i < 0: return code, None
    pre = t[:i].strip()
    j = pre.rfind(f"{code} ")
    if j < 0: return code, None
    s = pre[j + 5:].strip()
    # s = "<Title> <Description...>". Description starts at the 2nd capitalised run that repeats a title word, so cut the title by its word count.
    words = s.split(" ")
    ab_title_len = None
    for k in range(1, min(12, len(words))):
        rest = " ".join(words[k:])
        if re.match(r"^[A-Z][a-z]", rest) and (" " + words[k].lower()[:5]) in (" " + " ".join(words[:k]).lower()):
            ab_title_len = k; break
    out = " ".join(words[ab_title_len:]) if ab_title_len else s
    return code, out[:400]
with ThreadPoolExecutor(8) as ex:
    for c, s in ex.map(desc, list(d)): d[c]["desc"] = s
est = {"1212": [1], "1214": [1], "2232": [1], "3612": [4], "3622": [3], "8411": [5], "8412": [5], "8413": [4], "8414": [5], "8415": [5], "8416": [5], "8419": [5]}
for c, lv in est.items():
    if not d[c]["levels"]: d[c]["levels"] = lv; d[c]["levelEst"] = True
json.dump(d, open(J, "w"), indent=0)
print("desc", sum(1 for v in d.values() if v["desc"]))
for k in ["3341", "2613", "8212", "1111", "2211", "3513"]: print(k, d[k]["desc"])
