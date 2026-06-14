(function() {
    const CORRECT_PASSWORD = '202606';
    const MAX_LENGTH = 6;
    const SUCCESS_REDIRECT_URL = 'music.html';
    const BG_PHONE_URL = 'assets/backgroundphone.jpg';
    const BG_PC_URL = 'assets/backgroundpc.jpg';

    const bgLayer = document.getElementById('bgLayer');
    const messageEl = document.getElementById('message');
    const dotsRow = document.getElementById('dotsRow');
    const dots = dotsRow.querySelectorAll('.dot');
    const keypad = document.getElementById('keypad');
    const btnDelete = document.getElementById('btnDelete');
    const btnConfirm = document.getElementById('btnConfirm');
    const digitButtons = keypad.querySelectorAll('.digit-btn');

    let passwordInput = '';
    let deleteTimer = null;
    let longPressTriggered = false;

    function updateBackground() {
        const ratio = window.innerWidth / window.innerHeight;
        if (ratio >= 1) {
            bgLayer.classList.remove('phone');
            bgLayer.style.backgroundImage = `url('${BG_PC_URL}')`;
        } else {
            bgLayer.classList.add('phone');
            bgLayer.style.backgroundImage = `url('${BG_PHONE_URL}')`;
        }
    }
    updateBackground();
    let resizeDebounce;
    window.addEventListener('resize', () => {
        clearTimeout(resizeDebounce);
        resizeDebounce = setTimeout(updateBackground, 200);
    });
    window.addEventListener('orientationchange', () => {
        setTimeout(updateBackground, 300);
    });

    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle('filled', index < passwordInput.length);
        });
    }

    function showMessage(text, isSuccess = false) {
        messageEl.textContent = text;
        messageEl.classList.remove('success', 'visible');
        if (isSuccess) {
            messageEl.classList.add('success');
        }
        messageEl.classList.add('visible');
        if (navigator.vibrate) {
            navigator.vibrate(isSuccess ? [50] : [30, 50, 30]);
        }
        clearTimeout(messageEl._hideTimeout);
        messageEl._hideTimeout = setTimeout(() => {
            messageEl.classList.remove('visible', 'success');
        }, 2500);
    }

    function hideMessage() {
        messageEl.classList.remove('visible', 'success');
        clearTimeout(messageEl._hideTimeout);
    }

    function verifyPassword() {
    if (passwordInput.length !== MAX_LENGTH) return;
    if (passwordInput === CORRECT_PASSWORD) {
        hideMessage();
        showMessage('密码正确', true);
        sessionStorage.setItem('_grad_music_unlocked', 'true');
        sessionStorage.setItem('_grad_music_unlock_time', Date.now());
        passwordInput = '';
        updateDots();
        setTimeout(() => {
            window.location.href = SUCCESS_REDIRECT_URL; // 确保跳转
        }, 350);
    } else {
        showMessage('密码不正确');
    }
}

    function addDigit(digit) {
        if (passwordInput.length >= MAX_LENGTH) return;
        hideMessage();
        passwordInput += digit;
        updateDots();
    }

    function deleteDigit() {
        if (passwordInput.length === 0) return;
        hideMessage();
        passwordInput = passwordInput.slice(0, -1);
        updateDots();
    }

    function clearPassword() {
        if (passwordInput.length === 0) return;
        hideMessage();
        passwordInput = '';
        updateDots();
    }

    digitButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const digit = btn.getAttribute('data-digit');
            if (digit !== null) addDigit(digit);
        });
    });

    function handleDeletePress(e) {
        e.preventDefault();
        longPressTriggered = false;
        deleteTimer = setTimeout(() => {
            longPressTriggered = true;
            clearPassword();
        }, 600);
    }

    function handleDeleteRelease(e) {
        e.preventDefault();
        if (deleteTimer) {
            clearTimeout(deleteTimer);
            deleteTimer = null;
        }
        if (!longPressTriggered) {
            deleteDigit();
        }
        longPressTriggered = false;
    }

    function handleDeleteLeave(e) {
        e.preventDefault();
        if (deleteTimer) {
            clearTimeout(deleteTimer);
            deleteTimer = null;
        }
        longPressTriggered = false;
    }

    btnDelete.addEventListener('pointerdown', handleDeletePress);
    btnDelete.addEventListener('pointerup', handleDeleteRelease);
    btnDelete.addEventListener('pointerleave', handleDeleteLeave);
    btnDelete.addEventListener('pointercancel', handleDeleteLeave);
    btnDelete.addEventListener('click', (e) => e.preventDefault()); // 阻止默认click

    btnConfirm.addEventListener('click', () => {
        if (passwordInput.length === MAX_LENGTH) {
            verifyPassword();
        } else if (passwordInput.length > 0) {
            dotsRow.style.opacity = '0.5';
            setTimeout(() => { dotsRow.style.opacity = '1'; }, 200);
        }
    });

    document.addEventListener('keydown', (e) => {
        const key = e.key;
        if (/^[0-9]$/.test(key)) {
            addDigit(key);
        } else if (key === 'Backspace' || key === 'Delete') {
            e.preventDefault();
            deleteDigit();
        } else if (key === 'Enter') {
            e.preventDefault();
            if (passwordInput.length === MAX_LENGTH) verifyPassword();
        }
    });

    updateDots();
    hideMessage();

    setTimeout(() => {
        new Image().src = BG_PHONE_URL;
        new Image().src = BG_PC_URL;
    }, 500);
})();