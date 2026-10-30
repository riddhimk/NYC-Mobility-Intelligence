import urllib.request
import re

url = 'https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')

links = re.findall(r'href=[\'"]?([^\'" >]+)', html)
pdfs = [l for l in links if l.lower().endswith('.pdf')]
for p in set(pdfs):
    print(p)
