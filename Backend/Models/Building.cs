using System.Text.Json.Serialization;

namespace Backend.Models
{
    /// <summary>
    /// Model representing a Building on campus/facility.
    /// (نموذج المبنى - يحتوي على اسم المبنى وعنوانه وقائمة القاعات التابعة له)
    /// </summary>
    public class Building
    {
        // Primary Key - المعرف الأساسي للمبنى
        public int Id { get; set; }

        // Building Name - اسم المبنى (مثلاً: المبنى الرئيسي، مبنى أ)
        public string Name { get; set; } = string.Empty;

        // Optional Address - عنوان المبنى
        public string? Address { get; set; }

        // Navigation property: One Building has Many Rooms (علاقة 1-إلى-متعدد مع القاعات)
        [JsonIgnore]
        public ICollection<Room> Rooms { get; set; } = new List<Room>();
    }
}
