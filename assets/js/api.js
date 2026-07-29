/* ============================================================
   api.js — Backend API Client (Connected to .NET Web API)
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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: Request failed`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.message) {
        errorMessage = errJson.message;
      }
    } catch (_) {}
    throw new Error(errorMessage);
  }

  if (response.status === 204) return { ok: true };

  try {
    return await response.json();
  } catch (_) {
    return { ok: true };
  }
}

const API = {
  // ---------- Authentication ----------
  async login(email, password) {
    const res = await request("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (res.token) {
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
  async getUserReservations(userId) {
    return await request(`/users/${userId}/reservations`);
  },

  // ---------- Users / Student accounts ----------
  async getUsers() {
    return await request("/users");
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
    return users.filter(u => u.role === "Admin" || u.Role === "Admin");
  },

  // ---------- Account Requests ----------
  async getAccountRequests(status) {
    const pendingUsers = await request("/users/pending");
    return pendingUsers.map(u => ({
      id: u.id || u.Id,
      name: u.name || u.Name,
      email: u.email || u.Email,
      note: u.note || "",
      status: "pending",
      requestDate: new Date().toISOString()
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
