// ========== DATABASE MANAGEMENT ==========
let criminals = [];
let currentEditId = null;
let searchQuery = "";

// Load data from localStorage
function loadData() {
    const stored = localStorage.getItem("criminalsDB_final");
    if (stored) {
        criminals = JSON.parse(stored);
    } else {
        criminals = [
            { id: "rec1", name: "Victor Lazlo", email: "vlazlo@blackmarket.com", location: "Moscow, Russia", crime: "Cyber fraud & extortion", crimeDate: "2024-02-15", ongoingCase: "IC-449 (active)", prisonTerm: "8 years", otherInfo: "Alias: GhostByte. High-level hacker.", photoDataURL: "" },
            { id: "rec2", name: "Elena Vasquez", email: "evasquez@cartel.cc", location: "Medellín, Colombia", crime: "Drug trafficking", crimeDate: "2023-11-01", ongoingCase: "DEA Joint #772", prisonTerm: "22 years", otherInfo: "Cartel lieutenant. Extremely dangerous.", photoDataURL: "" },
            { id: "rec3", name: "Marcus Cole", email: "marcus.reap@proton.me", location: "Detroit, MI", crime: "Armed robbery, assault", crimeDate: "2025-01-10", ongoingCase: "Case #D-882", prisonTerm: "12 years", otherInfo: "Gang leader. Multiple victims.", photoDataURL: "" }
        ];
        saveToLocal();
    }
}

function saveToLocal() {
    localStorage.setItem("criminalsDB_final", JSON.stringify(criminals));
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>]/g, function (m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function showSuccessMessage(message) {
    const existingMsg = document.querySelector('.success-message');
    if (existingMsg) existingMsg.remove();

    const msgDiv = document.createElement('div');
    msgDiv.className = 'success-message';
    msgDiv.innerHTML = `✅ ${message}`;
    document.body.appendChild(msgDiv);

    setTimeout(() => {
        if (msgDiv) msgDiv.remove();
    }, 3000);
}