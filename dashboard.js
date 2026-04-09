// ========== DASHBOARD LOGIC ==========

// Check login status
const loggedInOfficer = localStorage.getItem("loggedInOfficer");
if (!loggedInOfficer) {
    window.location.href = "index.html";
}
document.getElementById("userNameDisplay").innerHTML = `👮 ${escapeHtml(loggedInOfficer)}`;

// Logout
document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("loggedInOfficer");
    window.location.href = "index.html";
});

// Navigation
let currentPage = "registry";
function navigateToPage(pageName) {
    currentPage = pageName;
    document.querySelectorAll(".page-content").forEach(page => page.classList.remove("active-page"));
    document.getElementById(`${pageName}Page`).classList.add("active-page");
    document.querySelectorAll(".nav-btn").forEach(btn => {
        if (btn.dataset.page === pageName) btn.classList.add("active");
        else btn.classList.remove("active");
    });
    if (pageName === "registry") renderRegistryTable();
}

document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => navigateToPage(btn.dataset.page));
});

// Render Registry Table
function renderRegistryTable() {
    const tbody = document.getElementById("tableBody");
    let filtered = criminals;
    if (searchQuery.trim() !== "") {
        const q = searchQuery.trim().toLowerCase();
        filtered = criminals.filter(c => c.name.toLowerCase().includes(q));
    }
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:40px;">🔍 No criminals found</td></tr>`;
        return;
    }
    tbody.innerHTML = "";
    filtered.forEach(crim => {
        const row = tbody.insertRow();
        const photoCell = row.insertCell(0);
        const photoDiv = document.createElement("div");
        photoDiv.className = "criminal-photo-sm";
        if (crim.photoDataURL && crim.photoDataURL.startsWith("data:image")) {
            photoDiv.style.backgroundImage = `url(${crim.photoDataURL})`;
            photoDiv.style.backgroundSize = "cover";
            photoDiv.innerText = "";
        } else {
            photoDiv.innerText = "👤";
        }
        photoCell.appendChild(photoDiv);
        row.insertCell(1).innerText = crim.name;
        row.insertCell(2).innerText = crim.crime || "—";
        row.insertCell(3).innerText = crim.location || "—";
        row.insertCell(4).innerText = crim.crimeDate || "—";
        row.insertCell(5).innerText = crim.ongoingCase || "—";
        row.insertCell(6).innerText = crim.prisonTerm || "—";
        const actionsCell = row.insertCell(7);
        actionsCell.className = "action-group";

        const viewBtn = document.createElement("button");
        viewBtn.innerText = "👁️ VIEW";
        viewBtn.classList.add("view-btn");
        viewBtn.setAttribute("data-id", crim.id);
        viewBtn.onclick = function () { showCriminalDetail(crim.id); };

        const editBtn = document.createElement("button");
        editBtn.innerText = "✏️ EDIT";
        editBtn.classList.add("edit-btn");
        editBtn.setAttribute("data-id", crim.id);
        editBtn.onclick = function () {
            navigateToPage("add");
            fillFormForEdit(crim.id);
        };

        const delBtn = document.createElement("button");
        delBtn.innerText = "🗑️ DELETE";
        delBtn.classList.add("delete-btn");
        delBtn.setAttribute("data-id", crim.id);
        delBtn.onclick = function () { deleteRecord(crim.id); };

        actionsCell.appendChild(viewBtn);
        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(delBtn);
    });
}

