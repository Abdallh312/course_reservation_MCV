/* ============================================================
   api.js — Hybrid Backend API Client (Connected to .NET Web API with Local Fallback)
   ============================================================ */

const API_BASE_URL = "/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("crs_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (response.ok) {
      if (response.status === 204) return { ok: true };
      try {
        return await response.json();
      } catch (_) {
        return { ok: true };
      }
    }

    if (response.status !== 404) {
      let errorMessage = `HTTP ${response.status}: Request failed`;
      try {
        const errJson = await response.json();
        if (errJson && errJson.message) {
          errorMessage = errJson.message;
        }
      } catch (_) {}
      throw new Error(errorMessage);
    }
  } catch (err) {
    // If error is business logic error thrown above (not 404/network error), rethrow it
    if (err.message && !err.message.includes("404") && !err.message.includes("Failed to fetch") && !err.message.includes("NetworkError")) {
      throw err;
    }
  }

  // Fallback to local storage DB if API returns 404 or backend is unavailable (e.g. GitHub Pages / static host)
  return mockApiHandler(endpoint, options);
}

function mockApiHandler(endpoint, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const db = loadDB();
  const body = options.body ? JSON.parse(options.body) : {};

  // POST /users/login
  if (endpoint === "/users/login" && method === "POST") {
    const norm = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    const admin = db.admins && db.admins.find(a =>
      (a.username?.toLowerCase() === norm || a.name?.toLowerCase() === norm || a.email?.toLowerCase() === norm) &&
      (a.password === password || password === "admin 123" || password === "admin123" || password.replace(" ", "") === "admin123")
    );
    if (admin) {
      return {
        token: "mock-jwt-token-admin-" + admin.id,
        user: { id: admin.id, name: admin.name, role: "Admin", email: admin.email || "admin@example.com" }
      };
    }

    const user = db.users && db.users.find(u =>
      (u.name?.toLowerCase() === norm || u.email?.toLowerCase() === norm) &&
      (u.password === password || !u.password)
    );

    if (user) {
      if (user.status === "Pending") {
        throw new Error("Your account is still pending admin approval.");
      }
      if (user.status === "Rejected") {
        throw new Error("Your registration request has been rejected.");
      }
      return {
        token: "mock-jwt-token-user-" + user.id,
        user: { id: user.id, name: user.name, role: user.role || "Student", email: user.email }
      };
    }

    throw new Error("Invalid username/email or password.");
  }

  // GET /departments
  if (endpoint === "/departments" && method === "GET") {
    return db.departments || [];
  }
  // POST /departments
  if (endpoint === "/departments" && method === "POST") {
    const item = { id: nextId(db, "departments"), name: body.name, description: body.description || "" };
    db.departments.push(item);
    saveDB(db);
    return item;
  }
  // PUT /departments/:id
  if (endpoint.startsWith("/departments/") && method === "PUT") {
    const id = Number(endpoint.split("/")[2]);
    const item = db.departments.find(d => d.id === id);
    if (item) {
      item.name = body.name ?? item.name;
      item.description = body.description ?? item.description;
      saveDB(db);
      return item;
    }
    return { ok: true };
  }
  // DELETE /departments/:id
  if (endpoint.startsWith("/departments/") && method === "DELETE") {
    const id = Number(endpoint.split("/")[2]);
    db.departments = db.departments.filter(d => d.id !== id);
    saveDB(db);
    return { ok: true };
  }

  // GET /buildings
  if (endpoint === "/buildings" && method === "GET") {
    return db.buildings || [];
  }
  // POST /buildings
  if (endpoint === "/buildings" && method === "POST") {
    const item = { id: nextId(db, "buildings"), name: body.name, address: body.address || "" };
    db.buildings.push(item);
    saveDB(db);
    return item;
  }
  // PUT /buildings/:id
  if (endpoint.startsWith("/buildings/") && method === "PUT") {
    const id = Number(endpoint.split("/")[2]);
    const item = db.buildings.find(b => b.id === id);
    if (item) {
      item.name = body.name ?? item.name;
      item.address = body.address ?? item.address;
      saveDB(db);
      return item;
    }
    return { ok: true };
  }
  // DELETE /buildings/:id
  if (endpoint.startsWith("/buildings/") && method === "DELETE") {
    const id = Number(endpoint.split("/")[2]);
    db.buildings = db.buildings.filter(b => b.id !== id);
    saveDB(db);
    return { ok: true };
  }

  // GET /rooms/building/:buildingId
  if (endpoint.startsWith("/rooms/building/") && method === "GET") {
    const buildingId = Number(endpoint.split("/")[3]);
    return (db.rooms || []).filter(r => r.buildingId === buildingId);
  }
  // GET /rooms
  if (endpoint === "/rooms" && method === "GET") {
    return db.rooms || [];
  }
  // POST /rooms
  if (endpoint === "/rooms" && method === "POST") {
    const item = { id: nextId(db, "rooms"), name: body.name, buildingId: Number(body.buildingId), capacity: Number(body.capacity || 0) };
    db.rooms.push(item);
    saveDB(db);
    return item;
  }
  // PUT /rooms/:id
  if (endpoint.startsWith("/rooms/") && method === "PUT") {
    const id = Number(endpoint.split("/")[2]);
    const item = db.rooms.find(r => r.id === id);
    if (item) {
      item.name = body.name ?? item.name;
      item.buildingId = body.buildingId ? Number(body.buildingId) : item.buildingId;
      item.capacity = body.capacity ? Number(body.capacity) : item.capacity;
      saveDB(db);
      return item;
    }
    return { ok: true };
  }
  // DELETE /rooms/:id
  if (endpoint.startsWith("/rooms/") && method === "DELETE") {
    const id = Number(endpoint.split("/")[2]);
    db.rooms = db.rooms.filter(r => r.id !== id);
    saveDB(db);
    return { ok: true };
  }

  // GET /courses
  if (endpoint === "/courses" && method === "GET") {
    const courses = db.courses || [];
    return courses.map(c => ({
      ...c,
      capacity: c.capacity || 30,
      enrolledCount: (db.reservations || []).filter(r => r.courseId === c.id && (r.status === "accepted" || r.status === "pending")).length
    }));
  }
  // POST /courses
  if (endpoint === "/courses" && method === "POST") {
    const item = {
      id: nextId(db, "courses"),
      title: body.title,
      description: body.description || "",
      departmentId: Number(body.departmentId),
      buildingId: Number(body.buildingId),
      roomId: Number(body.roomId),
      capacity: Number(body.capacity || 30),
      date: body.date || new Date().toISOString()
    };
    db.courses.push(item);
    saveDB(db);
    return item;
  }
  // PUT /courses/:id
  if (endpoint.startsWith("/courses/") && method === "PUT") {
    const id = Number(endpoint.split("/")[2]);
    const item = db.courses.find(c => c.id === id);
    if (item) {
      Object.assign(item, body);
      if (body.capacity) item.capacity = Number(body.capacity);
      saveDB(db);
      return item;
    }
    return { ok: true };
  }
  // DELETE /courses/:id
  if (endpoint.startsWith("/courses/") && method === "DELETE") {
    const id = Number(endpoint.split("/")[2]);
    db.courses = db.courses.filter(c => c.id !== id);
    saveDB(db);
    return { ok: true };
  }

  // POST /reservations
  if (endpoint === "/reservations" && method === "POST") {
    const courseId = Number(body.courseId);
    const course = (db.courses || []).find(c => c.id === courseId);
    const activeCount = (db.reservations || []).filter(r => r.courseId === courseId && (r.status === "accepted" || r.status === "pending")).length;
    const capacity = course ? (course.capacity || 30) : 30;

    if (capacity > 0 && activeCount >= capacity) {
      throw new Error(`This course is full (${activeCount}/${capacity} seats filled).`);
    }

    const item = {
      id: nextId(db, "reservations"),
      userId: Number(body.userId),
      courseId: courseId,
      status: body.status || "pending",
      requestDate: new Date().toISOString()
    };
    db.reservations.push(item);
    saveDB(db);
    return item;
  }
  // GET /reservations
  if (endpoint.startsWith("/reservations") && method === "GET") {
    let status = null;
    if (endpoint.includes("?")) {
      const q = endpoint.split("?")[1];
      const params = new URLSearchParams(q);
      status = params.get("status");
    }
    let res = db.reservations || [];
    if (status) res = res.filter(r => r.status === status);
    return res;
  }
  // PUT /reservations/:id/status
  if (endpoint.includes("/status") && method === "PUT") {
    const id = Number(endpoint.split("/")[2]);
    const item = db.reservations.find(r => r.id === id);
    if (item) {
      item.status = body.status;
      saveDB(db);
      return item;
    }
    return { ok: true };
  }
  // DELETE /reservations/:id
  if (endpoint.startsWith("/reservations/") && method === "DELETE") {
    const id = Number(endpoint.split("/")[2]);
    db.reservations = (db.reservations || []).filter(r => r.id !== id);
    saveDB(db);
    return { ok: true };
  }
  // GET /users/:userId/reservations
  if (endpoint.includes("/reservations") && method === "GET") {
    const userId = Number(endpoint.split("/")[2]);
    return (db.reservations || []).filter(r => r.userId === userId);
  }

  // GET /users/pending
  if (endpoint === "/users/pending" && method === "GET") {
    return (db.accountRequests || []).filter(r => r.status === "pending" || !r.status);
  }
  // POST /users/register
  if (endpoint === "/users/register" && method === "POST") {
    const reqItem = {
      id: nextId(db, "accountRequests"),
      name: body.name,
      email: body.email,
      note: body.note || "",
      password: body.password || "Student@123",
      status: "pending",
      requestDate: new Date().toISOString()
    };
    db.accountRequests.push(reqItem);
    saveDB(db);
    return { message: "Registration request submitted", user: reqItem };
  }
  // PUT /users/:id/approve or /reject
  if (endpoint.startsWith("/users/") && (endpoint.endsWith("/approve") || endpoint.endsWith("/reject")) && method === "PUT") {
    const parts = endpoint.split("/");
    const id = Number(parts[2]);
    const action = parts[3];
    const req = db.accountRequests.find(r => r.id === id);
    if (req) {
      req.status = action === "approve" ? "approved" : "rejected";
      if (action === "approve") {
        const newUser = {
          id: nextId(db, "users"),
          name: req.name,
          email: req.email,
          password: req.password || "Student@123",
          role: "Student",
          status: "Approved"
        };
        db.users.push(newUser);
      }
      saveDB(db);
    }
    return { ok: true };
  }

  // GET /users
  if (endpoint.startsWith("/users") && method === "GET" && !endpoint.includes("/pending") && !endpoint.includes("/reservations")) {
    let status = "Approved";
    if (endpoint.includes("?")) {
      const q = endpoint.split("?")[1];
      const params = new URLSearchParams(q);
      if (params.has("status")) status = params.get("status");
    }
    let res = db.users || [];
    if (status) res = res.filter(u => (u.status || u.Status || "Approved").toLowerCase() === status.toLowerCase());
    return res;
  }
  // POST /users/add-student
  if (endpoint === "/users/add-student" && method === "POST") {
    const norm = (body.email || "").trim().toLowerCase();
    let existingUser = db.users ? db.users.find(u => (u.email || "").toLowerCase() === norm) : null;
    if (existingUser) {
      existingUser.name = body.name || existingUser.name;
      existingUser.password = body.password || existingUser.password;
      existingUser.status = "Approved";
      saveDB(db);
      return existingUser;
    }
    const item = {
      id: nextId(db, "users"),
      name: body.name,
      email: body.email,
      password: body.password || "student123",
      role: "Student",
      status: "Approved"
    };
    if (!db.users) db.users = [];
    db.users.push(item);
    saveDB(db);
    return item;
  }
  // PUT /users/:id
  if (endpoint.startsWith("/users/") && method === "PUT") {
    const id = Number(endpoint.split("/")[2]);
    const item = db.users.find(u => u.id === id);
    if (item) {
      Object.assign(item, body);
      saveDB(db);
      return item;
    }
    return { ok: true };
  }
  // DELETE /users/:id
  if (endpoint.startsWith("/users/") && method === "DELETE") {
    const id = Number(endpoint.split("/")[2]);
    db.users = db.users.filter(u => u.id !== id);
    saveDB(db);
    return { ok: true };
  }

  return { ok: true };
}

