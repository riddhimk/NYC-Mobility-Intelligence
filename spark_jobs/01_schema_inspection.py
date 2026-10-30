import pyarrow.parquet as pq
import glob
import os

categories = ['yellow', 'green', 'fhv', 'fhvhv']
base_dir = 'data/raw'

for cat in categories:
    files = glob.glob(f'{base_dir}/{cat}/*.parquet')
    if files:
        sample_file = files[0]
        print(f"=== Schema for {cat} ===")
        schema = pq.read_schema(sample_file)
        for name in schema.names:
            print(f"  - {name}: {schema.field(name).type}")
        print("\n")
    else:
        print(f"No files found for {cat}\n")
