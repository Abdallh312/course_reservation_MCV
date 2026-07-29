namespace Backend.DTOs
{
    // DTO for creating or updating a Department
    public class CreateDepartmentDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
