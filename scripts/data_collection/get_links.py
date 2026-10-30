import urllib.request
import re

url = 'https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')

links = re.findall(r'href=[\'"]?([^\'" >]+)', html)
csv_links = [l for l in links if 'zone' in l.lower() and l.endswith('.csv')]
shape_links = [l for l in links if 'zone' in l.lower() and l.endswith('.zip') or l.endswith('parquet') and 'zone' in l.lower()]
print("CSV Links:", set(csv_links))
print("Shape/Zone Links:", set(shape_links))
