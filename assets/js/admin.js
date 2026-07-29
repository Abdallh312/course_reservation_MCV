/* ============================================================
   admin.js — manage departments/buildings/rooms/courses,
   approve or reject reservations
   ============================================================ */

let STATE = {
  departments: [], buildings: [], rooms: [], courses: [], reservations: [], users: [], accountRequests: []
};
let currentResFilter = "pending";

function requireLogin() {
  const loggedIn = localStorage.getItem("crs_current_admin_id");
  if (!loggedIn) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function bindLogout() {
  const link = document.getElementById("logoutLink");
  if (!link) return;
  link.addEventListener("click", e => {
    e.preventDefault();
    localStorage.removeItem("crs_current_admin_id");
    window.location.href = "login.html";
  });
}

async function init() {
  if (!requireLogin()) return;
  // Bind navigation first so the sidebar/tabs always work, even if
  // loading or rendering the data below hits an error.
  bindNav();
  bindResTabs();
  bindLogout();
  initSidebarToggle();
  try {
    await refreshAll();
  } catch (e) {
    console.error("Failed to load admin data:", e);
    toast("Something went wrong loading data — check the console.");
  }
}

async function refreshAll() {
  const [departments, buildings, rooms, courses, reservations, users, accountRequests] = await Promise.all([
    API.getDepartments(), API.getBuildings(), API.getRooms(), API.getCourses(),
    API.getReservations(), API.getUsers(), API.getAccountRequests()
  ]);
  STATE = { departments, buildings, rooms, courses, reservations, users, accountRequests };
  renderReservations();
  renderDepartments();
  renderBuildings();
  renderRooms();
  renderCourses();
  renderAccounts();
}

function bindNav() {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".section-panel").forEach(s => s.classList.add("hidden"));
      document.getElementById("section-" + btn.dataset.section).classList.remove("hidden");
    });
  });
}

function bindResTabs() {
  document.querySelectorAll("#resTabStrip button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#resTabStrip button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentResFilter = btn.dataset.status;
      renderReservations();
    });
  });
}

function nameOf(list, id) {
  const item = list.find(x => x.id === id);
  return item ? item.name : "—";
}

/* ============================================================
   Reservations
   ============================================================ */
