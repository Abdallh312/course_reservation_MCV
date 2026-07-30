# 🗄️ SQL Server Setup & Migration Guide

This guide explains how to connect your Course Reservation System backend to Microsoft SQL Server instead of SQLite.

---

## 🛠️ Step 1: Configure `appsettings.json`

Open `Backend/appsettings.json` and update `DatabaseProvider` to `"SqlServer"`:

```json
{
  "DatabaseProvider": "SqlServer",
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=app.db",
    "SqlServerConnection": "Server=YOUR_SERVER_NAME;Database=CourseReservationDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
  }
}
```

### Connection String Examples for Common Environments:

1. **SQL Server LocalDB** (Default in Visual Studio):
   ```json
   "SqlServerConnection": "Server=(localdb)\\mssqllocaldb;Database=CourseReservationDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
   ```

2. **SQL Server Express** (Local Instance):
   ```json
   "SqlServerConnection": "Server=localhost\\SQLEXPRESS;Database=CourseReservationDb;Trusted_Connection=True;TrustServerCertificate=True"
   ```

3. **SQL Server with Username & Password**:
   ```json
   "SqlServerConnection": "Server=localhost,1433;Database=CourseReservationDb;User Id=sa;Password=YourPassword123!;TrustServerCertificate=True"
   ```

---

## 🚀 Step 2: Apply Migrations / Initialize Database

Open your terminal in the `Backend/` directory and run:

```bash
dotnet ef database update
```

> **Note**: If `dotnet ef` is not installed on your system, install it globally using:
> `dotnet tool install --global dotnet-ef`

---

## 🔄 Step 3: Run the Application

Start your backend server:

```bash
dotnet run
```

When the application starts, `DbInitializer.cs` will automatically create the database tables and seed initial demo accounts (`admin` / `admin123` and `student@example.com` / `student123`).
