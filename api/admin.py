from fastapi import APIRouter, Body
import mysql.connector
from os import environ

admin_api = APIRouter()

@admin_api.get("/triage/patients")
def list_patients():
    conn = mysql.connector.connect(
        host="localhost",
        port=int(environ["MYSQL_PORT"]),
        user=environ["MYSQL_USER"],
        password=environ["MYSQL_PASSWORD"],
        database=environ["MYSQL_DATABASE"]
    )
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT id, user_name, user_priority, reason, created_at
        FROM triagem
        WHERE user_status = 'aguardando'
        ORDER BY FIELD(user_priority, 'alta', 'media', 'baixa'), created_at ASC
    """)
    patients = cursor.fetchall()
    cursor.close()
    conn.close()
    return patients


@admin_api.get("/user/history/{id}")
def user_history(id: int):
    conn = mysql.connector.connect(
        host="localhost",
        port=int(environ["MYSQL_PORT"]),
        user=environ["MYSQL_USER"],
        password=environ["MYSQL_PASSWORD"],
        database=environ["MYSQL_DATABASE"]
    )
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM triagem WHERE id = %s", (id,))
    patient = cursor.fetchone()
    cursor.close()
    conn.close()
    return patient


@admin_api.post("/triage/status/{id}")
def update_status(id: int, status: str = Body(...)):
    conn = mysql.connector.connect(
        host="localhost",
        port=int(environ["MYSQL_PORT"]),
        user=environ["MYSQL_USER"],
        password=environ["MYSQL_PASSWORD"],
        database=environ["MYSQL_DATABASE"]
    )
    cursor = conn.cursor()
    cursor.execute("UPDATE triagem SET user_status = %s WHERE id = %s", (status, id))
    conn.commit()
    cursor.close()
    conn.close()
    return {"success": True}
