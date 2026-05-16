const balance = document.getElementById('balance');
const money_plus = document.getElementById('income');
const money_minus = document.getElementById('expense');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');

// Fetch transactions and update DOM
async function getTransactions() {
    try {
        const res = await fetch('/api/transactions');
        const data = await res.json();
        
        list.innerHTML = '';
        data.forEach(addTransactionDOM);
        updateValues();
    } catch (err) {
        console.error('Error fetching transactions:', err);
    }
}

// Add transaction
async function addTransaction(e) {
    e.preventDefault();

    if (text.value.trim() === '' || amount.value.trim() === '') {
        alert('Please add a text and amount');
        return;
    }

    const type = document.querySelector('input[name="type"]:checked').value;

    const newTransaction = {
        title: text.value,
        amount: parseFloat(amount.value),
        type: type
    };

    try {
        const res = await fetch('/api/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTransaction)
        });

        if (res.ok) {
            const data = await res.json();
            // It's usually better to just refetch from the API to maintain sorting
            // But we can just refetch all
            getTransactions();
            text.value = '';
            amount.value = '';
        } else {
            const err = await res.json();
            alert(err.error || 'Error adding transaction');
        }
    } catch (err) {
        console.error('Error adding transaction:', err);
    }
}

// Add transaction to DOM list
function addTransactionDOM(transaction) {
    const sign = transaction.type === 'income' ? '+' : '-';
    const item = document.createElement('li');

    // Add class based on value
    item.classList.add(transaction.type === 'income' ? 'plus' : 'minus');

    const formattedDate = new Date(transaction.date || Date.now()).toLocaleString([], {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
    });

    item.innerHTML = `
        <div>
            ${transaction.title} <span class="date">${formattedDate}</span>
        </div>
        <span>${sign}$${Math.abs(transaction.amount).toFixed(2)}</span>
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})">×</button>
    `;

    list.appendChild(item);
}

// Update the balance, income and expense
async function updateValues() {
    try {
        const res = await fetch('/api/summary');
        const data = await res.json();

        balance.innerText = `$${(data.balance).toFixed(2)}`;
        money_plus.innerText = `+$${data.income.toFixed(2)}`;
        money_minus.innerText = `-$${data.expense.toFixed(2)}`;
    } catch (err) {
        console.error('Error updating values:', err);
    }
}

// Remove transaction by ID
async function removeTransaction(id) {
    try {
        await fetch(`/api/transactions/${id}`, {
            method: 'DELETE'
        });
        
        getTransactions();
    } catch (err) {
        console.error('Error deleting transaction:', err);
    }
}

form.addEventListener('submit', addTransaction);

// Init
getTransactions();
