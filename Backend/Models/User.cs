using System.Text.Json.Serialization;

namespace Backend.Models
{
    /// <summary>
    /// Model representing a User (Trainee/Admin) in the Course Reservation System.
    /// (نموذج المستخدم / المتدرب - يقوم بحجز الكورسات)
    /// </summary>
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Hashed password (BCrypt). Never expose this field in API responses.
        /// (كلمة السر مشفرة - لا يتم إرجاعها أبداً في الـ Response)
        /// </summary>
        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty;

        /// <summary>
        /// User role: "Admin" or "Student".
        /// (دور المستخدم: أدمن أو طالب)
        /// </summary>
        public string Role { get; set; } = "Student";

        /// <summary>
        /// Registration status: "Pending", "Approved", or "Rejected".
        /// (حالة طلب التسجيل)
        /// </summary>
        public string Status { get; set; } = "Pending";

        [JsonIgnore]
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
