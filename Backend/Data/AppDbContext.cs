using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // ============================================================
        // Backend Developer #1 - Tables / DbSets
        // ============================================================
        public DbSet<Department> Departments { get; set; } = null!;
        public DbSet<Building> Buildings { get; set; } = null!;
        public DbSet<Room> Rooms { get; set; } = null!;

        // ============================================================
        // Backend Developer #2 - Tables / DbSets (إضافة فقط)
        // ============================================================
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Course> Courses { get; set; } = null!;
        public DbSet<Reservation> Reservations { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Building -> Room (موجودة مسبقاً)
            modelBuilder.Entity<Building>()
                .HasMany(b => b.Rooms)
                .WithOne(r => r.Building)
                .HasForeignKey(r => r.BuildingId)
                .OnDelete(DeleteBehavior.Cascade);

            // ============================================================
            // Backend Developer #2 - Relationships
            // ============================================================
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Course>()
                .HasOne(c => c.Department)
                .WithMany()
                .HasForeignKey(c => c.DepartmentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Course>()
                .HasOne(c => c.Building)
                .WithMany()
                .HasForeignKey(c => c.BuildingId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Course>()
                .HasOne(c => c.Room)
                .WithMany()
                .HasForeignKey(c => c.RoomId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reservations)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Reservation>()
                .HasOne(r => r.Course)
                .WithMany(c => c.Reservations)
                .HasForeignKey(r => r.CourseId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}