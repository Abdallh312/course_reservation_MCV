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

            // 5. Seed Courses if empty
            if (!context.Courses.Any())
            {
                var firstDepartment = context.Departments.First();
                var firstBuilding = context.Buildings.First();
                var firstRoom = context.Rooms.First();

                var courses = new List<Course>
                {
                    new Course
                    {
                        Title = "ASP.NET Core Web API",
                        Description = "Comprehensive course on REST APIs",
                        DepartmentId = firstDepartment.Id,
                        BuildingId = firstBuilding.Id,
                        RoomId = firstRoom.Id,
                        Date = DateTime.UtcNow.AddDays(7)
                    }
                };

                context.Courses.AddRange(courses);
                context.SaveChanges();
            }
        }
    }
}