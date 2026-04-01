// Load user dashboard data
async function loadUserData() {
    const tournamentsDiv = document.getElementById('user-tournaments');
    const matchesDiv = document.getElementById('user-matches');
    
    // Load tournaments
    const tournaments = await db.collection('tournaments').where('status', '==', 'active').get();
    tournamentsDiv.innerHTML = tournaments.docs.map(doc => {
        const data = doc.data();
        return `<div class="tournament-item">${data.name} - ${data.date}</div>`;
    }).join('');

    // Load matches
    const matches = await db.collection('matches').limit(10).get();
    matchesDiv.innerHTML = matches.docs.map(doc => {
        const data = doc.data();
        return `<div class="match-item">
            <h4>${data.team1} vs ${data.team2}</h4>
            <p>Score: ${data.score1} - ${data.score2}</p>
        </div>`;
    }).join('');
}

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    auth.signOut();
});