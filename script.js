// ─────────────────────────────────────────
// AUTH STATE LISTENER
// ─────────────────────────────────────────
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const userDoc = await db.collection('users')
                                .doc(user.uid)
                                .get();
        const userData = userDoc.data();
        const currentPage = window.location.pathname;

        // If on login page and already logged in → redirect
        if (currentPage.includes('login.html')) {
            if (userData?.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        }

        // If on dashboard → set username
        if (currentPage.includes('dashboard.html')) {
            const nameEl = document.getElementById('userName');
            if (nameEl) {
                nameEl.textContent = userData?.displayName || user.email;
            }
            loadUserData();
        }

        // If on admin page → verify role
        if (currentPage.includes('admin.html')) {
            if (userData?.role !== 'admin') {
                // Not an admin → kick out
                window.location.href = 'dashboard.html';
            } else {
                const nameEl = document.getElementById('adminName');
                if (nameEl) {
                    nameEl.textContent = userData?.displayName || user.email;
                }
            }
        }

    } else {
        // Not logged in
        const currentPage = window.location.pathname;
        if (currentPage.includes('dashboard.html') || 
            currentPage.includes('admin.html')) {
            window.location.href = 'login.html';
        }
    }
});

// ─────────────────────────────────────────
// LOGIN FORM HANDLER
// ─────────────────────────────────────────
document.getElementById('loginForm')
    ?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorBox = document.getElementById('loginError');

    try {
        // Show loading state
        const btn = e.target.querySelector('button');
        btn.textContent = 'Logging in...';
        btn.disabled = true;

        await auth.signInWithEmailAndPassword(email, password);
        // onAuthStateChanged above will handle redirect

    } catch (error) {
        // Show error message
        if (errorBox) {
            errorBox.textContent = getErrorMessage(error.code);
            errorBox.style.display = 'block';
        } else {
            alert('Login Failed: ' + getErrorMessage(error.code));
        }

        const btn = e.target.querySelector('button');
        btn.textContent = 'Login';
        btn.disabled = false;
    }
});

// ─────────────────────────────────────────
// REGISTER FORM HANDLER
// ─────────────────────────────────────────
document.getElementById('registerForm')
    ?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name     = document.getElementById('displayName').value.trim();
    const email    = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();

    try {
        const btn = e.target.querySelector('button');
        btn.textContent = 'Registering...';
        btn.disabled = true;

        // Create auth user
        const userCredential = await auth
            .createUserWithEmailAndPassword(email, password);

        // Save user data to Firestore
        await db.collection('users')
                .doc(userCredential.user.uid)
                .set({
                    displayName: name,
                    email: email,
                    role: 'user',   // Default role = user
                    createdAt: firebase.firestore
                                      .FieldValue.serverTimestamp()
                });

        // Redirect to dashboard
        window.location.href = 'dashboard.html';

    } catch (error) {
        alert('Registration Failed: ' + getErrorMessage(error.code));
        const btn = e.target.querySelector('button');
        btn.textContent = 'Register';
        btn.disabled = false;
    }
});

// ─────────────────────────────────────────
// LOGOUT HANDLER
// ─────────────────────────────────────────
document.getElementById('logoutBtn')
    ?.addEventListener('click', async () => {
    await auth.signOut();
    window.location.href = 'login.html';
});

// ─────────────────────────────────────────
// LOAD PUBLIC TOURNAMENTS (Landing Page)
// ─────────────────────────────────────────
async function loadPublicTournaments() {
    const div = document.getElementById('public-tournaments');
    if (!div) return;

    try {
        const snapshot = await db.collection('tournaments')
            .where('status', '==', 'active')
            .limit(5)
            .get();

        if (snapshot.empty) {
            div.innerHTML = `
                <div class="card">
                    <p>No active tournaments yet. Check back soon!</p>
                </div>`;
            return;
        }

        div.innerHTML = snapshot.docs.map(doc => {
            const d = doc.data();
            return `
                <div class="tournament-item">
                    <h4>${d.name}</h4>
                    <p><strong>Date:</strong> ${d.date}</p>
                    <p><strong>Location:</strong> ${d.location}</p>
                    <span class="badge">Active</span>
                </div>`;
        }).join('');

    } catch(e) {
        div.innerHTML = '<p>Unable to load tournaments.</p>';
        console.error('Tournament load error:', e);
    }
}

// ─────────────────────────────────────────
// FRIENDLY ERROR MESSAGES
// ─────────────────────────────────────────
function getErrorMessage(code) {
    const errors = {
        'auth/wrong-password'     : 'Wrong password. Please try again.',
        'auth/user-not-found'     : 'No account found with this email.',
        'auth/invalid-email'      : 'Invalid email format.',
        'auth/too-many-requests'  : 'Too many attempts. Try again later.',
        'auth/email-already-in-use': 'Email already registered.',
        'auth/weak-password'      : 'Password must be at least 6 characters.'
    };
    return errors[code] || 'Something went wrong. Please try again.';
}
