import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def create_document():
    doc = docx.Document()

    # Set page margins
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Document Title
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_after = Pt(4)
    run_title = p_title.add_run("NYC Mobility Intelligence Platform")
    run_title.font.name = "Calibri"
    run_title.font.size = Pt(24)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(16, 44, 87) # Deep Navy

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_after = Pt(16)
    run_sub = p_sub.add_run("System Startup Guide & Spark Cluster Demonstration Walkthrough")
    run_sub.font.name = "Calibri"
    run_sub.font.size = Pt(13)
    run_sub.font.italic = True
    run_sub.font.color.rgb = RGBColor(80, 80, 80)

    # Section 1: Overview
    h1 = doc.add_heading("1. Project Overview & Architecture", level=1)
    h1.paragraph_format.space_before = Pt(12)
    h1.paragraph_format.space_after = Pt(6)

    p1 = doc.add_paragraph(
        "The NYC Mobility Intelligence Platform is an enterprise-grade Big Data Analytics and Machine Learning "
        "system analyzing tens of millions of official New York City Taxi & Limousine Commission (TLC) trip records. "
        "The platform combines three core subsystems:"
    )
    p1.paragraph_format.space_after = Pt(4)

    bullet_points = [
        ("Web Platform & Interactive Dashboard: ", "A modern React frontend paired with a FastAPI backend offering demand forecasting, explainable fare prediction, taxi zone exploration (263 zones), and real-time trip simulation."),
        ("Machine Learning Models: ", "Trained Random Forest, XGBoost, and ARIMA-mimic models delivering zone-level passenger demand forecasting and fare calculation with realistic NYC road detour factors (1.32x) and TLC regulatory flat rates."),
        ("Distributed Apache Spark Cluster: ", "A 4-node standalone cluster running 1 Master and 3 Worker nodes in Docker, demonstrating distributed dataset partitioning, parallel task execution across 6 cores, and inter-node network data shuffles (>1.6 GB exchanged).")
    ]
    for bold_prefix, text in bullet_points:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        r_b = p.add_run(bold_prefix)
        r_b.font.bold = True
        p.add_run(text)

    # Section 2: Prerequisites
    h2 = doc.add_heading("2. Prerequisites & Requirements", level=1)
    h2.paragraph_format.space_before = Pt(14)
    h2.paragraph_format.space_after = Pt(6)

    p_pre = doc.add_paragraph("Before launching, ensure the following software is installed on the host machine:")
    p_pre.paragraph_format.space_after = Pt(6)

    prereqs = [
        ("Python 3.10 or higher: ", "Required for running the backend and analytical modules."),
        ("Node.js 18+ & npm: ", "Required for building and running the React frontend dashboard."),
        ("Docker Desktop (CRITICAL): ", "Must be installed and RUNNING before starting the Spark cluster. Open the Docker Desktop application on your machine and verify the bottom-left corner indicates 'Engine running' in green.")
    ]
    for b_title, b_desc in prereqs:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        rb = p.add_run(b_title)
        rb.font.bold = True
        p.add_run(b_desc)

    # Section 3: Step-by-Step Startup
    h3 = doc.add_heading("3. Step-by-Step System Startup", level=1)
    h3.paragraph_format.space_before = Pt(14)
    h3.paragraph_format.space_after = Pt(6)

    # Substep A
    h3_a = doc.add_heading("Step A: Start the FastAPI Backend Server", level=2)
    h3_a.paragraph_format.space_before = Pt(8)
    h3_a.paragraph_format.space_after = Pt(4)

    doc.add_paragraph("Open a terminal (PowerShell or Bash) in the project root directory and execute:")
    
    table_cmd1 = doc.add_table(rows=1, cols=1)
    table_cmd1.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell1 = table_cmd1.rows[0].cells[0]
    set_cell_background(cell1, "F4F6F8")
    p_cmd1 = cell1.paragraphs[0]
    p_cmd1.paragraph_format.space_before = Pt(4)
    p_cmd1.paragraph_format.space_after = Pt(4)
    run_cmd1 = p_cmd1.add_run(
        "python -m venv venv\n"
        ".\\venv\\Scripts\\activate          # (Linux/macOS: source venv/bin/activate)\n"
        "pip install -r requirements.txt\n"
        "uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"
    )
    run_cmd1.font.name = "Consolas"
    run_cmd1.font.size = Pt(9.5)

    doc.add_paragraph(
        "Verification: Open your browser and navigate to http://localhost:8000 (status confirmation) or "
        "http://localhost:8000/docs (interactive OpenAPI documentation).\n"
        "Note on Database: If MongoDB is not installed locally, the backend automatically serves curated "
        "offline datasets for all 263 zones, ML models, and network graphs without raising errors."
    )

    # Substep B
    h3_b = doc.add_heading("Step B: Start the React Frontend Dashboard", level=2)
    h3_b.paragraph_format.space_before = Pt(10)
    h3_b.paragraph_format.space_after = Pt(4)

    doc.add_paragraph("Open a second terminal window in the project root directory and run:")

    table_cmd2 = doc.add_table(rows=1, cols=1)
    table_cmd2.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell2 = table_cmd2.rows[0].cells[0]
    set_cell_background(cell2, "F4F6F8")
    p_cmd2 = cell2.paragraphs[0]
    p_cmd2.paragraph_format.space_before = Pt(4)
    p_cmd2.paragraph_format.space_after = Pt(4)
    run_cmd2 = p_cmd2.add_run(
        "cd frontend\n"
        "npm install\n"
        "npm run dev"
    )
    run_cmd2.font.name = "Consolas"
    run_cmd2.font.size = Pt(9.5)

    doc.add_paragraph(
        "Verification: Open http://localhost:5173. You can now explore the full platform: Zone Explorer, "
        "Demand Forecasting, Fare Predictor, Anomaly Detection, and Real-Time Simulation."
    )

    # Substep C
    h3_c = doc.add_heading("Step C: Launch the 4-Node Apache Spark Cluster", level=2)
    h3_c.paragraph_format.space_before = Pt(10)
    h3_c.paragraph_format.space_after = Pt(4)

    doc.add_paragraph(
        "Ensure Docker Desktop is open and running. Open a third terminal window in the project root and start the cluster:"
    )

    table_cmd3 = doc.add_table(rows=1, cols=1)
    table_cmd3.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell3 = table_cmd3.rows[0].cells[0]
    set_cell_background(cell3, "F4F6F8")
    p_cmd3 = cell3.paragraphs[0]
    p_cmd3.paragraph_format.space_before = Pt(4)
    p_cmd3.paragraph_format.space_after = Pt(4)
    run_cmd3 = p_cmd3.add_run(
        "docker compose -f docker-compose.spark.yml up -d\n"
        ".\\scripts\\run_spark_cluster_demo.bat"
    )
    run_cmd3.font.name = "Consolas"
    run_cmd3.font.size = Pt(9.5)

    doc.add_paragraph(
        "This command spins up 4 Docker containers (1 Master + 3 Workers) and triggers the distributed PySpark "
        "job. Once the computations complete, the script stays paused in presentation mode so the Web UIs remain open."
    )

    # Section 4: How to Read the Cluster Pages
    h4 = doc.add_heading("4. How to View & Read the Spark Cluster Pages", level=1)
    h4.paragraph_format.space_before = Pt(14)
    h4.paragraph_format.space_after = Pt(6)

    doc.add_paragraph(
        "This is the most critical section for academic presentation and technical demonstration. "
        "Spark exposes two primary Web Dashboards:"
    )

    # Sub-page 1: Port 8080
    h4_a = doc.add_heading("A. Spark Master Dashboard (http://localhost:8080)", level=2)
    h4_a.paragraph_format.space_before = Pt(8)
    h4_a.paragraph_format.space_after = Pt(4)

    doc.add_paragraph(
        "The Master UI is always online while the Docker containers are active. It represents the hardware "
        "and resource management plane:"
    )

    m_points = [
        ("Workers Table (3 Alive): ", "Shows three distinct worker containers registered (spark-worker-1, spark-worker-2, spark-worker-3). Each worker has its own IP on the virtual bridge network (e.g., 172.18.0.3, 172.18.0.4, 172.18.0.5)."),
        ("Compute Capacity: ", "Highlights '6 Cores Total' (2 cores per worker) and '9.0 GiB Memory Total' (3.0 GiB allocated per worker)."),
        ("Applications: ", "Displays running or completed jobs (e.g., 'NYCMobility-Distributed-Cluster-Demo') and confirms that the job acquired all 6 cores across the cluster.")
    ]
    for b_title, b_desc in m_points:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        rb = p.add_run(b_title)
        rb.font.bold = True
        p.add_run(b_desc)

    # Sub-page 2: Port 4040
    h4_b = doc.add_heading("B. Spark Application UI (http://localhost:4040)", level=2)
    h4_b.paragraph_format.space_before = Pt(10)
    h4_b.paragraph_format.space_after = Pt(4)

    doc.add_paragraph(
        "Port 4040 is the dynamic Application / SparkContext Web UI. It is created when a job connects and remains "
        "accessible while the job is active. Key tabs to inspect during a review:"
    )

    app_tabs = [
        ("1. Executors Tab (http://localhost:4040/executors/):", 
         "This is the proof of distributed parallel execution. Look at the Executors table:\n"
         "• 4 Active Entities: 1 Driver (spark-master) and 3 Worker Executors (0, 1, 2).\n"
         "• Task Distribution: Tasks are evenly balanced across workers (e.g., 11 tasks on Node 0, 8 tasks on Node 1, 10 tasks on Node 2).\n"
         "• Shuffle Write / Shuffle Read: Each worker writes and reads ~200 MB of data over the network. This proves inter-node communication."),
        ("2. Stages Tab (http://localhost:4040/stages/):", 
         "Breaks down the job into Map and Reduce phases:\n"
         "• Stage 1 (Map Phase): Shows 52 partitions scanned. 6 tasks run simultaneously in parallel. Total CPU time is ~13 minutes, but completes in only 2.2 minutes wall-clock time (~6x speedup).\n"
         "• Stage 3 (Reduce Phase): Reads 1,627.6 MiB of shuffled data across the network to compute the global top taxi zones."),
        ("3. DAG Visualization (Directed Acyclic Graph):", 
         "Click on Stage 1 or Stage 3 and toggle 'DAG Visualization':\n"
         "• Shows: Scan Parquet → WholeStageCodegen → Exchange (Shuffle).\n"
         "• The 'Exchange' box visually represents the network boundary where records with the same pickup zone key are redistributed to the correct node for the final aggregation."),
        ("4. Memory Management & Disk Spill:", 
         "Under Stage details, notice 'Spill (Disk): ~759 MiB'. When cluster memory reached capacity during heavy grouping, Spark automatically spilled temporary partitions to disk rather than throwing an Out-of-Memory error.")
    ]
    for tab_title, tab_desc in app_tabs:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(4)
        rt = p.add_run(tab_title + " ")
        rt.font.bold = True
        p.add_run(tab_desc)

    # Section 5: Stopping & Teardown
    h5 = doc.add_heading("5. Clean Shutdown & Cluster Teardown", level=1)
    h5.paragraph_format.space_before = Pt(14)
    h5.paragraph_format.space_after = Pt(6)

    shutdown_steps = [
        ("Stop Spark Application: ", "Switch back to the terminal running the batch script and press [Enter]. The SparkContext closes cleanly."),
        ("Stop Docker Containers: ", "To completely shut down the 4 containers and free system memory, run:\n   docker compose -f docker-compose.spark.yml down"),
        ("Stop Frontend & Backend: ", "Press Ctrl + C in both the backend and frontend terminal windows.")
    ]
    for s_title, s_desc in shutdown_steps:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        rs = p.add_run(s_title)
        rs.font.bold = True
        p.add_run(s_desc)

    # Save document
    doc.save("Information.docx")
    print("Information.docx created successfully!")

if __name__ == "__main__":
    create_document()

