namespace Backend.DTOs
{
    // DTO for creating or updating a Building
    public class CreateBuildingDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
    }
}
