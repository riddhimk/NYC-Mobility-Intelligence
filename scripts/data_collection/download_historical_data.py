import os
import urllib.request
import re
import sys
from urllib.error import URLError, HTTPError
from concurrent.futures import ThreadPoolExecutor, as_completed

def download_file(url, target_path):
    if os.path.exists(target_path):
        size = os.path.getsize(target_path)
        # Assuming completely downloaded parquet files are at least 1MB
        if size > 1024 * 1024:
            return f"Skipped (exists): {os.path.basename(target_path)}"
        else:
            # Delete corrupted partial download
            os.remove(target_path)
            
    try:
        # Some CDNs block default python user-agent
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(target_path, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
        return f"Downloaded: {os.path.basename(target_path)}"
    except Exception as e:
        return f"Error downloading {os.path.basename(target_path)}: {e}"

def main():
    base_dir = os.path.abspath(os.path.dirname(__file__))
    raw_dir = os.path.join(base_dir, 'data', 'raw')
    meta_dir = os.path.join(base_dir, 'data', 'metadata')
    
    os.makedirs(meta_dir, exist_ok=True)
    for cat in ['yellow', 'green', 'fhv', 'fhvhv']:
        os.makedirs(os.path.join(raw_dir, cat), exist_ok=True)
        
    url = 'https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page'
    print("Fetching TLC data page...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
    except Exception as e:
        print(f"Error fetching page: {e}")
        return
        
    links = re.findall(r'href=[\'"]?([^\'" >]+)', html)
    
    # 1. Download Metadata PDFs
    pdfs = [l for l in links if l.lower().endswith('.pdf')]
    pdf_tasks = []
    print("\n--- Downloading Data Dictionaries ---")
    for pdf in set(pdfs):
        full_url = pdf if pdf.startswith('http') else 'https://www.nyc.gov' + pdf
        filename = full_url.split('/')[-1]
        target_path = os.path.join(meta_dir, filename)
        pdf_tasks.append((full_url, target_path))
        
    # Download PDFs sequentially (they are small)
    for url, path in pdf_tasks:
        print(download_file(url, path))
        
    # 2. Extract Parquet links
    parquet_links = list(set([l for l in links if l.endswith('.parquet')]))
    
    download_tasks = []
    for link in parquet_links:
        filename = link.split('/')[-1]
        # Match pattern like yellow_tripdata_2015-01.parquet
        match = re.search(r'([a-z]+)_tripdata_(\d{4})-(\d{2})\.parquet', filename)
        if match:
            category = match.group(1)
            year = int(match.group(2))
            
            # Map category to our folders if needed
            folder = category
            if folder == 'hvfhs': folder = 'fhvhv' # Sometimes named hvfhs
            
            target_folder = os.path.join(raw_dir, folder)
            if not os.path.exists(target_folder):
                os.makedirs(target_folder, exist_ok=True)
                
            target_path = os.path.join(target_folder, filename)
            download_tasks.append((link, target_path))
            
    print(f"\n--- Found {len(download_tasks)} Parquet files to download ---")
    print("Starting massive parallel download (4 threads)... This will take a LONG time.")
    
    success_count = 0
    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = {executor.submit(download_file, url, path): path for url, path in download_tasks}
        for i, future in enumerate(as_completed(futures)):
            result = future.result()
            print(f"[{i+1}/{len(download_tasks)}] {result}")
            if "Downloaded" in result or "Skipped" in result:
                success_count += 1
                
    print(f"\nDownload complete! Successfully processed {success_count} / {len(download_tasks)} files.")

if __name__ == '__main__':
    main()
