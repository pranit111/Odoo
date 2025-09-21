import os
from django.db import connection
from django.conf import settings
import sqlglot
import google.generativeai as genai
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

# ----------------------------------------------------------------------
# Config
# ----------------------------------------------------------------------
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyDbS2WPzeX7Wl_7xIFGqP1b4WthMeKp2LM")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel("gemini-2.5-flash")


# ----------------------------------------------------------------------
# Schema Introspection
# ----------------------------------------------------------------------
def get_db_schema() -> str:
    """
    Introspect Django database schema (tables + columns) and return as a string.
    """
    with connection.cursor() as cursor:
        # Get all tables in the current database
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        
        schema_strs = []
        
        for (table_name,) in tables:
            # Get columns for each table
            cursor.execute("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = %s 
                ORDER BY ordinal_position;
            """, [table_name])
            
            columns = cursor.fetchall()
            col_defs = []
            
            for col_name, data_type, is_nullable in columns:
                nullable = "NULL" if is_nullable == "YES" else "NOT NULL"
                col_defs.append(f"{col_name} ({data_type} {nullable})")
            
            schema_strs.append(f"Table: {table_name} -> " + ", ".join(col_defs))
    
    return "\n".join(schema_strs)


# ----------------------------------------------------------------------
# SQL Safety Check
# ----------------------------------------------------------------------
def is_sql_safe(sql: str) -> bool:
    """
    Check if SQL query is safe (only SELECT statements allowed).
    """
    try:
        parsed = sqlglot.parse_one(sql, read="postgres")
        # Only check root operation
        if parsed.key and parsed.key.upper() not in ("SELECT", "WITH"):
            return False
        return True
    except Exception as e:
        logger.error(f"SQL parsing error: {str(e)}")
        return False


def clean_sql(generated_text: str) -> str:
    """
    Clean Gemini output: remove markdown fences and keep only the first SQL statement.
    """
    sql = generated_text.strip()

    # Remove ```sql ... ```
    if sql.lower().startswith("```sql"):
        sql = sql[6:]  # remove ```sql
    elif sql.lower().startswith("```"):
        sql = sql[3:]  # remove ```
    
    if sql.endswith("```"):
        sql = sql[:-3]

    # Remove stray backticks
    sql = sql.replace("```", "").strip()

    # Keep only the first SQL statement
    if ";" in sql:
        sql = sql.split(";")[0].strip() + ";"
    else:
        sql = sql.strip()
    
    return sql


# ----------------------------------------------------------------------
# NL → SQL → Execution
# ----------------------------------------------------------------------
def nl_to_sql_execute(nl_query: str, schema: str = "", max_rows: int = 200) -> Dict[str, Any]:
    """
    Convert NL query to SQL with Gemini, validate, execute, and return results.
    Returns: { "sql": "...", "columns": [...], "rows": [...], "error": None }
    """
    if not schema:
        try:
            schema = get_db_schema()
        except Exception as e:
            return {"sql": None, "columns": [], "rows": [], "error": f"Schema introspection error: {str(e)}"}

    prompt = f"""
    You are an assistant that produces a single valid PostgreSQL SELECT query only.
    Use the database schema below to form the query.
    Do NOT include explanations or commentary. Return only the SQL.
    Do NOT use LIMIT clause, I will handle row limiting.

    Schema:
    {schema}

    Question:
    "{nl_query}"
    """

    try:
        response = gemini_model.generate_content(prompt)
        generated_sql = clean_sql(response.text)
        logger.info(f"Generated SQL: {generated_sql}")
    except Exception as e:
        logger.error(f"Gemini error: {str(e)}")
        return {"sql": None, "columns": [], "rows": [], "error": f"AI model error: {str(e)}"}

    if not is_sql_safe(generated_sql):
        logger.warning(f"Unsafe SQL rejected: {generated_sql}")
        return {"sql": generated_sql, "columns": [], "rows": [], "error": "Generated SQL failed safety checks. Only SELECT queries are allowed."}

    try:
        with connection.cursor() as cursor:
            # Add LIMIT to the query if it doesn't already have one
            limited_sql = generated_sql
            if "LIMIT" not in generated_sql.upper():
                if generated_sql.endswith(";"):
                    limited_sql = generated_sql[:-1] + f" LIMIT {max_rows};"
                else:
                    limited_sql = generated_sql + f" LIMIT {max_rows}"
            
            cursor.execute(limited_sql)
            columns = [desc[0] for desc in cursor.description]
            rows = cursor.fetchall()
            
            # Convert rows to list of lists for JSON serialization
            rows_list = [list(row) for row in rows]
            
            logger.info(f"Query executed successfully. Returned {len(rows_list)} rows.")
            return {
                "sql": generated_sql, 
                "columns": columns, 
                "rows": rows_list, 
                "error": None,
                "row_count": len(rows_list)
            }
            
    except Exception as e:
        logger.error(f"Database execution error: {str(e)}")
        return {"sql": generated_sql, "columns": [], "rows": [], "error": f"Database error: {str(e)}"}


# ----------------------------------------------------------------------
# Schema Information
# ----------------------------------------------------------------------
def get_table_list() -> List[str]:
    """
    Get a list of all tables in the database.
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                ORDER BY table_name;
            """)
            tables = cursor.fetchall()
            return [table[0] for table in tables]
    except Exception as e:
        logger.error(f"Error getting table list: {str(e)}")
        return []


def get_table_schema(table_name: str) -> Dict[str, Any]:
    """
    Get detailed schema information for a specific table.
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = %s 
                ORDER BY ordinal_position;
            """, [table_name])
            
            columns = cursor.fetchall()
            column_info = []
            
            for col_name, data_type, is_nullable, column_default in columns:
                column_info.append({
                    "name": col_name,
                    "type": data_type,
                    "nullable": is_nullable == "YES",
                    "default": column_default
                })
            
            return {
                "table_name": table_name,
                "columns": column_info,
                "error": None
            }
            
    except Exception as e:
        logger.error(f"Error getting table schema for {table_name}: {str(e)}")
        return {
            "table_name": table_name,
            "columns": [],
            "error": str(e)
        }