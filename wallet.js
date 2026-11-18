// --- ПРОВЕРКА АВТОРИЗАЦИИ ---
let currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser) {
    window.location.href = 'login.html';
}

// --- Получение IP-адреса (внешний API) ---
fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(data => {
        document.getElementById('userIP').textContent = `IP последнего входа: ${data.ip}`;
    })
    .catch(() => {
        document.getElementById('userIP').textContent = 'IP: не удалось определить';
    });

// --- Обновление данных на экране ---
function updateWalletUI() {
    document.getElementById('userNick').textContent = currentUser.nick;
    document.getElementById('balanceRub').textContent = currentUser.balances.rub.toFixed(2) + ' ₽';
    document.getElementById('balanceUsd').textContent = currentUser.balances.usd.toFixed(2) + ' $';
    document.getElementById('balanceEur').textContent = currentUser.balances.eur.toFixed(2) + ' €';
    document.getElementById('balanceBtc').textContent = currentUser.balances.btc.toFixed(8) + ' ₿';
    
    document.getElementById('refCode').textContent = currentUser.refCode;
    document.getElementById('refCount').textContent = currentUser.refCount;
    
    // Реферальная ссылка (просто для демо)
    const refLink = window.location.origin + '/register.html?ref=' + currentUser.refCode;
    document.getElementById('refLink').value = refLink;
}

// --- Переключение вкладок ---
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById('tab-' + tabName).classList.add('active');
    event.target.classList.add('active');
}

// --- Активация промокода ---
function activatePromo() {
    const code = document.getElementById('promoInput').value.trim().toUpperCase();
    const msg = document.getElementById('promoMessage');
    
    if (!code) {
        msg.textContent = 'Введите промокод!';
        msg.style.color = 'red';
        return;
    }

    // Проверяем, не активирован ли уже
    if (currentUser.usedPromos && currentUser.usedPromos.includes(code)) {
        msg.textContent = 'Этот промокод уже активирован!';
        msg.style.color = 'orange';
        return;
    }

    // Применяем промокод
    if (code === 'KUPI711') {
        currentUser.balances.rub += 10000;
        msg.textContent = '✅ Промокод KUPI711 активирован! +10 000 ₽';
        msg.style.color = 'green';
    } else if (code === 'KUPI722') {
        currentUser.balances.usd += 10000;
        msg.textContent = '✅ Промокод KUPI722 активирован! +10 000 $';
        msg.style.color = 'green';
    } else if (code === 'KUPI733') {
        currentUser.balances.eur += 10000;
        msg.textContent = '✅ Промокод KUPI733 активирован! +10 000 €';
        msg.style.color = 'green';
    } else if (code === 'KUPI744') {
        currentUser.balances.btc += 10000;
        msg.textContent = '✅ Промокод KUPI744 активирован! +10 000 ₿';
        msg.style.color = 'green';
    } else {
        msg.textContent = '❌ Неверный промокод!';
        msg.style.color = 'red';
        return;
    }

    // Запоминаем, что промокод использован
    if (!currentUser.usedPromos) currentUser.usedPromos = [];
    currentUser.usedPromos.push(code);

    // Сохраняем изменения
    saveUser();
    updateWalletUI();
    document.getElementById('promoInput').value = '';
}

// --- Перевод ---
function makeTransfer() {
    const method = document.getElementById('transferMethod').value;
    const recipient = document.getElementById('transferRecipient').value.trim();
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const msg = document.getElementById('transferMessage');

    if (!recipient || isNaN(amount) || amount <= 0) {
        msg.textContent = 'Заполните все поля корректно!';
        msg.style.color = 'red';
        return;
    }

    if (currentUser.balances.rub < amount) {
        msg.textContent = 'Недостаточно средств на рублёвом счёте!';
        msg.style.color = 'red';
        return;
    }

    if (method === 'internal') {
        // Внутренний перевод другому пользователю
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const targetUser = users.find(u => u.email === recipient.toLowerCase());

        if (!targetUser) {
            msg.textContent = 'Пользователь с таким Email не найден!';
            msg.style.color = 'red';
            return;
        }

        currentUser.balances.rub -= amount;
        targetUser.balances.rub += amount;
        
        // Сохраняем оба
        saveUser();
        localStorage.setItem('users', JSON.stringify(users));
        
        msg.textContent = `✅ Успешно переведено ${amount} ₽ пользователю ${targetUser.nick}!`;
        msg.style.color = 'green';
    } else {
        // Имитация СБП или Карты (просто списываем)
        currentUser.balances.rub -= amount;
        saveUser();
        msg.textContent = `✅ Заявка на перевод ${amount} ₽ через ${method === 'sbp' ? 'СБП' : 'карту'} принята! (Демо)`;
        msg.style.color = 'green';
    }

    updateWalletUI();
    document.getElementById('transferRecipient').value = '';
    document.getElementById('transferAmount').value = '';
}

// --- Копирование реферальной ссылки ---
function copyRefLink() {
    const linkInput = document.getElementById('refLink');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(linkInput.value);
    alert('Ссылка скопирована в буфер обмена!');
}

// --- Сохранение текущего пользователя в базу ---
function saveUser() {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const index = users.findIndex(u => u.email === currentUser.email);
    if (index !== -1) {
        users[index] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

// --- Выход ---
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});

// --- Старт ---
updateWalletUI();
