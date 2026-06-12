"""Postgres access for the pricing worker.

The gateway owns schema creation; by the time a job reaches the queue the
tables exist. Connections are opened per call — workers process jobs at
human pace, so pooling is unnecessary.
"""

import os
import time

import psycopg2
from psycopg2.extras import Json

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://resellid:resellid@localhost:5432/resellid"
)


def _connect():
    return psycopg2.connect(DATABASE_URL)


def wait_for_db(retries=15, delay=2):
    for attempt in range(retries):
        try:
            _connect().close()
            return
        except psycopg2.OperationalError:
            if attempt == retries - 1:
                raise
            time.sleep(delay)


def mark_job_processing(job_id):
    with _connect() as conn, conn.cursor() as cur:
        cur.execute(
            "UPDATE search_jobs SET status = 'processing' WHERE job_id = %s",
            (job_id,),
        )


def mark_job_complete(job_id, result):
    with _connect() as conn, conn.cursor() as cur:
        cur.execute(
            "UPDATE search_jobs SET status = 'complete', result = %s WHERE job_id = %s",
            (Json(result), job_id),
        )


def mark_job_failed(job_id, error):
    with _connect() as conn, conn.cursor() as cur:
        cur.execute(
            "UPDATE search_jobs SET status = 'failed', result = %s WHERE job_id = %s",
            (Json({"error": error}), job_id),
        )


def insert_search_history(query_hash, mode, item_description, condition, result):
    with _connect() as conn, conn.cursor() as cur:
        cur.execute(
            """INSERT INTO search_history
                   (query_hash, mode, item_description, condition, result)
               VALUES (%s, %s, %s, %s, %s)""",
            (query_hash, mode, item_description, condition, Json(result)),
        )
