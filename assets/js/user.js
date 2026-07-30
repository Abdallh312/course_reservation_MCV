/* ============================================================
   user.js — Browse courses, reserve, view My Learning List
   ============================================================ */

let STATE = {
  departments: [],
  buildings: [],
  rooms: [],
  courses: [],
  reservations: [],
  users: []
};

function requireLogin() {
  const loggedIn = localStorage.getItem("crs_current_user_id");
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
    localStorage.removeItem("crs_current_user_id");
    window.location.href = "login.html";
  });
}

async function init() {
  if (!requireLogin()) return;
  bindNav();
  bindLogout();
  initSidebarToggle();
  const currentUserId = getCurrentUserId();
  try {
    const [departments, buildings, rooms, courses, userReservations, users, allReservations] = await Promise.all([
      API.getDepartments(), API.getBuildings(), API.getRooms(), API.getCourses(),
      API.getUserReservations(currentUserId), API.getUsers(), API.getReservations()
    ]);
    STATE = { departments, buildings, rooms, courses, reservations: userReservations || [], users, allReservations: allReservations || [] };

    const me = (users || []).find(u => u.id === currentUserId || u.Id === currentUserId);
    const userTag = document.getElementById("currentUserTag");
    if (userTag) userTag.textContent = me ? `${me.name || me.Name} (Student)` : "Student Portal";

    renderDeptFilter();
    renderCourses();
    renderLearningList();

    const deptFilter = document.getElementById("deptFilter");
    if (deptFilter) deptFilter.addEventListener("change", renderCourses);

    const searchInput = document.getElementById("courseSearchInput");
    if (searchInput) searchInput.addEventListener("input", renderCourses);
  } catch (e) {
    console.error("Failed to load data:", e);
    toast("Something went wrong loading data — check the console.");
  }
}

function bindNav() {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".section-panel").forEach(s => s.classList.add("hidden"));
      document.getElementById("section-" + btn.dataset.section).classList.remove("hidden");
      if (btn.dataset.section === "learning") renderLearningList();
    });
  });
}

function renderDeptFilter() {
  const sel = document.getElementById("deptFilter");
  if (!sel) return;
  sel.innerHTML = '<option value="">All departments</option>';
  STATE.departments.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.id; opt.textContent = d.name;
    sel.appendChild(opt);
  });
}

function myReservationFor(courseId) {
  return STATE.reservations.find(r => r.courseId === courseId || r.CourseId === courseId);
}

