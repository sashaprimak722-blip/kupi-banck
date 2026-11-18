// --- КНОПКА "ГЛАЗ" ---
function setupPasswordToggle(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);
    if (input && button) {
        button.addEventListener('click', () => {
            input.type = input.type === 'password' ? 'text' : 'password';
            button.textContent = input.type === 'password' ? '👁️' : '🙈';
        });
    }
}
setupPasswordToggle('regPassword', 'togglePassword');
setupPasswordToggle('loginPassword', 'toggleLoginPassword');

// --- РЕГИСТРАЦИЯ ---
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nick = document.getElementById('regNick').value.trim();
        const email = document.getElementById('regEmail').value.trim().toLowerCase();
        const password = document.getElementById('regPassword').value;
        const secret = document.getElementById('regSecret').value.trim();
        const promoInput = document.getElementById('regPromo').value.trim().toUpperCase();

        let users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.some(u => u.email === email)) {
            alert('Пользователь с таким Email уже существует!');
            return;
        }

        // Генерация уникального реферального кода
        const refCode = 'REF_' + Math.floor(Math.random() * 90000 + 10000);

        const newUser = { 
            nick, 
            email, 
            password, 
            secret, 
            balances: { rub: 0, usd: 0, eur: 0, btc: 0 }, 
            refCode,
            referredBy: null,
            refCount: 0
        };

        // Применение промокода при регистрации
        if (promoInput === 'KUPI711') {
            newUser.balances.rub += 10000;
        } else if (promoInput === 'KUPI722') {
            newUser.balances.usd += 10000;
        } else if (promoInput === 'KUPI733') {
            newUser.balances.eur += 10000;
        } else if (promoInput === 'KUPI744') {
            newUser.balances.btc += 10000;
        } else if (promoInput.startsWith('REF_')) {
            // Реферальный код
            const referrer = users.find(u => u.refCode === promoInput);
            if (referrer) {
                referrer.refCount += 1;
                newUser.referredBy = referrer.email;
                referrer.balances.rub += 500; // Бонус рефереру
                newUser.balances.rub += 500;  // Бонус новичку
                localStorage.setItem('users', JSON.stringify(users));
            }
        }

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        alert(`Регистрация успешна! Добро пожаловать, ${nick}!`);
        window.location.href = 'login.html';
    });
}

// --- ВХОД ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value;

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            alert(`Привет, ${user.nick}! Вход выполнен.`);
            window.location.href = 'wallet.html';
        } else {
            alert('Неверный Email или пароль!');
        }
    });
}