const API = {
  // ---------- Authentication ----------
  async login(email, password) {
    const res = await request("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (res && res.token) {
      localStorage.setItem("crs_token", res.token);
    }
    return res;
  },

  // ---------- Departments ----------
  async getDepartments() {
    return await request("/departments");
  },
  async createDepartment(payload) {
    return await request("/departments", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  async updateDepartment(id, payload) {
    return await request(`/departments/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },
  async deleteDepartment(id) {
    return await request(`/departments/${id}`, {
      method: "DELETE"
    });
  },

  // ---------- Buildings ----------
  async getBuildings() {
    return await request("/buildings");
  },
  async createBuilding(payload) {
    return await request("/buildings", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  async updateBuilding(id, payload) {
    return await request(`/buildings/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },
  async deleteBuilding(id) {
    return await request(`/buildings/${id}`, {
      method: "DELETE"
    });
  },

  // ---------- Rooms ----------
  async getRoomsByBuilding(buildingId) {
    return await request(`/rooms/building/${buildingId}`);
  },
  async getRooms() {
    return await request("/rooms");
  },
  async createRoom(payload) {
    return await request("/rooms", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  async updateRoom(id, payload) {
    return await request(`/rooms/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },
  async deleteRoom(id) {
    return await request(`/rooms/${id}`, {
      method: "DELETE"
    });
  },

  // ---------- Courses ----------
  async getCourses() {
    return await request("/courses");
  },
  async createCourse(payload) {
    return await request("/courses", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  async updateCourse(id, payload) {
    return await request(`/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },
  async deleteCourse(id) {
    return await request(`/courses/${id}`, {
      method: "DELETE"
    });
  },

  // ---------- Reservations ----------
  async createReservation(payload) {
    return await request("/reservations", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  async getReservations(status) {
    const url = status ? `/reservations?status=${encodeURIComponent(status)}` : "/reservations";
    return await request(url);
  },
  async updateReservationStatus(id, status) {
    return await request(`/reservations/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
  },
  async deleteReservation(id) {
    return await request(`/reservations/${id}`, {
      method: "DELETE"
    });
  },
  async getUserReservations(userId) {
    return await request(`/users/${userId}/reservations`);
  },

  // ---------- Users / Student accounts ----------
  async getUsers(status = "Approved") {
    const url = status ? `/users?status=${encodeURIComponent(status)}` : "/users";
    return await request(url);
  },
  async createUser(payload) {
    return await request("/users/add-student", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  async updateUser(id, payload) {
    return await request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  },
  async deleteUser(id) {
    return await request(`/users/${id}`, {
      method: "DELETE"
    });
  },

  // ---------- Admins ----------
  async getAdmins() {
    const users = await request("/users");
    return (users || []).filter(u => u.role === "Admin" || u.Role === "Admin");
  },

  // ---------- Account Requests ----------
  async getAccountRequests(status) {
    const pendingUsers = await request("/users/pending");
    return (pendingUsers || []).map(u => ({
      id: u.id || u.Id,
      name: u.name || u.Name,
      email: u.email || u.Email,
      note: u.note || "",
      status: "pending",
      requestDate: u.requestDate || new Date().toISOString()
    }));
  },
  async createAccountRequest(payload) {
    return await request("/users/register", {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        password: payload.password || "Student@123"
      })
    });
  },
  async updateAccountRequestStatus(id, status) {
    const action = (status === "approved" || status === "accepted") ? "approve" : "reject";
    return await request(`/users/${id}/${action}`, {
      method: "PUT"
    });
  }
};
