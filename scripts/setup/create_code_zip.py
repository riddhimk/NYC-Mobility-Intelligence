import os
import zipfile
import time

def create_code_zip():
    output_zip = r"C:\Users\Riddhim\Downloads\BDA-Project-Code.zip"
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
        'raw',
        'results',
        'metadata'
    }

    # Code / config / documentation file extensions only
    code_extensions = {
        '.py', '.ts', '.tsx', '.js', '.jsx', '.json',
        '.html', '.css', '.bat', '.ps1', '.sh',
        '.yml', '.yaml', '.md', '.txt', '.csv'
    }

    # Explicit files to exclude (e.g. binaries, huge models, zip files)
    exclude_files = {
        'BDA-Project-Final.zip',
        'BDA-Project-Code.zip',
        '8. Evaluation Plan with Rubrics.pdf',
        'Information.docx'
    }

    start_time = time.time()
    total_files = 0
    total_uncompressed_bytes = 0

    print(f"Creating Code-Only archive: {output_zip} ...")

    with zipfile.ZipFile(output_zip, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
        for root, dirs, files in os.walk(root_dir):
            # Prune excluded directories in-place
            dirs[:] = [d for d in dirs if d not in exclude_dirs]

            rel_dir = os.path.relpath(root, root_dir)
            parts = rel_dir.replace('\\', '/').split('/')
            if any(p in exclude_dirs for p in parts):
                continue

            # Skip models directory containing binary .pkl models
            if parts[0] == 'models':
                continue
            if 'data/models' in rel_dir.replace('\\', '/'):
                continue

            for file in files:
                if file in exclude_files:
                    continue
                if file.startswith('.') or file.endswith('.pyc') or file.endswith('.pkl'):
                    continue

                _, ext = os.path.splitext(file)
                if ext.lower() not in code_extensions:
                    continue

                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, root_dir)

                # Skip any stray file over 10MB
                file_size = os.path.getsize(full_path)
                if file_size > 10 * 1024 * 1024:
                    print(f"Skipping oversized file: {rel_path} ({file_size / (1024*1024):.1f} MB)")
                    continue

                zipf.write(full_path, arcname=rel_path)
                total_files += 1
                total_uncompressed_bytes += file_size

    elapsed = time.time() - start_time
    zip_size_kb = os.path.getsize(output_zip) / 1024
    print(f"SUCCESS! Added {total_files} code files.")
    print(f"Archive Size: {zip_size_kb:.2f} KB ({zip_size_kb/1024:.2f} MB)")
    print(f"Elapsed Time: {elapsed:.2f} seconds")

if __name__ == "__main__":
    create_code_zip()