// Show Criminal Detail
function showCriminalDetail(id) {
    const criminal = criminals.find(c => c.id === id);
    if (!criminal) return;

    let photoHtml = "";
    if (criminal.photoDataURL && criminal.photoDataURL.startsWith("data:image")) {
        photoHtml = `<div style="width:200px; height:200px; border-radius:50%; margin:0 auto 24px; border:4px solid #5f7ec9; background-image: url(${criminal.photoDataURL}); background-size: cover; background-position: center;"></div>`;
    } else {
        photoHtml = `<div style="width:200px; height:200px; background:#1f2a48; border-radius:50%; margin:0 auto 24px; display:flex; align-items:center; justify-content:center; font-size:5rem;">👤</div>`;
    }

    const fields = [
        { label: "📧 EMAIL", value: criminal.email || "—" },
        { label: "📍 LOCATION", value: criminal.location || "—" },
        { label: "⚡ CRIME TYPE", value: criminal.crime || "—" },
        { label: "📅 DATE OF CRIME", value: criminal.crimeDate || "—" },
        { label: "⚖️ ONGOING CASE", value: criminal.ongoingCase || "—" },
        { label: "🔒 PRISONMENT TERM", value: criminal.prisonTerm || "—" },
        { label: "📝 OTHER INFORMATION", value: criminal.otherInfo || "—" }
    ];

    let fieldsHtml = "";
    fields.forEach(f => {
        fieldsHtml += `<div style="background:#0a1022; padding:14px 18px; border-radius:1rem; margin-bottom:12px; border-left:4px solid #5f7ec9;"><label style="font-size:0.7rem; text-transform:uppercase; color:#8e9fd3;">${f.label}</label><p style="color:white; margin-top:6px;">${escapeHtml(f.value)}</p></div>`;
    });

    const detailHtml = `
    <div style="background:#0c1122cc; border-radius:1.8rem; padding:2rem; border:1px solid #283253; max-width:700px; margin:0 auto;">
      ${photoHtml}
      <div style="font-size:2rem; font-weight:bold; color:#eef3ff; text-align:center; margin-bottom:24px;">${escapeHtml(criminal.name)}</div>
      ${fieldsHtml}
      <div style="text-align:center; margin-top:24px;">
        <button id="backFromDetailBtn" style="background:#3b5b8c; border:none; padding:12px 24px; border-radius:40px; color:white; cursor:pointer;">← BACK TO REGISTRY</button>
      </div>
    </div>
  `;

    const overlay = document.createElement("div");
    overlay.id = "detailOverlay";
    overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:1000; overflow-y:auto; padding:40px 20px;";
    overlay.innerHTML = detailHtml;
    document.body.appendChild(overlay);

    document.getElementById("backFromDetailBtn").addEventListener("click", function () {
        overlay.remove();
    });
}

// Delete Record - FIXED: Immediately removes from screen
function deleteRecord(id) {
    const criminal = criminals.find(c => c.id === id);
    if (!criminal) return;

    if (confirm(`⚠️ PERMANENTLY DELETE ${criminal.name.toUpperCase()} from the database?\n\nThis action cannot be undone.`)) {
        // Remove from array
        criminals = criminals.filter(c => c.id !== id);
        // Save to localStorage
        saveToLocal();
        // Clear edit form if this record was being edited
        if (currentEditId === id) clearForm();
        // Re-render the table immediately
        renderRegistryTable();
        // Show success message
        showSuccessMessage(`${criminal.name} has been removed from the database.`);
    }
}

// Add or Update Criminal - FIXED with success message
async function addOrUpdateCriminal() {
    const name = document.getElementById("nameInput").value.trim();
    if (!name) {
        alert("❌ Criminal name is required!");
        return;
    }

    const editId = document.getElementById("editId").value;

    // Check for duplicate names (only for new records)
    if (!editId) {
        const existingCriminal = criminals.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (existingCriminal) {
            if (confirm(`⚠️ "${name}" already exists in the database!\n\nDo you want to edit the existing record instead?`)) {
                navigateToPage("add");
                fillFormForEdit(existingCriminal.id);
            }
            return;
        }
    }

    const email = document.getElementById("emailInput").value.trim();
    const location = document.getElementById("locationInput").value.trim();
    const crime = document.getElementById("crimeInput").value.trim();
    const crimeDate = document.getElementById("dateInput").value;
    const ongoingCase = document.getElementById("caseInput").value.trim();
    const prisonTerm = document.getElementById("termInput").value.trim();
    const otherInfo = document.getElementById("otherInput").value.trim();

    let photoDataURL = "";
    const fileInput = document.getElementById("photoFile");
    if (fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (file.type.startsWith("image/")) {
            photoDataURL = await fileToBase64(file);
        } else {
            alert("❌ Please select a valid image file.");
            return;
        }
    } else {
        if (editId) {
            const existing = criminals.find(c => c.id === editId);
            if (existing && existing.photoDataURL) photoDataURL = existing.photoDataURL;
        }
    }

    if (editId) {
        // UPDATE EXISTING RECORD
        const index = criminals.findIndex(c => c.id === editId);
        if (index !== -1) {
            criminals[index] = { ...criminals[index], name, email, location, crime, crimeDate, ongoingCase, prisonTerm, otherInfo, photoDataURL: photoDataURL || criminals[index].photoDataURL };
            saveToLocal();
            clearForm();
            renderRegistryTable();
            showSuccessMessage(`${name}'s record has been UPDATED successfully!`);
            navigateToPage("registry");
        }
    } else {
        // ADD NEW RECORD
        const newId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        const newCriminal = { id: newId, name, email, location, crime, crimeDate, ongoingCase, prisonTerm, otherInfo, photoDataURL: photoDataURL || "" };
        criminals.unshift(newCriminal);
        saveToLocal();
        clearForm();
        renderRegistryTable();
        showSuccessMessage(`${name} has been ADDED to the criminal database!`);
        navigateToPage("registry");
    }
}

