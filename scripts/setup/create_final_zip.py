import os
import zipfile
import time

def create_zip():
    output_zip = r"C:\Users\Riddhim\Downloads\BDA-Project-Final.zip"
    root_dir = r"C:\Users\Riddhim\Desktop\BDA-Project"

    os.makedirs(os.path.dirname(output_zip), exist_ok=True)
    if os.path.exists(output_zip):
        os.remove(output_zip)

    # Directories to strictly exclude
    exclude_dirs = {
        'venv',
        'node_modules',
        '.git',
        '.gemini',
        '__pycache__',
        '.pytest_cache',
        'dist',
        '.vite',
        'checkpoints',
        'curated',
        'raw'
    }

    start_time = time.time()
    total_files = 0
    total_uncompressed_bytes = 0

    print(f"Creating archive: {output_zip} ...")

    with zipfile.ZipFile(output_zip, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zipf:
        for root, dirs, files in os.walk(root_dir):
            # Prune excluded directories in-place
            dirs[:] = [d for d in dirs if d not in exclude_dirs]

            # Also check relative path segments
            rel_dir = os.path.relpath(root, root_dir)
            parts = rel_dir.replace('\\', '/').split('/')
            if any(p in exclude_dirs for p in parts):
                continue
            
            # Specifically ensure data/curated or data/raw are never traversed
            if 'data/curated' in rel_dir.replace('\\', '/') or 'data/raw' in rel_dir.replace('\\', '/'):
                continue

            for file in files:
                # Skip pyc and temp files
                if file.endswith('.pyc') or file.startswith('.~') or file.startswith('.git'):
                    continue

                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, root_dir)

                # Skip any stray huge file over 60MB just in case
                file_size = os.path.getsize(full_path)
                if file_size > 65 * 1024 * 1024:
                    print(f"Skipping oversized file: {rel_path} ({file_size / (1024*1024):.1f} MB)")
                    continue

                zipf.write(full_path, arcname=rel_path)
                total_files += 1
                total_uncompressed_bytes += file_size

    elapsed = time.time() - start_time
    zip_size_mb = os.path.getsize(output_zip) / (1024 * 1024)
    print(f"SUCCESS! Added {total_files} files.")
    print(f"Archive Size: {zip_size_mb:.2f} MB")
    print(f"Elapsed Time: {elapsed:.2f} seconds")

if __name__ == "__main__":
    create_zip()

