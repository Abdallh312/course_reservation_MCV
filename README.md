# Course Reservation System (Full-Stack MVC / Web API)

A full-stack Course Reservation System featuring an HTML/CSS/JS frontend fully connected to a .NET 10 Web API backend with SQLite database persistence.

## Single Link Application Access

The entire project is served from a single host endpoint link:

```bash
# Navigate to the Backend folder and run
cd Backend
dotnet run --launch-profile http
```

Access the web app at: **`http://localhost:5205/`**

---

## Branches

- `main` — Primary integrated branch containing both frontend & backend.
- `frontend` — Dedicated branch for static frontend assets & client scripts.
- `backend` — Dedicated branch for .NET Web API, EF Core models, and controllers.

---

## Team & Collaborators

- **Abdallh312** (`abdallhshref4@gmail.com`)
- **Karim Ahmed** (`karim2007ahmed@gmail.com`)
- **Ahmed** (`AhmedAMD3x3` / `amd3x3@gmail.com`)

---

## Initial Test Accounts

| Role | Username / Email | Password |
|---|---|---|
| Admin | `admin` / `admin@example.com` | `admin123` |
| Student | `student` / `student@example.com` | `student123` |
| Team Member | `karim2007ahmed@gmail.com` | `Karim123` |
| Team Member | `amd3x3@gmail.com` | `Ahmed123` |

---

## Pages

- `index.html` — Site landing and sign-in entry point.
- `login.html` — Login page.
- `user.html` — Trainee dashboard: browse courses, filter by department, reserve seats, and view live status.
- `admin.html` — Admin dashboard: manage departments, buildings, rooms, courses, student accounts, and reservation approvals.