function fillFormForEdit(id) {
    const criminal = criminals.find(c => c.id === id);
    if (criminal) {
        document.getElementById("editId").value = id;
        document.getElementById("nameInput").value = criminal.name || "";
        document.getElementById("emailInput").value = criminal.email || "";
        document.getElementById("locationInput").value = criminal.location || "";
        document.getElementById("crimeInput").value = criminal.crime || "";
        document.getElementById("dateInput").value = criminal.crimeDate || "";
        document.getElementById("caseInput").value = criminal.ongoingCase || "";
        document.getElementById("termInput").value = criminal.prisonTerm || "";
        document.getElementById("otherInput").value = criminal.otherInfo || "";
        document.getElementById("photoFile").value = "";
        if (criminal.photoDataURL && criminal.photoDataURL.startsWith("data:image")) {
            document.getElementById("photoPreview").style.backgroundImage = `url(${criminal.photoDataURL})`;
            document.getElementById("photoPreview").style.backgroundSize = "cover";
            document.getElementById("photoPreview").innerText = "";
        } else {
            document.getElementById("photoPreview").style.backgroundImage = "";
            document.getElementById("photoPreview").innerText = "📸";
        }
        document.getElementById("addUpdateBtn").innerText = "✏️ UPDATE RECORD";
        document.getElementById("cancelEditBtn").style.display = "inline-block";
        currentEditId = id;
    }
}

function clearForm() {
    document.getElementById("nameInput").value = "";
    document.getElementById("emailInput").value = "";
    document.getElementById("locationInput").value = "";
    document.getElementById("crimeInput").value = "";
    document.getElementById("dateInput").value = "";
    document.getElementById("caseInput").value = "";
    document.getElementById("termInput").value = "";
    document.getElementById("otherInput").value = "";
    document.getElementById("editId").value = "";
    document.getElementById("photoFile").value = "";
    document.getElementById("photoPreview").style.backgroundImage = "";
    document.getElementById("photoPreview").innerText = "📸";
    currentEditId = null;
    document.getElementById("addUpdateBtn").innerText = "➕ ADD RECORD";
    document.getElementById("cancelEditBtn").style.display = "none";
}

function resetSearch() {
    searchQuery = "";
    document.getElementById("searchInput").value = "";
    renderRegistryTable();
}

function performSearch() {
    searchQuery = document.getElementById("searchInput").value;
    renderRegistryTable();
}

// Photo Upload
function initPhotoUpload() {
    const uploadBtn = document.getElementById("uploadPhotoBtn");
    const fileInput = document.getElementById("photoFile");
    const preview = document.getElementById("photoPreview");
    if (uploadBtn && fileInput) {
        uploadBtn.onclick = () => fileInput.click();
        fileInput.onchange = () => {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const reader = new FileReader();
                reader.onload = function (ev) {
                    preview.style.backgroundImage = `url(${ev.target.result})`;
                    preview.style.backgroundSize = "cover";
                    preview.innerText = "";
                };
                reader.readAsDataURL(file);
            }
        };
    }
}

// Initialize everything when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
    loadData();
    renderRegistryTable();
    initPhotoUpload();

    const searchBtn = document.getElementById("searchBtn");
    const resetSearchBtn = document.getElementById("resetSearchBtn");
    const addUpdateBtn = document.getElementById("addUpdateBtn");
    const cancelEditBtn = document.getElementById("cancelEditBtn");
    const clearFormBtn = document.getElementById("clearFormBtn");

    if (searchBtn) searchBtn.addEventListener("click", performSearch);
    if (resetSearchBtn) resetSearchBtn.addEventListener("click", resetSearch);
    if (addUpdateBtn) addUpdateBtn.addEventListener("click", addOrUpdateCriminal);
    if (cancelEditBtn) cancelEditBtn.addEventListener("click", clearForm);
    if (clearFormBtn) clearFormBtn.addEventListener("click", clearForm);
});