namespace Backend.Models
{
    /// <summary>
    /// Model representing a Department in the Course Reservation System.
    /// (نموذج القسم - يحتوي على اسم القسم ووصفه)
    /// </summary>
    public class Department
    {
        // Primary Key - المعرف الأساسي للقسم (تلقائي الزيادة في الداتابيز)
        public int Id { get; set; }

        // Department Name - اسم القسم (مثلاً: الحاسب الآلي، إدارة الأعمال)
        public string Name { get; set; } = string.Empty;

        // Optional Description - وصف القسم
        public string? Description { get; set; }
    }
}
