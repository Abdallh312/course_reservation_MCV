using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DepartmentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DepartmentsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/departments - الحصول على جميع الأقسام
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Department>>> GetDepartments()
        {
            return await _context.Departments.ToListAsync();
        }

        // GET: api/departments/5 - الحصول على قسم محدد بواسطة المعرف
        [HttpGet("{id}")]
        public async Task<ActionResult<Department>> GetDepartment(int id)
        {
            var department = await _context.Departments.FindAsync(id);

            if (department == null)
            {
                return NotFound(new { message = $"Department with ID {id} not found." });
            }

            return department;
        }

        // POST: api/departments - إضافة قسم جديد
        [HttpPost]
        public async Task<ActionResult<Department>> CreateDepartment([FromBody] CreateDepartmentDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "Department name is required." });
            }

            var department = new Department
            {
                Name = dto.Name.Trim(),
                Description = dto.Description?.Trim()
            };

            _context.Departments.Add(department);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDepartment), new { id = department.Id }, department);
        }

        // PUT: api/departments/5 - تعديل بيانات قسم
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDepartment(int id, [FromBody] CreateDepartmentDto dto)
        {
            var department = await _context.Departments.FindAsync(id);

            if (department == null)
            {
                return NotFound(new { message = $"Department with ID {id} not found." });
            }

            if (!string.IsNullOrWhiteSpace(dto.Name))
            {
                department.Name = dto.Name.Trim();
            }
            department.Description = dto.Description?.Trim();

            await _context.SaveChangesAsync();

            return Ok(department);
        }

        // DELETE: api/departments/5 - حذف قسم
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            var department = await _context.Departments.FindAsync(id);

            if (department == null)
            {
                return NotFound(new { message = $"Department with ID {id} not found." });
            }

            _context.Departments.Remove(department);
            await _context.SaveChangesAsync();

            return Ok(new { ok = true, message = "Department deleted successfully." });
        }
    }
}
