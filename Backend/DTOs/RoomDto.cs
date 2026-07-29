namespace Backend.DTOs
{
    // DTO for creating or updating a Room
    public class CreateRoomDto
    {
        public string Name { get; set; } = string.Empty;
        public int BuildingId { get; set; }
        public int? Capacity { get; set; }
    }
}
