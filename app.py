from flask import Flask, render_template, request, redirect, url_for, flash
import sqlite3
from datetime import datetime

app = Flask(__name__)
app.secret_key = "smart-food-waste-secret"

DATABASE = "database.db"


def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS waste_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            quantity REAL NOT NULL,
            date TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()


@app.route("/")
def index():

    conn = get_db()

    total = conn.execute("""
        SELECT COALESCE(SUM(quantity), 0) AS total
        FROM waste_records
    """).fetchone()["total"]

    category_data = conn.execute("""
        SELECT category, SUM(quantity) AS total
        FROM waste_records
        GROUP BY category
        ORDER BY total DESC
    """).fetchall()

    records = conn.execute("""
        SELECT *
        FROM waste_records
        ORDER BY id DESC
        LIMIT 5
    """).fetchall()

    highest_category = (
        category_data[0]["category"]
        if category_data
        else "No Data"
    )

    highest_amount = (
        category_data[0]["total"]
        if category_data
        else 0
    )

    conn.close()

    return render_template(
        "index.html",
        total=round(total, 2),
        category_data=category_data,
        records=records,
        highest_category=highest_category,
        highest_amount=round(highest_amount, 2)
    )


@app.route("/add", methods=["GET", "POST"])
def add_waste():

    if request.method == "POST":

        category = request.form["category"]
        quantity = request.form["quantity"]
        date = request.form["date"]

        try:

            quantity = float(quantity)

            if quantity <= 0:
                flash(
                    "Quantity must be greater than 0.",
                    "error"
                )

                return redirect(url_for("add_waste"))

            conn = get_db()

            conn.execute("""
                INSERT INTO waste_records
                (category, quantity, date)
                VALUES (?, ?, ?)
            """, (category, quantity, date))

            conn.commit()
            conn.close()

            flash(
                "Food waste record added successfully!",
                "success"
            )

            return redirect(url_for("index"))

        except ValueError:

            flash(
                "Please enter a valid quantity.",
                "error"
            )

    today = datetime.now().strftime("%Y-%m-%d")

    return render_template(
        "add_waste.html",
        today=today
    )


@app.route("/history")
def history():

    conn = get_db()

    records = conn.execute("""
        SELECT *
        FROM waste_records
        ORDER BY date DESC, id DESC
    """).fetchall()

    conn.close()

    return render_template(
        "history.html",
        records=records
    )


@app.route("/delete/<int:id>")
def delete_record(id):

    conn = get_db()

    conn.execute(
        "DELETE FROM waste_records WHERE id=?",
        (id,)
    )

    conn.commit()
    conn.close()

    flash(
        "Record deleted successfully.",
        "success"
    )

    return redirect(url_for("history"))


@app.route("/comparison")
def comparison():

    conn = get_db()

    dates = conn.execute("""
        SELECT DISTINCT date
        FROM waste_records
        ORDER BY date DESC
    """).fetchall()

    current_waste = 0
    previous_waste = 0

    current_date = "-"
    previous_date = "-"

    if len(dates) >= 1:

        current_date = dates[0]["date"]

        current_waste = conn.execute("""
            SELECT COALESCE(SUM(quantity), 0) AS total
            FROM waste_records
            WHERE date=?
        """, (current_date,)).fetchone()["total"]

    if len(dates) >= 2:

        previous_date = dates[1]["date"]

        previous_waste = conn.execute("""
            SELECT COALESCE(SUM(quantity), 0) AS total
            FROM waste_records
            WHERE date=?
        """, (previous_date,)).fetchone()["total"]

    if previous_waste > 0:

        reduction_kg = previous_waste - current_waste

        reduction_percent = (
            reduction_kg / previous_waste
        ) * 100

    else:

        reduction_kg = 0
        reduction_percent = 0

    conn.close()

    return render_template(
        "comparison.html",
        current_waste=round(current_waste, 2),
        previous_waste=round(previous_waste, 2),
        reduction_kg=round(reduction_kg, 2),
        reduction_percent=round(reduction_percent, 2),
        current_date=current_date,
        previous_date=previous_date
    )


@app.route("/suggestions")
def suggestions():

    conn = get_db()

    categories = conn.execute("""
        SELECT category, SUM(quantity) AS total
        FROM waste_records
        GROUP BY category
        ORDER BY total DESC
    """).fetchall()

    conn.close()

    suggestions_data = {

        "Cooked Food": [
            "Cook only the required quantity.",
            "Store leftover food in airtight containers.",
            "Plan meals before cooking.",
            "Reuse suitable leftovers."
        ],

        "Fruits and Vegetables": [
            "Buy fruits and vegetables according to weekly needs.",
            "Store vegetables properly.",
            "Use ripe fruits quickly.",
            "Avoid unnecessary purchases."
        ],

        "Dairy Products": [
            "Check expiry dates regularly.",
            "Keep dairy products refrigerated.",
            "Buy according to household consumption.",
            "Use products before expiry."
        ],

        "Bakery Items": [
            "Purchase bakery products according to consumption.",
            "Store bread properly.",
            "Freeze extra bread when necessary.",
            "Check freshness before purchasing."
        ],

        "Other Food": [
            "Maintain a weekly food inventory.",
            "Avoid unnecessary purchases.",
            "Plan meals before shopping.",
            "Store food properly."
        ]
    }

    return render_template(
        "suggestions.html",
        categories=categories,
        suggestions=suggestions_data
    )


@app.route("/storage")
def storage():

    tips = [

        {
            "title": "Fruits & Vegetables",
            "text": "Store vegetables properly and refrigerate temperature-sensitive items."
        },

        {
            "title": "Cooked Food",
            "text": "Store leftovers in clean airtight containers and refrigerate promptly."
        },

        {
            "title": "Dairy Products",
            "text": "Keep milk and dairy products refrigerated and check expiry dates."
        },

        {
            "title": "Bakery Items",
            "text": "Keep bakery items in dry and clean storage."
        },

        {
            "title": "Dry Food",
            "text": "Store rice, pulses and grains in airtight containers away from moisture."
        }
    ]

    return render_template(
        "storage.html",
        tips=tips
    )


if __name__ == "__main__":

    init_db()

    app.run(host="0.0.0.0", port=5000, debug=True)
    