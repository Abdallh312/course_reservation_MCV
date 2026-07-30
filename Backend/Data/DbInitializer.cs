using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    /// <summary>
    /// Seeder class to initialize database schema and seed initial test data based on course_reservation_system.sql
    /// (فئة تجميع البيانات الأولية للاختبار بناءً على سكريبت SQL)
    /// </summary>
    public static class DbInitializer
    {
        public static void Seed(AppDbContext context)
        {
            // Ensure Database schema is created
            context.Database.EnsureCreated();

            // 1. Seed Departments if empty
            if (!context.Departments.Any())
            {
                var departments = new List<Department>
                {
                    new Department { Name = "Computer Science", Description = "Software Engineering, AI, and Web Development" },
                    new Department { Name = "Business Administration", Description = "Management, Finance, and Marketing" },
                    new Department { Name = "Information Technology", Description = "Networking, Cybersecurity, and IT Infrastructure" }
                };

                context.Departments.AddRange(departments);
                context.SaveChanges();
            }

            // 2. Seed Buildings if empty
            if (!context.Buildings.Any())
            {
                var mainBuilding = new Building { Name = "Main Campus Building A", Address = "123 Tech Avenue" };
                var scienceHall = new Building { Name = "Science Hall B", Address = "456 University Boulevard" };

                context.Buildings.AddRange(mainBuilding, scienceHall);
                context.SaveChanges();

                // 3. Seed Rooms if empty
                if (!context.Rooms.Any())
                {
                    var rooms = new List<Room>
                    {
                        new Room { Name = "Room 101", BuildingId = mainBuilding.Id, Capacity = 35 },
                        new Room { Name = "Lab 204 (Computer Lab)", BuildingId = mainBuilding.Id, Capacity = 25 },
                        new Room { Name = "Auditorium Hall 1", BuildingId = scienceHall.Id, Capacity = 120 }
                    };

                    context.Rooms.AddRange(rooms);
                    context.SaveChanges();
                }
            }

            // 4. Ensure Admin User exists and credentials match "admin" / "admin 123"
            var adminUser = context.Users.FirstOrDefault(u => 
                u.Role == "Admin" || u.Name.ToLower() == "admin" || u.Email.ToLower() == "admin@example.com");

            if (adminUser == null)
            {
                adminUser = new User
                {
                    Name = "admin",
                    Email = "admin@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin 123"),
                    Role = "Admin",
                    Status = "Approved"
                };
                context.Users.Add(adminUser);
            }
            else
            {
                adminUser.Name = "admin";
                adminUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin 123");
                adminUser.Role = "Admin";
                adminUser.Status = "Approved";
                context.Users.Update(adminUser);
            }

            if (!context.Users.Any(u => u.Role != "Admin"))
            {
                var defaultStudents = new List<User>
                {
                    new User
                    {
                        Name = "student",
                        Email = "student@example.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("student123"),
                        Role = "Student",
                        Status = "Approved"
                    },
                    new User
                    {
                        Name = "Karim Ahmed",
                        Email = "karim2007ahmed@gmail.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Karim123"),
                        Role = "Student",
                        Status = "Approved"
                    },
                    new User
                    {
                        Name = "Ahmed (AhmedAMD3x3)",
                        Email = "amd3x3@gmail.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Ahmed123"),
                        Role = "Student",
                        Status = "Approved"
                    }
                };

                context.Users.AddRange(defaultStudents);
            }

            context.SaveChanges();

            // 5. Seed Courses if empty or less than 2
            if (context.Courses.Count() < 2)
            {
                var depts = context.Departments.ToList();
                var bldgs = context.Buildings.ToList();
                var rms = context.Rooms.ToList();

                var csDept = depts.FirstOrDefault(d => d.Name.Contains("Computer")) ?? depts.First();
                var bizDept = depts.FirstOrDefault(d => d.Name.Contains("Business")) ?? depts.First();
                var itDept = depts.FirstOrDefault(d => d.Name.Contains("Information")) ?? depts.First();

                var bldgA = bldgs.First();
                var bldgB = bldgs.Count > 1 ? bldgs[1] : bldgs.First();

                var room1 = rms.First();
                var room2 = rms.Count > 1 ? rms[1] : rms.First();
                var room3 = rms.Count > 2 ? rms[2] : rms.First();

                var courses = new List<Course>
                {
                    new Course
                    {
                        Title = "ASP.NET Core Web API",
                        Description = "Comprehensive course on REST APIs, Entity Framework Core, and JWT authentication.",
                        DepartmentId = csDept.Id,
                        BuildingId = bldgA.Id,
                        RoomId = room1.Id,
                        Date = DateTime.UtcNow.AddDays(7)
                    },
                    new Course
                    {
                        Title = "Full Stack Web Development",
                        Description = "Master modern web development, UI design, state management, and cloud deployment.",
                        DepartmentId = csDept.Id,
                        BuildingId = bldgA.Id,
                        RoomId = room2.Id,
                        Date = DateTime.UtcNow.AddDays(14)
                    },
                    new Course
                    {
                        Title = "Database Systems & SQL Server",
                        Description = "In-depth guide to relational database design, query tuning, and index optimization.",
                        DepartmentId = itDept.Id,
                        BuildingId = bldgB.Id,
                        RoomId = room3.Id,
                        Date = DateTime.UtcNow.AddDays(21)
                    },
                    new Course
                    {
                        Title = "Business Leadership & Finance",
                        Description = "Strategic management principles, financial modeling, and team executive leadership.",
                        DepartmentId = bizDept.Id,
                        BuildingId = bldgA.Id,
                        RoomId = room1.Id,
                        Date = DateTime.UtcNow.AddDays(28)
                    }
                };

                foreach (var c in courses)
                {
                    if (!context.Courses.Any(existing => existing.Title == c.Title))
                    {
                        context.Courses.Add(c);
                    }
                }
                context.SaveChanges();
            }
        }
    }
}