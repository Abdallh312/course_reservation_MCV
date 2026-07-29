using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BuildingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BuildingsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/buildings - الحصول على جميع المباني
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Building>>> GetBuildings()
        {
            return await _context.Buildings.Include(b => b.Rooms).ToListAsync();
        }

        // GET: api/buildings/5 - الحصول على مبنى محدد
        [HttpGet("{id}")]
        public async Task<ActionResult<Building>> GetBuilding(int id)
        {
            var building = await _context.Buildings.Include(b => b.Rooms).FirstOrDefaultAsync(b => b.Id == id);

            if (building == null)
            {
                return NotFound(new { message = $"Building with ID {id} not found." });
            }

            return building;
        }

        // POST: api/buildings - إضافة مبنى جديد
        [HttpPost]
        public async Task<ActionResult<Building>> CreateBuilding([FromBody] CreateBuildingDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "Building name is required." });
            }

            var building = new Building
            {
                Name = dto.Name.Trim(),
                Address = dto.Address?.Trim()
            };

            _context.Buildings.Add(building);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBuilding), new { id = building.Id }, building);
        }

        // PUT: api/buildings/5 - تعديل مبنى
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBuilding(int id, [FromBody] CreateBuildingDto dto)
        {
            var building = await _context.Buildings.FindAsync(id);

            if (building == null)
            {
                return NotFound(new { message = $"Building with ID {id} not found." });
            }

            if (!string.IsNullOrWhiteSpace(dto.Name))
            {
                building.Name = dto.Name.Trim();
            }
            building.Address = dto.Address?.Trim();

            await _context.SaveChangesAsync();

            return Ok(building);
        }

        // DELETE: api/buildings/5 - حذف مبنى
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBuilding(int id)
        {
            var building = await _context.Buildings.FindAsync(id);

            if (building == null)
            {
                return NotFound(new { message = $"Building with ID {id} not found." });
            }

            _context.Buildings.Remove(building);
            await _context.SaveChangesAsync();

            return Ok(new { ok = true, message = "Building deleted successfully." });
        }
    }
}
