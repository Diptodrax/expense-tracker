from flask import Flask, render_template, request, jsonify
from database import get_db_connection, init_db

app = Flask(__name__)

init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/transactions', methods=['GET'])
def get_transactions():

    conn = get_db_connection()

    transactions = conn.execute(
        'SELECT * FROM transactions ORDER BY date DESC'
    ).fetchall()

    conn.close()

    return jsonify([dict(tx) for tx in transactions])

@app.route('/api/transactions', methods=['POST'])
def add_transaction():

    data = request.json

    title = data['title']
    amount = data['amount']
    tx_type = data['type']

    conn = get_db_connection()

    cursor = conn.execute(
        'INSERT INTO transactions (title, amount, type) VALUES (?, ?, ?)',
        (title, amount, tx_type)
    )

    conn.commit()

    new_tx = conn.execute(
        'SELECT * FROM transactions WHERE id = ?',
        (cursor.lastrowid,)
    ).fetchone()

    conn.close()

    return jsonify(dict(new_tx))

@app.route('/api/transactions/<int:id>', methods=['DELETE'])
def delete_transaction(id):

    conn = get_db_connection()

    conn.execute(
        'DELETE FROM transactions WHERE id = ?',
        (id,)
    )

    conn.commit()
    conn.close()

    return '', 204

@app.route('/api/summary')
def summary():

    conn = get_db_connection()

    income = conn.execute(
        'SELECT SUM(amount) FROM transactions WHERE type="income"'
    ).fetchone()[0] or 0

    expense = conn.execute(
        'SELECT SUM(amount) FROM transactions WHERE type="expense"'
    ).fetchone()[0] or 0

    conn.close()

    return jsonify({
        'income': income,
        'expense': expense,
        'balance': income - expense
    })

if __name__ == '__main__':
    app.run(debug=True)