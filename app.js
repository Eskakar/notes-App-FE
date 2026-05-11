const API_URL = "http://localhost:3000/api/v1";

let editingId = null;
window.onload = () => {
  showUser();
  loadNotes();
};

// ================= LOGIN =================
async function login() {
  const nama = document.getElementById("nama").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API_URL}/users/Login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ nama, password })
  });

  const data = await res.json();

  if (res.ok) {
    // simpan token
    localStorage.setItem("token", data.token);

    alert("Login berhasil");

    // balik ke home
    window.location.href = "index.html";
    showUser();
  } else {
    alert(data.message);
  }
}


// ================= SIMPAN NOTE =================
async function simpanNote() {
  const judul = document.getElementById("judul").value;
  const isi = document.getElementById("isi").value;
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Harus login dulu!");
    window.location.href = "login.html";
    return;
  }

  let url = `${API_URL}/notes`;
  let method = "POST";

  // 🔥 kalau sedang edit
  if (editingId) {
    url = `${API_URL}/notes/${editingId}`;
    method = "PUT";
  }

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ judul, isi })
  });

  if (res.ok) {
    alert(editingId ? "Note berhasil diupdate" : "Note berhasil dibuat");

    // reset form
    document.getElementById("judul").value = "";
    document.getElementById("isi").value = "";

    editingId = null;

    loadNotes();
  } else {
    const data = await res.json();
    alert(data.message);
  }
}

// ================= REGISTER =================
async function register() {
  const nama = document.getElementById("nama").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API_URL}/users/Register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ nama, password })
  });

  const data = await res.json();

  if (res.ok) {
    alert("Register berhasil");

    // langsung ke login
    window.location.href = "login.html";
  } else {
    alert(data.message);
  }
}

// ================= LOAD SEMUA NOTE =================
async function loadNotes() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const res = await fetch(`${API_URL}/notes`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await res.json();

  const container = document.getElementById("notesContainer");
  container.innerHTML = "";

  data.forEach(note => {
    const div = document.createElement("div");
    div.classList.add("note-card");

    div.innerHTML = `
        <link rel="stylesheet" href="style.css">
      <h3>${note.judul}</h3>
      <p>${note.isi}</p>

      <button class="btn-edit" onclick="editNote('${note.id_note}', '${note.judul}', \`${note.isi}\`)">✏️ Edit</button>
      <button class="btn-delete" onclick="deleteNote('${note.id_note}')">🗑️ Delete</button>
    `;

    container.appendChild(div);
  });
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

function editNote(id, judul, isi) {
  document.getElementById("judul").value = judul;
  document.getElementById("isi").value = isi;

  editingId = id; // tandai lagi edit
}

async function deleteNote(id) {
  const token = localStorage.getItem("token");

  if (!confirm("Yakin mau hapus note ini?")) return;

  const res = await fetch(`${API_URL}/notes/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (res.ok) {
    alert("Note berhasil dihapus");
    loadNotes();
  } else {
    const data = await res.json();
    alert(data.message);
  }
}

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

function showUser() {
  const token = localStorage.getItem("token");

  if (!token) return;

  const user = parseJwt(token);

  if (user) {
    document.getElementById("welcomeText").innerText =
      `Halo, ${user.nama} 👋`;
  }
}