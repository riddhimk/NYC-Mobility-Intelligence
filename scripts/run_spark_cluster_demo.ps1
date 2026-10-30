Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   NYC MOBILITY INTELLIGENCE - SPARK CLUSTER DEMO" -ForegroundColor Yellow
Write-Host "   Running Spark Job across Master + 3 Workers" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Cluster UIs:" -ForegroundColor White
Write-Host "  - Spark Master UI:       http://localhost:8080 (Always online)" -ForegroundColor Gray
Write-Host "  - Spark Worker 1:        http://localhost:8081" -ForegroundColor Gray
Write-Host "  - Spark Worker 2:        http://localhost:8082" -ForegroundColor Gray
Write-Host "  - Spark Worker 3:        http://localhost:8083" -ForegroundColor Gray
Write-Host "  - Spark Job / DAG UI:    http://localhost:4040 (Active during this job)" -ForegroundColor Green
Write-Host ""

docker exec -it -e PYTHONPATH=/opt/spark/python:/opt/spark/python/lib/py4j-0.10.9.9-src.zip spark-master python3 /opt/spark/scripts/spark_cluster_demo.py spark://spark-master:7077 /opt/spark/data/curated/trips

