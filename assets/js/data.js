/* ============================================================
   data.js — local persistence layer. This is the only "database"
   the app has: everything is stored in the browser's localStorage.
   There is no backend — the whole site works standalone, offline,
   opened straight from a file or any static host.
   ============================================================ */

const DB_KEY = "crs_db_v2";

const SEED = {
  departments: [],
  buildings: [],
  rooms: [],
  courses: [],
  // Single generic demo user, with a demo password just like the admin account
  // below (username "admin" / password "admin123"). "password" is stored only
  // for this local mock; a real backend should hash it.
  users: [
    { id: 1, name: "student", email: "student@example.com", password: "student123" }
  ],
  // Staff / admin accounts, checked by login.js. Demo credentials:
  // username "admin", password "admin123".
  admins: [
    { id: 1, name: "Admin", username: "admin", password: "admin123" }
  ],
  // Requests submitted from the "Request account" button on the landing page.
  // An admin reviews these in Admin → Accounts and turns approved ones into
  // real student credentials via API.createUser.
  accountRequests: [],
  reservations: [],
  _nextId: { departments: 1, buildings: 1, rooms: 1, courses: 1, users: 2, reservations: 1, accountRequests: 1 }
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
    // Migration: older saved DBs (from before staff accounts existed) won't
    // have an "admins" table yet — add the default one so login still works.
    if (!db.admins) {
      db.admins = cloneSeed().admins;
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    }
    // Migration: older saved DBs may still have the original blank-password
    // demo student (id 1, no email/password) — upgrade it to the new demo
    // credentials so the "student / student123" login still works.
    const demoStudent = db.users && db.users.find(u => u.id === 1);
    if (demoStudent && !demoStudent.password && !demoStudent.email) {
      demoStudent.name = "student";
      demoStudent.email = "student@example.com";
      demoStudent.password = "student123";
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    }
    return db;
  } catch (e) {
    // localStorage not available/blocked — keep data in memory for this tab only
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
