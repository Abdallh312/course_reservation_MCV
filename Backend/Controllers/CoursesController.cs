using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CoursesController(AppDbContext context)
        {
            _context = context;
        }

        private static CourseDto MapToDto(Course course)
        {
            return new CourseDto
            {
                Id = course.Id,
                Title = course.Title,
                Description = course.Description,
                Date = course.Date,
                DepartmentId = course.DepartmentId,
                BuildingId = course.BuildingId,
                RoomId = course.RoomId,
                Department = course.Department == null ? null : new DepartmentSummaryDto
                {
                    Id = course.Department.Id,
                    Name = course.Department.Name,
                    Description = course.Department.Description
                },
                Building = course.Building == null ? null : new BuildingSummaryDto
                {
                    Id = course.Building.Id,
                    Name = course.Building.Name,
                    Address = course.Building.Address
                },
                Room = course.Room == null ? null : new RoomSummaryDto
                {
                    Id = course.Room.Id,
                    Name = course.Room.Name,
                    Capacity = course.Room.Capacity
                }
            };
        }

        // GET: api/courses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CourseDto>>> GetCourses()
        {
            var courses = await _context.Courses
                .Include(c => c.Department)
                .Include(c => c.Building)
                .Include(c => c.Room)
                .ToListAsync();

            return courses.Select(MapToDto).ToList();
        }

        // GET: api/courses/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CourseDto>> GetCourse(int id)
        {
            var course = await _context.Courses
                .Include(c => c.Department)
                .Include(c => c.Building)
                .Include(c => c.Room)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null)
            {
                return NotFound(new { message = $"Course with ID {id} not found." });
            }

            return MapToDto(course);
        }

        // POST: api/courses
        [HttpPost]
        public async Task<ActionResult<CourseDto>> CreateCourse([FromBody] CreateCourseDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
            {
                return BadRequest(new { message = "Course title is required." });
            }

            var departmentExists = await _context.Departments.AnyAsync(d => d.Id == dto.DepartmentId);
            if (!departmentExists)
            {
                return BadRequest(new { message = $"Department with ID {dto.DepartmentId} does not exist." });
            }

            var buildingExists = await _context.Buildings.AnyAsync(b => b.Id == dto.BuildingId);
            if (!buildingExists)
            {
                return BadRequest(new { message = $"Building with ID {dto.BuildingId} does not exist." });
            }

            var roomExists = await _context.Rooms.AnyAsync(r => r.Id == dto.RoomId && r.BuildingId == dto.BuildingId);
            if (!roomExists)
            {
                return BadRequest(new { message = $"Room with ID {dto.RoomId} does not exist in Building {dto.BuildingId}." });
            }

            var course = new Course
            {
                Title = dto.Title.Trim(),
                Description = dto.Description?.Trim(),
                DepartmentId = dto.DepartmentId,
                BuildingId = dto.BuildingId,
                RoomId = dto.RoomId,
                Date = dto.Date
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            await _context.Entry(course).Reference(c => c.Department).LoadAsync();
            await _context.Entry(course).Reference(c => c.Building).LoadAsync();
            await _context.Entry(course).Reference(c => c.Room).LoadAsync();

            return CreatedAtAction(nameof(GetCourse), new { id = course.Id }, MapToDto(course));
        }

        // PUT: api/courses/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCourse(int id, [FromBody] UpdateCourseDto dto)
        {
            var course = await _context.Courses.FindAsync(id);

            if (course == null)
            {
                return NotFound(new { message = $"Course with ID {id} not found." });
            }

            if (dto.DepartmentId > 0)
            {
                var departmentExists = await _context.Departments.AnyAsync(d => d.Id == dto.DepartmentId);
                if (!departmentExists)
                {
                    return BadRequest(new { message = $"Department with ID {dto.DepartmentId} does not exist." });
                }
                course.DepartmentId = dto.DepartmentId;
            }

            if (dto.BuildingId > 0)
            {
                var buildingExists = await _context.Buildings.AnyAsync(b => b.Id == dto.BuildingId);
                if (!buildingExists)
                {
                    return BadRequest(new { message = $"Building with ID {dto.BuildingId} does not exist." });
                }
                course.BuildingId = dto.BuildingId;
            }

            if (dto.RoomId > 0)
            {
                var roomExists = await _context.Rooms.AnyAsync(r => r.Id == dto.RoomId && r.BuildingId == course.BuildingId);
                if (!roomExists)
                {
                    return BadRequest(new { message = $"Room with ID {dto.RoomId} does not exist in Building {course.BuildingId}." });
                }
                course.RoomId = dto.RoomId;
            }

            if (!string.IsNullOrWhiteSpace(dto.Title))
            {
                course.Title = dto.Title.Trim();
            }
            course.Description = dto.Description?.Trim();

            if (dto.Date != default)
            {
                course.Date = dto.Date;
            }

            await _context.SaveChangesAsync();

            await _context.Entry(course).Reference(c => c.Department).LoadAsync();
            await _context.Entry(course).Reference(c => c.Building).LoadAsync();
            await _context.Entry(course).Reference(c => c.Room).LoadAsync();

            return Ok(MapToDto(course));
        }

        // DELETE: api/courses/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var course = await _context.Courses.FindAsync(id);

            if (course == null)
            {
                return NotFound(new { message = $"Course with ID {id} not found." });
            }

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return Ok(new { ok = true, message = "Course deleted successfully." });
        }
    }
}