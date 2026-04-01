// Admin-only functions
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('tournamentModal');
    const addBtn = document.getElementById('addTournamentBtn');
    const closeBtn = document.querySelector('.close');
    const form = document.getElementById('tournamentForm');

    addBtn.onclick = () => modal.style.display = 'block';
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; }

    form.onsubmit = async (e) => {
        e.preventDefault();
        const tournament = {
            name: document.getElementById('tournamentName').value,
            date: document.getElementById('tournamentDate').value,
            location: document.getElementById('tournamentLocation').value,
            status: 'active',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('tournaments').add(tournament);
        modal.style.display = 'none';
        form.reset();
        loadAdminData();
    };

    loadAdminData();
});

async function loadAdminData() {
    // Load tournaments with edit/delete
    const tournamentsDiv = document.getElementById('admin-tournaments');
    const tournaments = await db.collection('tournaments').get();
    tournamentsDiv.innerHTML = tournaments.docs.map(doc => {
        const data = doc.data();
        const id = doc.id;
        return `
            <div class="tournament-item">
                <h4>${data.name}</h4>
                <p>Date: ${data.date} | ${data.location}</p>
                <div class="admin-controls">
                    <button onclick="updateScore('${id}')" class="btn btn-secondary btn-small">Set Scores</button>
                    <button onclick="deleteTournament('${id}')" class="btn btn-danger btn-small">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}