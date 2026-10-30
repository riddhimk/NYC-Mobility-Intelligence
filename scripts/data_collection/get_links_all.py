import urllib.request
import re

url = 'https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')

links = re.findall(r'href=[\'"]?([^\'" >]+)', html)
parquet_links = [l for l in links if l.endswith('.parquet')]
print("Parquet links:")
for l in parquet_links:
    if 'zone' in l.lower():
        print("Zone parquet:", l)
