import re

with open("backend/main.py", "r") as f:
    content = f.read()

# Replace the joblib.load line with a dynamic absolute path
new_load = """
    try:
        import os
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(base_dir, "models", "rf_demand_model.pkl")
        model = joblib.load(model_path)
"""

content = re.sub(r'\s*try:\n\s*model = joblib\.load\(.*?\)', new_load, content, count=1)

with open("backend/main.py", "w") as f:
    f.write(content)
