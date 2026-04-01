// Public tournament loader
async function loadPublicTournaments() {
    const tournamentsDiv = document.getElementById('public-tournaments');
    try {
        const snapshot = await db.collection('tournaments').where('status', '==', 'active').limit(3).get();
        tournamentsDiv.innerHTML = snapshot.docs.map(doc => {
            const data = doc.data();
            return `
                <div class="tournament-item">
                    <h4>${data.name}</h4>
                    <p><strong>Date:</strong> ${data.date}</p>
                    <p><strong>Location:</strong> ${data.location}</p>
                </div>
            `;
        }).join('');
    } catch(e) {
        tournamentsDiv.innerHTML = '<p>Coming soon...</p>';
    }
}

// Auth state listener
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        document.getElementById('userName')?.textContent = userData?.displayName || user.email;
        
        // Redirect based on role
        if (window.location.pathname.includes('admin.html') && userData?.role !== 'admin') {
            window.location.href = 'dashboard.html';
        } else if (window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('admin.html')) {
            loadUserData();
        }
    } else {
        if (window.location.pathname.includes('dashboard.html') || window.location.pathname.includes('admin.html')) {
            window.location.href = 'login.html';
        }
    }
});