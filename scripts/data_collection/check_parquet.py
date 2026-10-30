import glob
import pyarrow.parquet as pq

for f in glob.glob('data/raw/*/*.parquet'):
    try:
        pq.read_metadata(f)
    except Exception as e:
        print(f"Corrupted: {f}")
