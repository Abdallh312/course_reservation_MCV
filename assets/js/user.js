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
    const [departments, buildings, rooms, courses, reservations, users] = await Promise.all([
      API.getDepartments(), API.getBuildings(), API.getRooms(), API.getCourses(),
      API.getUserReservations(currentUserId), API.getUsers()
    ]);
    STATE = { departments, buildings, rooms, courses, reservations, users };

    const me = users.find(u => u.id === currentUserId);
    document.getElementById("currentUserTag").textContent = me ? me.name : "User";

    renderDeptFilter();
    renderCourses();
    renderLearningList();
    document.getElementById("deptFilter").addEventListener("change", renderCourses);
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
  STATE.departments.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d.id; opt.textContent = d.name;
    sel.appendChild(opt);
  });
}

function lookupName(list, id) {
  const item = list.find(x => x.id === id);
  return item ? item.name : "—";
}

function myReservationFor(courseId) {
  return STATE.reservations.find(r => r.courseId === courseId);
}

function renderCourses() {
  const deptVal = document.getElementById("deptFilter").value;
  const grid = document.getElementById("courseGrid");
  const list = STATE.courses.filter(c => !deptVal || c.departmentId === Number(deptVal));

  if (!list.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1;">
      <div class="glyph">∅</div>
      <h3>No courses in this department</h3>
      <p>Try a different filter, or check back after the admin adds new courses.</p>
    </div>`;
    return;
  }

  grid.innerHTML = list.map(c => {
    const dept = STATE.departments.find(d => d.id === c.departmentId);
    const building = STATE.buildings.find(b => b.id === c.buildingId);
    const room = STATE.rooms.find(r => r.id === c.roomId);
    const existing = myReservationFor(c.id);

    let actionHtml;
    if (!existing) {
      actionHtml = `<button class="btn btn-gold btn-sm" onclick="reserveCourse(${c.id})">Reserve seat</button>`;
    } else if (existing.status === "pending") {
      actionHtml = statusStamp("pending");
    } else if (existing.status === "accepted") {
      actionHtml = statusStamp("accepted");
    } else {
      actionHtml = statusStamp("rejected");
    }

    return `
      <div class="ticket">
        <div class="ticket-body">
          <span class="dept">${escapeHtml(dept ? dept.name : "General")}</span>
          <h3>${escapeHtml(c.title)}</h3>
          <p class="desc">${escapeHtml(c.description)}</p>
          <div class="meta">
            <span><b>When:</b> ${fmtDate(c.date)}</span>
            <span><b>Where:</b> ${escapeHtml(building ? building.name : "—")} · ${escapeHtml(room ? room.name : "—")}</span>
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
    "Reserve this course?",
    `Your request for "${escapeHtml(course.title)}" will be sent to the admin and marked as pending.`,
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
  if (!STATE.reservations.length) {
    wrap.innerHTML = `<div class="empty">
      <div class="glyph">☐</div>
      <h3>Your learning list is empty</h3>
      <p>Reserve a course from the catalog to see it show up here.</p>
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
