@echo off
echo ======================================================================
echo   NYC MOBILITY INTELLIGENCE - SPARK CLUSTER DEMO
echo   Running Spark Job across Master + 3 Workers
echo ======================================================================
echo.
echo Cluster UIs:
echo   - Spark Master UI:       http://localhost:8080 (Always online)
echo   - Spark Worker 1:        http://localhost:8081
echo   - Spark Worker 2:        http://localhost:8082
echo   - Spark Worker 3:        http://localhost:8083
echo   - Spark Job / DAG UI:    http://localhost:4040 (Active during this job)
echo.
docker exec -it -e PYTHONPATH=/opt/spark/python:/opt/spark/python/lib/py4j-0.10.9.9-src.zip spark-master python3 /opt/spark/scripts/spark_cluster_demo.py spark://spark-master:7077 /opt/spark/data/curated/trips
echo.
pause

