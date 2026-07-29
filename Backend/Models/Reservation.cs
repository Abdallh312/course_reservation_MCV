using System.Text.Json.Serialization;

namespace Backend.Models
{
    /// <summary>
    /// Model representing a Reservation request made by a User for a Course.
    /// (نموذج الحجز - يربط بين المستخدم والكورس، وله حالة اعتماد من الأدمن)
    /// </summary>
    public class Reservation
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int CourseId { get; set; }

        // pending / accepted / rejected
        public string Status { get; set; } = "pending";
        public DateTime RequestDate { get; set; } = DateTime.UtcNow;

        [JsonIgnore]
        public User? User { get; set; }
        [JsonIgnore]
        public Course? Course { get; set; }
    }
}