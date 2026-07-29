using System.Text.Json.Serialization;

namespace Backend.Models
{
    /// <summary>
    /// Model representing a Room inside a Building.
    /// (نموذج القاعة / غرفة التدريب - يتبع مبنى معين وله سعة استيعابية)
    /// </summary>
    public class Room
    {
        // Primary Key - المعرف الأساسي للقاعة
        public int Id { get; set; }

        // Room Name - اسم القاعة (مثلاً: قاعة 101، معمل الحاسب 2)
        public string Name { get; set; } = string.Empty;

        // Foreign Key - رقم المبنى التابعة له القاعة
        public int BuildingId { get; set; }

        // Optional Capacity - السعة الاستيعابية للقاعة
        public int? Capacity { get; set; }

        // Navigation Property to Building (الربط بالمبنى)
        [JsonIgnore]
        public Building? Building { get; set; }
    }
}