function renderReservations() {
  const wrap = document.getElementById("reservationsWrap");
  const list = STATE.reservations
    .filter(r => !currentResFilter || r.status === currentResFilter)
    .slice()
    .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

  if (!list.length) {
    wrap.innerHTML = `<div class="empty">
      <div class="glyph">☐</div>
      <h3>Nothing here yet</h3>
      <p>Requests matching this filter will show up as trainees reserve courses.</p>
    </div>`;
    return;
  }

  const rows = list.map(r => {
    const course = STATE.courses.find(c => c.id === r.courseId);
    const user = STATE.users.find(u => u.id === r.userId);
    const isPending = r.status === "pending";
    return `
      <tr>
        <td><b>${escapeHtml(user ? user.name : "Unknown")}</b><div class="small-muted">${escapeHtml(user ? user.email : "")}</div></td>
        <td>${escapeHtml(course ? course.title : "Course removed")}</td>
        <td>${course ? fmtDate(course.date) : "—"}</td>
        <td>${fmtDate(r.requestDate)}</td>
        <td>${statusStamp(r.status)}</td>
        <td>
          <div class="row-actions">
            ${isPending ? `
              <button class="btn btn-approve btn-sm" onclick="setResStatus(${r.id}, 'accepted')">Accept</button>
              <button class="btn btn-reject btn-sm" onclick="setResStatus(${r.id}, 'rejected')">Reject</button>
            ` : `<button class="btn btn-outline btn-sm" onclick="setResStatus(${r.id}, 'pending')">Reopen</button>`}
          </div>
        </td>
      </tr>
    `;
  }).join("");

  wrap.innerHTML = `
    <table class="ledger">
      <thead><tr><th>Trainee</th><th>Course</th><th>Session</th><th>Requested</th><th>Status</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

async function setResStatus(id, status) {
  await API.updateReservationStatus(id, status);
  const r = STATE.reservations.find(x => x.id === id);
  if (r) r.status = status;
  renderReservations();
  toast(status === "accepted" ? "Reservation accepted." : status === "rejected" ? "Reservation rejected." : "Reservation reopened.");
}

/* ============================================================
   Departments
   ============================================================ */
function renderDepartments() {
  const wrap = document.getElementById("departmentsWrap");
  if (!STATE.departments.length) {
    wrap.innerHTML = emptyState("No departments yet", "Add one to start organizing courses.");
    return;
  }
  wrap.innerHTML = `
    <table class="ledger">
      <thead><tr><th>Name</th><th>Description</th><th></th></tr></thead>
      <tbody>
        ${STATE.departments.map(d => `
          <tr>
            <td><b>${escapeHtml(d.name)}</b></td>
            <td>${escapeHtml(d.description || "—")}</td>
            <td><div class="row-actions">
              <button class="btn btn-outline btn-sm" onclick="openDeptForm(${d.id})">Edit</button>
              <button class="btn btn-reject btn-sm" onclick="removeDept(${d.id})">Delete</button>
            </div></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function openDeptForm(id) {
  const dept = id ? STATE.departments.find(d => d.id === id) : null;
  openModal(
    dept ? "Edit department" : "Add department",
    "Departments group courses by subject area.",
    `
      <div class="field"><label>Name</label><input class="form-control" id="f-name" value="${dept ? escapeHtml(dept.name) : ""}" placeholder="e.g. Computer Science"></div>
      <div class="field"><label>Description</label><textarea class="form-control" id="f-desc" rows="3" placeholder="Optional description">${dept ? escapeHtml(dept.description || "") : ""}</textarea></div>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-gold" id="saveBtn">${dept ? "Save changes" : "Add department"}</button>
      </div>
    `
  );
  document.getElementById("saveBtn").onclick = async () => {
    const name = document.getElementById("f-name").value.trim();
    if (!name) return toast("Name is required.");
    const payload = { name, description: document.getElementById("f-desc").value.trim() };
    if (dept) await API.updateDepartment(dept.id, payload);
    else await API.createDepartment(payload);
    closeModal();
    await refreshAll();
    toast(dept ? "Department updated." : "Department added.");
  };
}

async function removeDept(id) {
  confirmDelete("Delete this department?", "Courses referencing it will keep their old id until reassigned.", async () => {
    await API.deleteDepartment(id);
    await refreshAll();
    toast("Department deleted.");
  });
}

/* ============================================================
   Buildings
   ============================================================ */
function renderBuildings() {
  const wrap = document.getElementById("buildingsWrap");
  if (!STATE.buildings.length) {
    wrap.innerHTML = emptyState("No buildings yet", "Add one before creating rooms.");
    return;
  }
  wrap.innerHTML = `
    <table class="ledger">
      <thead><tr><th>Name</th><th>Address</th><th></th></tr></thead>
      <tbody>
        ${STATE.buildings.map(b => `
          <tr>
            <td><b>${escapeHtml(b.name)}</b></td>
            <td>${escapeHtml(b.address || "—")}</td>
            <td><div class="row-actions">
              <button class="btn btn-outline btn-sm" onclick="openBuildingForm(${b.id})">Edit</button>
              <button class="btn btn-reject btn-sm" onclick="removeBuilding(${b.id})">Delete</button>
            </div></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function openBuildingForm(id) {
  const b = id ? STATE.buildings.find(x => x.id === id) : null;
  openModal(
    b ? "Edit building" : "Add building",
    "Buildings hold one or more bookable rooms.",
    `
      <div class="field"><label>Name</label><input class="form-control" id="f-name" value="${b ? escapeHtml(b.name) : ""}" placeholder="e.g. Building A"></div>
      <div class="field"><label>Address <span class="small-muted">(optional)</span></label><input class="form-control" id="f-address" value="${b ? escapeHtml(b.address || "") : ""}" placeholder="Street, city"></div>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-gold" id="saveBtn">${b ? "Save changes" : "Add building"}</button>
      </div>
    `
  );
  document.getElementById("saveBtn").onclick = async () => {
    const name = document.getElementById("f-name").value.trim();
    if (!name) return toast("Name is required.");
    const payload = { name, address: document.getElementById("f-address").value.trim() };
    if (b) await API.updateBuilding(b.id, payload);
    else await API.createBuilding(payload);
    closeModal();
    await refreshAll();
    toast(b ? "Building updated." : "Building added.");
  };
}

async function removeBuilding(id) {
  confirmDelete("Delete this building?", "Rooms and courses that reference it will need reassignment.", async () => {
    await API.deleteBuilding(id);
    await refreshAll();
    toast("Building deleted.");
  });
}

/* ============================================================
   Rooms
   ============================================================ */
function renderRooms() {
  const wrap = document.getElementById("roomsWrap");
  if (!STATE.rooms.length) {
    wrap.innerHTML = emptyState("No rooms yet", "Add a room inside one of your buildings.");
    return;
  }
  wrap.innerHTML = `
    <table class="ledger">
      <thead><tr><th>Name</th><th>Building</th><th>Capacity</th><th></th></tr></thead>
      <tbody>
        ${STATE.rooms.map(r => `
          <tr>
            <td><b>${escapeHtml(r.name)}</b></td>
            <td>${escapeHtml(nameOf(STATE.buildings, r.buildingId))}</td>
            <td>${r.capacity ?? "—"}</td>
            <td><div class="row-actions">
              <button class="btn btn-outline btn-sm" onclick="openRoomForm(${r.id})">Edit</button>
              <button class="btn btn-reject btn-sm" onclick="removeRoom(${r.id})">Delete</button>
            </div></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function openRoomForm(id) {
  const r = id ? STATE.rooms.find(x => x.id === id) : null;
  if (!STATE.buildings.length) return toast("Add a building first.");
  openModal(
    r ? "Edit room" : "Add room",
    "Rooms belong to exactly one building.",
    `
      <div class="field"><label>Name</label><input class="form-control" id="f-name" value="${r ? escapeHtml(r.name) : ""}" placeholder="e.g. Room 101"></div>
      <div class="field"><label>Building</label>
        <select class="form-control" id="f-building">
          ${STATE.buildings.map(b => `<option value="${b.id}" ${r && r.buildingId === b.id ? "selected" : ""}>${escapeHtml(b.name)}</option>`).join("")}
        </select>
      </div>
      <div class="field"><label>Capacity <span class="small-muted">(optional)</span></label><input class="form-control" type="number" min="1" id="f-capacity" value="${r && r.capacity ? r.capacity : ""}" placeholder="e.g. 30"></div>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-gold" id="saveBtn">${r ? "Save changes" : "Add room"}</button>
      </div>
    `
  );
  document.getElementById("saveBtn").onclick = async () => {
    const name = document.getElementById("f-name").value.trim();
    if (!name) return toast("Name is required.");
    const capVal = document.getElementById("f-capacity").value;
    const payload = {
      name,
      buildingId: Number(document.getElementById("f-building").value),
      capacity: capVal ? Number(capVal) : null
    };
    if (r) await API.updateRoom(r.id, payload);
    else await API.createRoom(payload);
    closeModal();
    await refreshAll();
    toast(r ? "Room updated." : "Room added.");
  };
}

async function removeRoom(id) {
  confirmDelete("Delete this room?", "Courses scheduled in it will need a new room.", async () => {
    await API.deleteRoom(id);
    await refreshAll();
    toast("Room deleted.");
  });
}

/* ============================================================
   Courses
   ============================================================ */
function renderCourses() {
  const wrap = document.getElementById("coursesWrap");
  if (!STATE.courses.length) {
    wrap.innerHTML = emptyState("No courses yet", "Add the first course for trainees to reserve.");
    return;
  }
  wrap.innerHTML = `
    <table class="ledger">
      <thead><tr><th>Title</th><th>Department</th><th>Location</th><th>Date</th><th></th></tr></thead>
      <tbody>
        ${STATE.courses.map(c => `
          <tr>
            <td><b>${escapeHtml(c.title)}</b><div class="small-muted">${escapeHtml(c.description)}</div></td>
            <td>${escapeHtml(nameOf(STATE.departments, c.departmentId))}</td>
            <td>${escapeHtml(nameOf(STATE.buildings, c.buildingId))} · ${escapeHtml(nameOf(STATE.rooms, c.roomId))}</td>
            <td>${fmtDate(c.date)}</td>
            <td><div class="row-actions">
              <button class="btn btn-outline btn-sm" onclick="openCourseForm(${c.id})">Edit</button>
              <button class="btn btn-reject btn-sm" onclick="removeCourse(${c.id})">Delete</button>
            </div></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function openCourseForm(id) {
  const c = id ? STATE.courses.find(x => x.id === id) : null;
  if (!STATE.departments.length || !STATE.buildings.length || !STATE.rooms.length) {
    return toast("Add a department, building and room first.");
  }
  const dateVal = c ? new Date(c.date).toISOString().slice(0, 16) : "";
  openModal(
    c ? "Edit course" : "Add course",
    "This is what trainees will see in the catalog.",
    `
      <div class="field"><label>Title</label><input class="form-control" id="f-title" value="${c ? escapeHtml(c.title) : ""}" placeholder="e.g. Intro to React"></div>
      <div class="field"><label>Description</label><textarea class="form-control" id="f-desc" rows="2" placeholder="What trainees will learn">${c ? escapeHtml(c.description) : ""}</textarea></div>
      <div class="field-row">
        <div class="field"><label>Department</label>
          <select class="form-control" id="f-dept">
            ${STATE.departments.map(d => `<option value="${d.id}" ${c && c.departmentId === d.id ? "selected" : ""}>${escapeHtml(d.name)}</option>`).join("")}
          </select>
        </div>
        <div class="field"><label>Building</label>
          <select class="form-control" id="f-building">
            ${STATE.buildings.map(b => `<option value="${b.id}" ${c && c.buildingId === b.id ? "selected" : ""}>${escapeHtml(b.name)}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="field-row">
        <div class="field"><label>Room</label>
          <select class="form-control" id="f-room">
            ${STATE.rooms.map(r => `<option value="${r.id}" ${c && c.roomId === r.id ? "selected" : ""}>${escapeHtml(r.name)}</option>`).join("")}
          </select>
        </div>
        <div class="field"><label>Date & time</label>
          <input class="form-control" type="datetime-local" id="f-date" value="${dateVal}">
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-gold" id="saveBtn">${c ? "Save changes" : "Add course"}</button>
      </div>
    `
  );
  document.getElementById("saveBtn").onclick = async () => {
    const title = document.getElementById("f-title").value.trim();
    const date = document.getElementById("f-date").value;
    if (!title) return toast("Title is required.");
    if (!date) return toast("Date & time is required.");
    const payload = {
      title,
      description: document.getElementById("f-desc").value.trim(),
      departmentId: Number(document.getElementById("f-dept").value),
      buildingId: Number(document.getElementById("f-building").value),
      roomId: Number(document.getElementById("f-room").value),
      date: new Date(date).toISOString()
    };
    if (c) await API.updateCourse(c.id, payload);
    else await API.createCourse(payload);
    closeModal();
    await refreshAll();
    toast(c ? "Course updated." : "Course added.");
  };
}

async function removeCourse(id) {
  confirmDelete("Delete this course?", "Any reservations tied to it will be removed too.", async () => {
    await API.deleteCourse(id);
    await refreshAll();
    toast("Course deleted.");
  });
}

/* ============================================================
   Accounts — review requests, create student credentials
   ============================================================ */
function renderAccounts() {
  renderAccountRequests();
  renderStudents();

  const pendingCount = STATE.accountRequests.filter(r => r.status === "pending").length;
  const badge = document.getElementById("reqBadge");
  if (badge) {
    if (pendingCount) { badge.textContent = pendingCount; badge.style.display = "inline-flex"; }
    else { badge.style.display = "none"; }
  }
}

function renderAccountRequests() {
  const wrap = document.getElementById("accountRequestsWrap");
  const countLabel = document.getElementById("reqCountLabel");
  const pending = STATE.accountRequests
    .filter(r => r.status === "pending")
    .slice()
    .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

  if (countLabel) countLabel.textContent = pending.length ? `${pending.length} waiting` : "";

  if (!pending.length) {
    wrap.innerHTML = emptyState("No pending requests", "Requests submitted from the landing page's \u201cRequest account\u201d button will show up here.");
    return;
  }

  wrap.innerHTML = pending.map(r => `
    <div class="req-card">
      <div>
        <div class="who">${escapeHtml(r.name)}</div>
        <div class="small-muted">${escapeHtml(r.email)}${r.note ? " — " + escapeHtml(r.note) : ""}</div>
        <div class="small-muted">Requested ${fmtDate(r.requestDate)}</div>
      </div>
      <div class="row-actions">
        <button class="btn btn-approve btn-sm" onclick="approveAccountRequest(${r.id})">Create account</button>
        <button class="btn btn-reject btn-sm" onclick="declineAccountRequest(${r.id})">Decline</button>
      </div>
    </div>
  `).join("");
}

function approveAccountRequest(id) {
  const req = STATE.accountRequests.find(r => r.id === id);
  if (!req) return;
  openStudentForm(null, req);
}

async function declineAccountRequest(id) {
  confirmDelete("Decline this request?", "The requester will not receive an account from it.", async () => {
    await API.updateAccountRequestStatus(id, "declined");
    await refreshAll();
    toast("Request declined.");
  });
}

function renderStudents() {
  const wrap = document.getElementById("studentsWrap");
  if (!STATE.users.length) {
    wrap.innerHTML = emptyState("No student accounts yet", "Add one, or approve an account request above.");
    return;
  }
  wrap.innerHTML = `
    <div class="table-scroll">
    <table class="ledger">
      <thead><tr><th>Name</th><th>Email</th><th></th></tr></thead>
      <tbody>
        ${STATE.users.map(u => `
          <tr>
            <td><b>${escapeHtml(u.name)}</b></td>
            <td>${escapeHtml(u.email || "—")}</td>
            <td><div class="row-actions">
              <button class="btn btn-outline btn-sm" onclick="openStudentForm(${u.id})">Edit</button>
              <button class="btn btn-reject btn-sm" onclick="removeStudent(${u.id})">Delete</button>
            </div></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
    </div>
  `;
}

function openStudentForm(id, fromRequest) {
  const student = id ? STATE.users.find(u => u.id === id) : null;
  const prefillName = student ? student.name : (fromRequest ? fromRequest.name : "");
  const prefillEmail = student ? student.email : (fromRequest ? fromRequest.email : "");
  openModal(
    student ? "Edit student account" : "Add student account",
    fromRequest
      ? `Creating credentials for the request from ${escapeHtml(fromRequest.email)}.`
      : "Set a temporary password the student can change after their first sign-in.",
    `
      <div class="field"><label>Full name</label><input class="form-control" id="f-name" value="${escapeHtml(prefillName)}" placeholder="e.g. Sara Ahmed"></div>
      <div class="field"><label>Email</label><input class="form-control" type="email" id="f-email" value="${escapeHtml(prefillEmail)}" placeholder="student@example.com"></div>
      <div class="field">
        <label>${student ? "New password" : "Temporary password"} ${student ? '<span class="small-muted">(leave blank to keep current)</span>' : ""}</label>
        <input class="form-control" type="text" id="f-password" placeholder="${student ? "••••••••" : "e.g. Welcome123"}">
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-gold" id="saveBtn">${student ? "Save changes" : "Create account"}</button>
      </div>
    `
  );
  document.getElementById("saveBtn").onclick = async () => {
    const name = document.getElementById("f-name").value.trim();
    const email = document.getElementById("f-email").value.trim();
    const password = document.getElementById("f-password").value;
    if (!name) return toast("Name is required.");
    if (!email) return toast("Email is required.");
    if (!student && !password) return toast("Set a temporary password.");

    if (student) {
      const payload = { name, email };
      if (password) payload.password = password;
      await API.updateUser(student.id, payload);
    } else {
      await API.createUser({ name, email, password });
      if (fromRequest) await API.updateAccountRequestStatus(fromRequest.id, "approved");
    }
    closeModal();
    await refreshAll();
    toast(student ? "Account updated." : "Student account created.");
  };
}

async function removeStudent(id) {
  confirmDelete("Delete this student account?", "They will lose access immediately.", async () => {
    await API.deleteUser(id);
    await refreshAll();
    toast("Account deleted.");
  });
}

/* ============================================================
   Shared helpers
   ============================================================ */
function emptyState(title, sub) {
  return `<div class="empty"><div class="glyph">∅</div><h3>${title}</h3><p>${sub}</p></div>`;
}

function confirmDelete(title, sub, onConfirm) {
  openModal(title, sub, `
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-reject" id="confirmDeleteBtn">Delete</button>
    </div>
  `);
  document.getElementById("confirmDeleteBtn").onclick = onConfirm;
}

document.addEventListener("DOMContentLoaded", init);
