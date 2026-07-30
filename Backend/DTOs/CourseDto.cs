namespace Backend.DTOs
{
    // بيانات مختصرة عن القسم/المبنى/القاعة تُضمَّن داخل CourseDto
    public class DepartmentSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class BuildingSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
    }

    public class RoomSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int? Capacity { get; set; }
    }

    // Read DTO - يستخدم في الـ GET (يحتوي على تفاصيل القسم/المبنى/القاعة)
    public class CourseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime Date { get; set; }
        public int Capacity { get; set; } = 30;
        public int EnrolledCount { get; set; }

        public int DepartmentId { get; set; }
        public int BuildingId { get; set; }
        public int RoomId { get; set; }

        public DepartmentSummaryDto? Department { get; set; }
        public BuildingSummaryDto? Building { get; set; }
        public RoomSummaryDto? Room { get; set; }
    }

    public class CreateCourseDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DepartmentId { get; set; }
        public int BuildingId { get; set; }
        public int RoomId { get; set; }
        public DateTime Date { get; set; }
        public int Capacity { get; set; } = 30;
    }

    public class UpdateCourseDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DepartmentId { get; set; }
        public int BuildingId { get; set; }
        public int RoomId { get; set; }
        public DateTime Date { get; set; }
        public int Capacity { get; set; } = 30;
    }
}