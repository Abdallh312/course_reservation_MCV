# 🗄️ SQL Server Setup & Connection Guide

This guide explains how to connect the **Course Reservation System** website backend to **Microsoft SQL Server** and execute the database script.

---

## 🔗 Step 1: Connecting the Backend to Microsoft SQL Server

The ASP.NET Core backend dynamically reads its database provider configuration from `Backend/appsettings.json`.

1. Open [Backend/appsettings.json](file:///d:/course-reservation-frontend_+backend/course-reservation-frontend_+backend/Backend/appsettings.json).
2. Set `"DatabaseProvider"` to `"SqlServer"`.
3. Update `"SqlServerConnection"` to match your SQL Server instance:

```json
{
  "DatabaseProvider": "SqlServer",
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=app.db",
    "SqlServerConnection": "Server=(localdb)\\mssqllocaldb;Database=course_reservation_system;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
  }
}
```

### Connection String Examples:

- **LocalDB (Visual Studio Default)**:
  `"Server=(localdb)\\mssqllocaldb;Database=course_reservation_system;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"`

- **SQL Server Express**:
  `"Server=localhost\\SQLEXPRESS;Database=course_reservation_system;Trusted_Connection=True;TrustServerCertificate=True"`

- **SQL Server with SQL Authentication (Username & Password)**:
  `"Server=localhost,1433;Database=course_reservation_system;User Id=sa;Password=YourPassword123!;TrustServerCertificate=True"`

---

## 🛠️ Step 2: How to Create & Setup the Database in SQL Server

You can set up the database using **Method A (SQL Server Management Studio / Azure Data Studio)** or **Method B (Automatic via ASP.NET Core)**.

### Method A: Execute the SQL Script in SQL Server Management Studio (SSMS) or Azure Data Studio

1. Open **SQL Server Management Studio (SSMS)** or **Azure Data Studio**.
2. Connect to your local or remote SQL Server instance.
3. Open the file [`course_reservation_system.sql`](file:///C:/Users/acer/Desktop/course_reservation_system.sql) from your Desktop.
4. Click **Execute** (or press `F5`).
5. The script will automatically:
   - Create the `course_reservation_system` database.
   - Create all 6 tables (`Departments`, `Buildings`, `Rooms`, `Users`, `Courses`, `Reservations`) with appropriate primary keys, foreign keys, identity columns, and constraints.

---

### Method B: Automatic Table Creation & Data Seeding via Web API

When you run the backend server, Entity Framework Core automatically creates the database and seeds default accounts (`admin@example.com` and `student@example.com`).

1. Open terminal in the `Backend` directory:
   ```bash
   cd Backend
   dotnet run
   ```
2. Open your web browser and navigate to `http://localhost:5000` (or `https://localhost:7071/swagger` for API docs).

---

## 🔑 Default Credentials (Seeded Data)

- **Admin Account**: `admin@example.com` | Password: `admin123`
- **Student Account**: `student@example.com` | Password: `student123`