function renderCourses() {
  const deptVal = document.getElementById("deptFilter") ? document.getElementById("deptFilter").value : "";
  const query = document.getElementById("courseSearchInput") ? document.getElementById("courseSearchInput").value.trim().toLowerCase() : "";
  const grid = document.getElementById("courseGrid");
  if (!grid) return;

  const list = STATE.courses.filter(c => {
    const matchesDept = !deptVal || c.departmentId === Number(deptVal);
    const titleMatch = (c.title || "").toLowerCase().includes(query);
    const descMatch = (c.description || "").toLowerCase().includes(query);
    return matchesDept && (titleMatch || descMatch);
  });

  if (!list.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1;">
      <div class="glyph">🔍</div>
      <h3>No courses found</h3>
      <p>Try adjusting your search query or department filter.</p>
    </div>`;
    return;
  }

  grid.innerHTML = list.map(c => {
    const dept = STATE.departments.find(d => d.id === c.departmentId);
    const building = STATE.buildings.find(b => b.id === c.buildingId);
    const room = STATE.rooms.find(r => r.id === c.roomId);
    const existing = myReservationFor(c.id);

    const capacity = c.capacity || c.Capacity || 30;
    const activeCount = c.enrolledCount !== undefined ? c.enrolledCount :
      (STATE.allReservations || []).filter(r => (r.courseId === c.id || r.CourseId === c.id) && (r.status === "accepted" || r.status === "pending" || r.status === "approved")).length;
    const isFull = activeCount >= capacity;

    let actionHtml;
    if (existing) {
      if (existing.status === "pending") {
        actionHtml = statusStamp("pending");
      } else if (existing.status === "accepted" || existing.status === "approved") {
        actionHtml = statusStamp("accepted");
      } else {
        actionHtml = statusStamp("rejected");
      }
    } else if (isFull) {
      actionHtml = `<button class="btn btn-outline btn-sm" disabled style="opacity:0.75; cursor:not-allowed; border-color:#EF4444; color:#F87171; background:rgba(239,68,68,0.1);">Course Full</button>`;
    } else {
      actionHtml = `<button class="btn btn-gold btn-sm" onclick="reserveCourse(${c.id})">Reserve seat</button>`;
    }

    return `
      <div class="ticket">
        <div class="ticket-body">
          <span class="dept">${escapeHtml(dept ? dept.name : "General")}</span>
          <h3>${escapeHtml(c.title)}</h3>
          <p class="desc">${escapeHtml(c.description || "No description provided.")}</p>
          <div class="meta">
            <span><b>Session Date:</b> ${fmtDate(c.date)}</span>
            <span><b>Location:</b> ${escapeHtml(building ? building.name : "Main Campus")} · ${escapeHtml(room ? room.name : "Room")}</span>
            <span><b>Seats:</b> ${activeCount} / ${capacity} ${isFull ? '<span class="badge badge-rejected" style="margin-left:6px;">Course Full</span>' : '<span class="badge badge-approved" style="margin-left:6px; background:rgba(34,197,94,0.15); color:#4ADE80; border:1px solid rgba(34,197,94,0.3);">Open</span>'}</span>
          </div>
        </div>
        <div class="ticket-stub">
          <span class="code">CRS-${String(c.id).padStart(4, "0")}</span>
          ${actionHtml}
        </div>
      </div>
    `;
  }).join("");
}

async function reserveCourse(courseId) {
  const currentUserId = getCurrentUserId();
  const course = STATE.courses.find(c => c.id === courseId);
  openModal(
    "Confirm Course Reservation",
    `Would you like to reserve a seat for "${escapeHtml(course.title)}"?`,
    `<div class="modal-actions">
       <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
       <button class="btn btn-gold" id="confirmReserveBtn">Confirm reservation</button>
     </div>`
  );
  document.getElementById("confirmReserveBtn").onclick = async () => {
    const btn = document.getElementById("confirmReserveBtn");
    btn.disabled = true; btn.textContent = "Reserving…";
    try {
      const reservation = await API.createReservation({ userId: currentUserId, courseId });
      STATE.reservations.push(reservation);
      closeModal();
      renderCourses();
      renderLearningList();
      toast("Reservation requested — awaiting admin approval.");
    } catch (err) {
      closeModal();
      toast(err.message || "Failed to create reservation.");
    }
  };
}

function renderLearningList() {
  const wrap = document.getElementById("learningListWrap");
  if (!wrap) return;

  if (!STATE.reservations.length) {
    wrap.innerHTML = `<div class="empty">
      <div class="glyph">📚</div>
      <h3>Your learning list is empty</h3>
      <p>Reserve a course from the catalog to track it here.</p>
    </div>`;
    return;
  }

  const rows = STATE.reservations
    .slice()
    .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate))
    .map(r => {
      const c = STATE.courses.find(x => x.id === r.courseId);
      return `
        <tr>
          <td><b>${escapeHtml(c ? c.title : "Course removed")}</b></td>
          <td>${c ? fmtDate(c.date) : "—"}</td>
          <td>${fmtDate(r.requestDate)}</td>
          <td>${statusStamp(r.status)}</td>
        </tr>
      `;
    }).join("");

  wrap.innerHTML = `
    <table class="ledger">
      <thead><tr><th>Course</th><th>Session date</th><th>Requested</th><th>Status</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

document.addEventListener("DOMContentLoaded", init);
