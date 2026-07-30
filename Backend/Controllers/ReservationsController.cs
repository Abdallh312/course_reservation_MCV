using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationsController : ControllerBase
    {
        private static readonly string[] ValidStatuses = { "pending", "accepted", "rejected" };

        private readonly AppDbContext _context;

        public ReservationsController(AppDbContext context)
        {
            _context = context;
        }

        private static ReservationDto MapToDto(Reservation reservation)
        {
            return new ReservationDto
            {
                Id = reservation.Id,
                Status = reservation.Status,
                RequestDate = reservation.RequestDate,
                UserId = reservation.UserId,
                CourseId = reservation.CourseId,
                User = reservation.User == null ? null : new UserSummaryDto
                {
                    Id = reservation.User.Id,
                    Name = reservation.User.Name,
                    Email = reservation.User.Email
                },
                Course = reservation.Course == null ? null : new CourseDto
                {
                    Id = reservation.Course.Id,
                    Title = reservation.Course.Title,
                    Description = reservation.Course.Description,
                    Date = reservation.Course.Date,
                    DepartmentId = reservation.Course.DepartmentId,
                    BuildingId = reservation.Course.BuildingId,
                    RoomId = reservation.Course.RoomId,
                    Department = reservation.Course.Department == null ? null : new DepartmentSummaryDto
                    {
                        Id = reservation.Course.Department.Id,
                        Name = reservation.Course.Department.Name,
                        Description = reservation.Course.Department.Description
                    },
                    Building = reservation.Course.Building == null ? null : new BuildingSummaryDto
                    {
                        Id = reservation.Course.Building.Id,
                        Name = reservation.Course.Building.Name,
                        Address = reservation.Course.Building.Address
                    },
                    Room = reservation.Course.Room == null ? null : new RoomSummaryDto
                    {
                        Id = reservation.Course.Room.Id,
                        Name = reservation.Course.Room.Name,
                        Capacity = reservation.Course.Room.Capacity
                    }
                }
            };
        }

        private IQueryable<Reservation> ReservationsWithDetails()
        {
            return _context.Reservations
                .Include(r => r.User)
                .Include(r => r.Course).ThenInclude(c => c!.Department)
                .Include(r => r.Course).ThenInclude(c => c!.Building)
                .Include(r => r.Course).ThenInclude(c => c!.Room);
        }

        // POST: api/reservations
        [HttpPost]
        public async Task<ActionResult<ReservationDto>> CreateReservation([FromBody] CreateReservationDto dto)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == dto.UserId);
            if (!userExists)
            {
                return BadRequest(new { message = $"User with ID {dto.UserId} does not exist." });
            }

            var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == dto.CourseId);
            if (course == null)
            {
                return BadRequest(new { message = $"Course with ID {dto.CourseId} does not exist." });
            }

            var activeCount = await _context.Reservations.CountAsync(r =>
                r.CourseId == dto.CourseId && (r.Status == "accepted" || r.Status == "pending"));

            if (course.Capacity > 0 && activeCount >= course.Capacity)
            {
                return BadRequest(new { message = $"This course is full ({activeCount}/{course.Capacity} seats filled)." });
            }

            var alreadyReserved = await _context.Reservations.AnyAsync(r =>
                r.UserId == dto.UserId &&
                r.CourseId == dto.CourseId &&
                (r.Status == "pending" || r.Status == "accepted"));

            if (alreadyReserved)
            {
                return BadRequest(new { message = "This user already has an active reservation for this course." });
            }

            var targetStatus = string.IsNullOrWhiteSpace(dto.Status) ? "pending" : dto.Status.Trim().ToLower();

            var reservation = new Reservation
            {
                UserId = dto.UserId,
                CourseId = dto.CourseId,
                Status = targetStatus,
                RequestDate = DateTime.UtcNow
            };

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            var created = await ReservationsWithDetails().FirstAsync(r => r.Id == reservation.Id);

            return CreatedAtAction(nameof(GetReservation), new { id = reservation.Id }, MapToDto(created));
        }

        // GET: api/reservations/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ReservationDto>> GetReservation(int id)
        {
            var reservation = await ReservationsWithDetails().FirstOrDefaultAsync(r => r.Id == id);

            if (reservation == null)
            {
                return NotFound(new { message = $"Reservation with ID {id} not found." });
            }

            return MapToDto(reservation);
        }

        // GET: api/reservations?status=pending
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReservationDto>>> GetReservations([FromQuery] string? status)
        {
            if (!string.IsNullOrWhiteSpace(status) && !ValidStatuses.Contains(status.ToLower()))
            {
                return BadRequest(new { message = $"Invalid status '{status}'. Allowed values: pending, accepted, rejected." });
            }

            var query = ReservationsWithDetails();

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(r => r.Status == status.ToLower());
            }

            var reservations = await query
                .OrderByDescending(r => r.RequestDate)
                .ToListAsync();

            return reservations.Select(MapToDto).ToList();
        }

        // GET: api/users/5/reservations  (My Learning List)
        [HttpGet("/api/users/{userId:int}/reservations")]
        public async Task<ActionResult<IEnumerable<ReservationDto>>> GetUserReservations(int userId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists)
            {
                return NotFound(new { message = $"User with ID {userId} not found." });
            }

            var reservations = await ReservationsWithDetails()
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.RequestDate)
                .ToListAsync();

            return reservations.Select(MapToDto).ToList();
        }

        // PUT: api/reservations/5/status
        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateReservationStatus(int id, [FromBody] UpdateReservationStatusDto dto)
        {
            var reservation = await _context.Reservations.FindAsync(id);

            if (reservation == null)
            {
                return NotFound(new { message = $"Reservation with ID {id} not found." });
            }

            var newStatus = dto.Status?.ToLower().Trim() ?? string.Empty;

            if (!ValidStatuses.Contains(newStatus))
            {
                return BadRequest(new { message = "Status must be one of: pending, accepted, rejected." });
            }

            reservation.Status = newStatus;
            await _context.SaveChangesAsync();

            var updated = await ReservationsWithDetails().FirstAsync(r => r.Id == reservation.Id);

            return Ok(MapToDto(updated));
        }

        // DELETE: api/reservations/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteReservation(int id)
        {
            var reservation = await _context.Reservations.FindAsync(id);

            if (reservation == null)
            {
                return NotFound(new { message = $"Reservation with ID {id} not found." });
            }

            _context.Reservations.Remove(reservation);
            await _context.SaveChangesAsync();

            return Ok(new { ok = true, message = "Reservation deleted successfully." });
        }
    }
}