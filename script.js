// Initialize auth & db from firebase-config.js
// Make sure firebase-config.js is loaded before this script

// Listen to auth state changes and redirect accordingly
auth.onAuthStateChanged(async (user) => {
    if (user) {
        try {
            const userDoc = await db.collection("users").doc(user.uid).get();
            const userData = userDoc.data();

            const currentPath = window.location.pathname;

            if (currentPath.includes("login.html") || currentPath === "/" || currentPath.endsWith(".html") === false) {
                // Redirect to admin or user dashboard depending on role
                if (userData?.role === "admin") {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "dashboard.html";
                }
            }

            // If on dashboard
            if (currentPath.includes("dashboard.html")) {
                const userNameElem = document.getElementById("userName");
                if (userNameElem) userNameElem.textContent = userData?.displayName || user.email;
            }

            // If on admin page
            if (currentPath.includes("admin.html")) {
                if (userData?.role !== "admin") {
                    // Not allowed to access admin page
                    alert("You do not have admin privileges.");
                    window.location.href = "dashboard.html";
                } else {
                    const adminNameElem = document.getElementById("adminName");
                    if (adminNameElem) adminNameElem.textContent = userData?.displayName || user.email;
                }
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            alert("An error occurred. Please try logging in again.");
            auth.signOut();
            window.location.href = "login.html";
        }
    } else {
        // Not logged in
        const currentPath = window.location.pathname;
        if (currentPath.includes("dashboard.html") || currentPath.includes("admin.html")) {
            window.location.href = "login.html";
        }
    }
});

// Login form handler
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        await auth.signInWithEmailAndPassword(email, password);
        // Redirect handled by onAuthStateChanged listener
    } catch (error) {
        alert("Login failed: " + getFriendlyErrorMessage(error.code));
    }
});

// Register form handler
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const displayName = document.getElementById("displayName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await db.collection("users").doc(userCredential.user.uid).set({
            displayName,
            email,
            role: "user", // default role for new users
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        window.location.href = "dashboard.html";
    } catch (error) {
        alert("Registration failed: " + getFriendlyErrorMessage(error.code));
    }
});

// Logout button handler (place logout button with id="logoutBtn" where needed)
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await auth.signOut();
    window.location.href = "login.html";
});

// Friendly error messages map for Firebase auth errors
function getFriendlyErrorMessage(code) {
    const errors = {
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/user-not-found": "No user found with this email.",
        "auth/invalid-email": "Invalid email address.",
        "auth/email-already-in-use": "Email is already registered.",
        "auth/weak-password": "Password should be at least 6 characters.",
        "auth/too-many-requests": "Too many failed attempts. Please try later.",
    };
    return errors[code] || "An error occurred: " + code;
}

// Example function to load public tournaments (optional)
async function loadPublicTournaments() {
    const tournamentsDiv = document.getElementById("public-tournaments");
    if (!tournamentsDiv) return;

    try {
        const snapshot = await db.collection("tournaments").where("status", "==", "active").limit(5).get();

        if (snapshot.empty) {
            tournamentsDiv.innerHTML = "<p>No active tournaments at the moment.</p>";
            return;
        }

        tournamentsDiv.innerHTML = snapshot.docs
            .map((doc) => {
                const d = doc.data();
                return `
                <div class="tournament-item">
                   <h4>${d.name}</h4>
                   <p><strong>Date: </strong> ${d.date}</p>
                   <p><strong>Location: </strong> ${d.location}</p>
                </div>`;
            })
            .join("");
    } catch (error) {
        tournamentsDiv.innerHTML = "<p>Unable to load tournaments.</p>";
        console.error("Error loading tournaments:", error);
    }
}
