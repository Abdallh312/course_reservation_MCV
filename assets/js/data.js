/* ============================================================
   data.js — local persistence layer. This is the only "database"
   the app has: everything is stored in the browser's localStorage.
   There is no backend — the whole site works standalone, offline,
   opened straight from a file or any static host.
   ============================================================ */

const DB_KEY = "crs_db_v2";

const SEED = {
  departments: [
    { id: 1, name: "Computer Science", description: "Software Engineering, AI, and Web Development" },
    { id: 2, name: "Business Administration", description: "Management, Finance, and Marketing" },
    { id: 3, name: "Information Technology", description: "Networking, Cybersecurity, and IT Infrastructure" }
  ],
  buildings: [
    { id: 1, name: "Main Campus Building A", address: "123 Tech Avenue" },
    { id: 2, name: "Science Hall B", address: "456 University Boulevard" }
  ],
  rooms: [
    { id: 1, name: "Room 101", buildingId: 1, capacity: 35 },
    { id: 2, name: "Lab 204 (Computer Lab)", buildingId: 1, capacity: 25 },
    { id: 3, name: "Auditorium Hall 1", buildingId: 2, capacity: 120 }
  ],
  courses: [
    {
      id: 1,
      title: "ASP.NET Core Web API",
      description: "Comprehensive course on REST APIs, Entity Framework Core, and JWT authentication.",
      departmentId: 1,
      buildingId: 1,
      roomId: 1,
      date: new Date(Date.now() + 7 * 86400000).toISOString()
    },
    {
      id: 2,
      title: "Full Stack Web Development",
      description: "Master modern web development, UI design, state management, and cloud deployment.",
      departmentId: 1,
      buildingId: 1,
      roomId: 2,
      date: new Date(Date.now() + 14 * 86400000).toISOString()
    },
    {
      id: 3,
      title: "Database Systems & SQL Server",
      description: "In-depth guide to relational database design, query tuning, and index optimization.",
      departmentId: 3,
      buildingId: 2,
      roomId: 3,
      date: new Date(Date.now() + 21 * 86400000).toISOString()
    },
    {
      id: 4,
      title: "Business Leadership & Finance",
      description: "Strategic management principles, financial modeling, and team executive leadership.",
      departmentId: 2,
      buildingId: 1,
      roomId: 1,
      date: new Date(Date.now() + 28 * 86400000).toISOString()
    }
  ],
  users: [
    { id: 1, name: "student", email: "student@example.com", password: "student123", role: "Student", status: "Approved" },
    { id: 2, name: "Karim Ahmed", email: "karim2007ahmed@gmail.com", password: "Karim123", role: "Student", status: "Approved" },
    { id: 3, name: "Ahmed (AhmedAMD3x3)", email: "amd3x3@gmail.com", password: "Ahmed123", role: "Student", status: "Approved" }
  ],
  admins: [
    { id: 1, name: "admin", username: "admin", email: "admin@example.com", password: "admin 123", role: "Admin" }
  ],
  accountRequests: [],
  reservations: [],
  _nextId: { departments: 4, buildings: 3, rooms: 4, courses: 5, users: 4, reservations: 1, accountRequests: 1 }
};

// In-memory fallback used only if localStorage is unavailable/blocked
// (some browsers restrict it for file:// pages or private-browsing modes).
let _memoryDB = null;

function cloneSeed() {
  // JSON clone instead of structuredClone for wider browser/webview support.
  return JSON.parse(JSON.stringify(SEED));
}

function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      const fresh = cloneSeed();
      localStorage.setItem(DB_KEY, JSON.stringify(fresh));
      return fresh;
    }
    const db = JSON.parse(raw);
    let changed = false;

    if (!db.admins || !db.admins.length) {
      db.admins = cloneSeed().admins;
      changed = true;
    }
    if (!db.departments || !db.departments.length) {
      db.departments = cloneSeed().departments;
      changed = true;
    }
    if (!db.buildings || !db.buildings.length) {
      db.buildings = cloneSeed().buildings;
      changed = true;
    }
    if (!db.rooms || !db.rooms.length) {
      db.rooms = cloneSeed().rooms;
      changed = true;
    }
    if (!db.courses || !db.courses.length) {
      db.courses = cloneSeed().courses;
      changed = true;
    }
    if (!db.users || !db.users.length) {
      db.users = cloneSeed().users;
      changed = true;
    }
    if (!db._nextId) {
      db._nextId = cloneSeed()._nextId;
      changed = true;
    }

    const demoStudent = db.users && db.users.find(u => u.id === 1);
    if (demoStudent && !demoStudent.password && !demoStudent.email) {
      demoStudent.name = "student";
      demoStudent.email = "student@example.com";
      demoStudent.password = "student123";
      demoStudent.role = "Student";
      demoStudent.status = "Approved";
      changed = true;
    }

    if (changed) {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    }
    return db;
  } catch (e) {
    if (!_memoryDB) _memoryDB = cloneSeed();
    return _memoryDB;
  }
}

function saveDB(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    _memoryDB = db;
  }
}

function nextId(db, table) {
  const id = db._nextId[table];
  db._nextId[table] = id + 1;
  return id;
}

function resetDB() {
  localStorage.setItem(DB_KEY, JSON.stringify(SEED));
}

// Currently "logged in" user — set by login.js after a successful sign-in
// on login.html. Falls back to demo user id 1 if nothing is stored yet
// (e.g. localStorage blocked, or the page was opened directly).
function getCurrentUserId() {
  try {
    const stored = localStorage.getItem("crs_current_user_id");
    return stored ? Number(stored) : 1;
  } catch (e) {
    return 1;
  }
}
const CURRENT_USER_ID = getCurrentUserId();
