let currentUser = null;
let userCharts = {};

function login() {
    const username = document.getElementById('username').value.trim();
    if (!username) { alert('Enter username'); return; }
    currentUser = username;
    if (!localStorage.getItem('sharedExpenses')) localStorage.setItem('sharedExpenses', JSON.stringify([]));
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('expenseSection').style.display = 'block';
    document.getElementById('welcomeMsg').textContent = 'Welcome, ' + currentUser;
    renderAllUsersExpenses();
}

function logout() {
    currentUser = null;
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('expenseSection').style.display = 'none';
    document.getElementById('username').value = '';
}

function addExpense() {
    const name = document.getElementById('expenseName').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const month = document.getElementById('monthSelect').value;
    if (!name || !amount) { alert('Enter expense and amount'); return; }
    const expenses = JSON.parse(localStorage.getItem('sharedExpenses'));
    expenses.push({ name, amount, month, user: currentUser });
    localStorage.setItem('sharedExpenses', JSON.stringify(expenses));
    document.getElementById('expenseName').value = '';
    document.getElementById('expenseAmount').value = '';
    renderAllUsersExpenses();
}

function deleteExpense(index) {
    const expenses = JSON.parse(localStorage.getItem('sharedExpenses'));
    if (expenses[index].user !== currentUser) return;
    expenses.splice(index, 1);
    localStorage.setItem('sharedExpenses', JSON.stringify(expenses));
    renderAllUsersExpenses();
}

function renderAllUsersExpenses() {
    const container = document.getElementById('usersExpensesContainer');
    container.innerHTML = '';
    const expenses = JSON.parse(localStorage.getItem('sharedExpenses'));
    const users = [...new Set(expenses.map(e => e.user))];

    users.forEach(user => {
        const userExpenses = expenses.filter(e => e.user === user);
        const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        const monthlyTotals = months.map(month => userExpenses.filter(e => e.month === month).reduce((a, b) => a + b.amount, 0));

        const userDiv = document.createElement('div');
        userDiv.className = 'user-card';
        userDiv.innerHTML = `<h3>${user}</h3><ul id="list-${user}"></ul><div class="chart-wrapper"><canvas id="chart-${user}"></canvas></div>`;
        container.appendChild(userDiv);

        const ul = userDiv.querySelector(`#list-${user}`);
        userExpenses.forEach(exp => {
            const li = document.createElement('li');
            li.innerHTML = `${exp.month}: ${exp.name} - $${exp.amount}`;
            if (exp.user === currentUser) {
                const btnDel = document.createElement('button');
                btnDel.className = 'expense-btn delete-btn';
                btnDel.textContent = 'Delete';
                btnDel.onclick = () => deleteExpense(expenses.indexOf(exp));
                li.appendChild(btnDel);
            }
            ul.appendChild(li);
        });

        const ctx = userDiv.querySelector(`#chart-${user}`).getContext('2d');
        if (userCharts[user]) userCharts[user].destroy();
        userCharts[user] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Monthly Total ($)',
                    data: monthlyTotals,
                    backgroundColor: 'rgba(255, 193, 7, 0.8)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff'
                    }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { color: '#fff', stepSize: 50 } },
                    x: { ticks: { color: '#fff', font: { weight: '600' } } }
                }
            }
        });
    });
}
