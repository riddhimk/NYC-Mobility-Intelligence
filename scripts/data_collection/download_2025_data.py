import os
import urllib.request
import re
import sys
from urllib.error import URLError, HTTPError

def report(count, block_size, total_size):
    if total_size > 0:
        percent = int(count * block_size * 100 / total_size)
        if percent % 10 == 0:
            sys.stdout.write(f"\rDownloading... {percent}%")
            sys.stdout.flush()

def download_tlc_data(base_dir):
    data_dir = os.path.join(base_dir, 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    url = 'https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    print("Fetching TLC data page...")
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
    except Exception as e:
        print(f"Error fetching page: {e}")
        return
        
    links = re.findall(r'href=[\'"]?([^\'" >]+)', html)
    parquet_links = [l for l in links if '2025' in l and l.endswith('.parquet')]
    
    if not parquet_links:
        print("No 2025 parquet links found.")
        return
        
    parquet_links = list(set(parquet_links))
    print(f"Found {len(parquet_links)} files to download.")
    
    # Sort for predictability
    parquet_links.sort()
    
    for i, link in enumerate(parquet_links):
        filename = link.split('/')[-1]
        
        match = re.search(r'([a-z]+)_tripdata_2025-(\d{2})\.parquet', filename)
        if match:
            category = match.group(1)
            month = match.group(2)
            
            month_dir = os.path.join(data_dir, f'2025-{month}')
            os.makedirs(month_dir, exist_ok=True)
            
            file_path = os.path.join(month_dir, filename)
            
            # Check if file exists and has size
            if os.path.exists(file_path):
                size = os.path.getsize(file_path)
                if size > 1024:
                    print(f"[{i+1}/{len(parquet_links)}] File {filename} already exists, skipping...")
                    continue
                
            print(f"\n[{i+1}/{len(parquet_links)}] Downloading {filename} into {month_dir}...")
            try:
                urllib.request.urlretrieve(link, file_path, reporthook=report)
                print(f"\nSuccessfully downloaded {filename}")
            except HTTPError as e:
                print(f"\nHTTP Error for {link}: {e.code}")
            except URLError as e:
                print(f"\nURL Error for {link}: {e.reason}")
            except Exception as e:
                print(f"\nError downloading {link}: {e}")

if __name__ == '__main__':
    workspace_dir = r'd:\College\BDA Project'
    download_tlc_data(workspace_dir)
