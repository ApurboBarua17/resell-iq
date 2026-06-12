"""Postgres access for the API gateway.

Owns the schema: creates search_jobs and search_history at startup (the
worker only writes to tables that exist once a job has flowed through here).
Connections are opened per call — simple and robust for single-user MVP load.
"""

import os
import time

import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://resellid:resellid@localhost:5432/resellid"
)

SCHEMA = """
CREATE TABLE IF NOT EXISTS search_jobs (
    job_id TEXT PRIMARY KEY,
    query_hash TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'electronics',
    item_description TEXT NOT NULL,
    condition TEXT,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    result JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS search_history (
    id SERIAL PRIMARY KEY,
    query_hash TEXT NOT NULL,
    mode TEXT NOT NULL DEFAULT 'electronics',
    item_description TEXT NOT NULL,
    condition TEXT,
    result JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
"""


def _connect():
    return psycopg2.connect(DATABASE_URL)


def init_schema(retries=15, delay=2):
    """Create tables, waiting for Postgres to come up first."""
    for attempt in range(retries):
        try:
            with _connect() as conn, conn.cursor() as cur:
                cur.execute(SCHEMA)
            return
        except psycopg2.OperationalError:
            if attempt == retries - 1:
                raise
            time.sleep(delay)


def insert_pending_job(job_id, query_hash, mode, item_description, condition, category):
    with _connect() as conn, conn.cursor() as cur:
        cur.execute(
            """INSERT INTO search_jobs
                   (job_id, query_hash, mode, item_description, condition, category)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (job_id, query_hash, mode, item_description, condition, category),
        )


def get_job(job_id):
    with _connect() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            "SELECT job_id, status, result FROM search_jobs WHERE job_id = %s",
            (job_id,),
        )
        return cur.fetchone()


def get_history(limit=10):
    with _connect() as conn, conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """SELECT id, query_hash, mode, item_description, condition, result,
                      created_at
               FROM search_history ORDER BY created_at DESC LIMIT %s""",
            (limit,),
        )
        rows = cur.fetchall()
    for row in rows:
        row["created_at"] = row["created_at"].isoformat()
    return rows
