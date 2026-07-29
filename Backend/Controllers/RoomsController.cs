using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoomsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/rooms - الحصول على جميع القاعات
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Room>>> GetRooms()
        {
            return await _context.Rooms.ToListAsync();
        }

        // GET: api/rooms/building/3 - الحصول على جميع القاعات التابعة لمبنى معين
        [HttpGet("building/{buildingId}")]
        public async Task<ActionResult<IEnumerable<Room>>> GetRoomsByBuilding(int buildingId)
        {
            return await _context.Rooms
                .Where(r => r.BuildingId == buildingId)
                .ToListAsync();
        }

        // GET: api/rooms/5 - الحصول على قاعة واحدة بواسطة ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Room>> GetRoom(int id)
        {
            var room = await _context.Rooms.FindAsync(id);

            if (room == null)
            {
                return NotFound(new { message = $"Room with ID {id} not found." });
            }

            return room;
        }

        // POST: api/rooms - إضافة قاعة جديدة
        [HttpPost]
        public async Task<ActionResult<Room>> CreateRoom([FromBody] CreateRoomDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "Room name is required." });
            }

            // التحقق من وجود المبنى قبل إضافة القاعة له
            var buildingExists = await _context.Buildings.AnyAsync(b => b.Id == dto.BuildingId);
            if (!buildingExists)
            {
                return BadRequest(new { message = $"Building with ID {dto.BuildingId} does not exist." });
            }

            var room = new Room
            {
                Name = dto.Name.Trim(),
                BuildingId = dto.BuildingId,
                Capacity = dto.Capacity
            };

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRoom), new { id = room.Id }, room);
        }

        // PUT: api/rooms/5 - تعديل بيانات قاعة
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoom(int id, [FromBody] CreateRoomDto dto)
        {
            var room = await _context.Rooms.FindAsync(id);

            if (room == null)
            {
                return NotFound(new { message = $"Room with ID {id} not found." });
            }

            if (dto.BuildingId > 0)
            {
                var buildingExists = await _context.Buildings.AnyAsync(b => b.Id == dto.BuildingId);
                if (!buildingExists)
                {
                    return BadRequest(new { message = $"Building with ID {dto.BuildingId} does not exist." });
                }
                room.BuildingId = dto.BuildingId;
            }

            if (!string.IsNullOrWhiteSpace(dto.Name))
            {
                room.Name = dto.Name.Trim();
            }
            room.Capacity = dto.Capacity;

            await _context.SaveChangesAsync();

            return Ok(room);
        }

        // DELETE: api/rooms/5 - حذف قاعة
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            var room = await _context.Rooms.FindAsync(id);

            if (room == null)
            {
                return NotFound(new { message = $"Room with ID {id} not found." });
            }

            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();

            return Ok(new { ok = true, message = "Room deleted successfully." });
        }
    }
}
