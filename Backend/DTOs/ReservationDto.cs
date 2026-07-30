namespace Backend.DTOs
{
    public class UserSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    // Read DTO - لصفحة My Learning List وشاشة الأدمن
    public class ReservationDto
    {
        public int Id { get; set; }
        public string Status { get; set; } = "pending";
        public DateTime RequestDate { get; set; }

        public int UserId { get; set; }
        public int CourseId { get; set; }

        public UserSummaryDto? User { get; set; }
        public CourseDto? Course { get; set; }
    }

    public class CreateReservationDto
    {
        public int UserId { get; set; }
        public int CourseId { get; set; }
        public string? Status { get; set; }
    }

    // القيم المسموحة: pending / accepted / rejected
    public class UpdateReservationStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}