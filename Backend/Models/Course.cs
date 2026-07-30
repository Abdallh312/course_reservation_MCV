using System.Text.Json.Serialization;

namespace Backend.Models
{
    /// <summary>
    /// Model representing a Course offered inside a specific Room/Building, run by a Department.
    /// (نموذج الكورس - يتبع قسم معين، ويقام في قاعة داخل مبنى معين، وله تاريخ محدد)
    /// </summary>
    public class Course
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }

        public int DepartmentId { get; set; }
        public int BuildingId { get; set; }
        public int RoomId { get; set; }
        public DateTime Date { get; set; }
        public int Capacity { get; set; } = 30;

        [JsonIgnore]
        public Department? Department { get; set; }
        [JsonIgnore]
        public Building? Building { get; set; }
        [JsonIgnore]
        public Room? Room { get; set; }

        [JsonIgnore]
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}