using System.Security.Claims;
using DoLearn.API.Features.Courses.GetCourse;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DoLearn.API.Models;
using DoLearn.API.Features.Courses.Commands;
using DoLearn.API.Data;
using Microsoft.EntityFrameworkCore;

namespace DoLearn.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IWebHostEnvironment _env;   // ← add this
        private readonly AppDbContext _context;

        public CoursesController(IMediator mediator, IWebHostEnvironment env, AppDbContext context)
        {
            _mediator = mediator;
            _env = env;
            _context = context;
        }

        [HttpGet("{id}/edit")]
        public async Task<IActionResult> GetCourseForEdit(int id)
        {
            var query = new GetCourseForEditQuery { CourseId = id };
            var course = await _mediator.Send(query);
            return Ok(course);
        }
        // CoursesController.cs
        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> UpdateCourse(int id, [FromForm] UpdateCourseDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            // Verify user owns the course
            var isOwner = await _context.Courses
                .AnyAsync(c => c.Id == id && c.CreatedById == userId);

            if (!isOwner) return Forbid();

            var command = new UpdateCourseCommand
            {
                CourseId = id,
                Title = dto.Title,
                Description = dto.Description,
                CourseCode = dto.CourseCode,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Price = dto.Price,
                CategoryId = dto.CategoryId,
                Sessions = dto.Sessions,
                DeletedSessionIds = dto.DeletedSessionIds,
                Image = dto.Image
            };

            await _mediator.Send(command);
            return NoContent();
        }
        [HttpPost]
        public async Task<IActionResult> CreateCourse([FromForm] CreateCourseDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            if (dto.Image is not null)
            {
                var imagesFolder = Path.Combine(_env.WebRootPath, "images");
                Directory.CreateDirectory(imagesFolder);

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(dto.Image.FileName)}";
                var fullPath = Path.Combine(imagesFolder, fileName);
                await using var stream = System.IO.File.Create(fullPath);
                await dto.Image.CopyToAsync(stream);
                dto.ImgURL = $"/images/{fileName}";
            }

            var cmd = new CreateCourseCommand(
                dto.Title,
                dto.Description,
                dto.CourseCode,
                dto.StartDate,
                dto.EndDate,
                dto.SessionStartTimes,
                dto.SessionEndTimes,
                userId,
                dto.Capacity,
                dto.ImgURL,
                dto.CategoryId
            );

            var result = await _mediator.Send(cmd);
            return CreatedAtAction(nameof(GetCourse), new { id = result.Id }, result);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCourse(int id)
        {
            var query = new GetCourseQuery(id);
            CourseResponse course = await _mediator.Send(query);

            if (course == null || course.SoftDelete == true)
                return NotFound();

            return Ok(course);
        }

        [HttpPut("cancel-session/{sessionId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CancelSession(int sessionId)
        {
            var command = new CancelSessionCommand(sessionId);
            var result = await _mediator.Send(command);

            if (!result)
                return NotFound("Session not found or already canceled.");

            return NoContent();
        }



        // Endpoint to withdraw a user from a course
        [HttpPost("{courseId}/withdraw")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> WithdrawFromCourse(int courseId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var command = new WithdrawFromCourseCommand(courseId, userId);
            var result = await _mediator.Send(command);

            if (!result)
                return BadRequest("Failed to withdraw from the course.");

            return Ok("Successfully withdrawn.");
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCourses()
        {
            var query = new GetAllCoursesQuery();
            var courses = await _mediator.Send(query);
            return Ok(courses);
        }


        [HttpGet("enrolled")]
        public async Task<IActionResult> GetEnrolledCourses()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var query = new GetEnrolledCoursesQuery(userId);
            var courses = await _mediator.Send(query);
            return Ok(courses);
        }

        [HttpGet("created")]
        public async Task<IActionResult> GetCreatedCourses()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var query = new GetCreatedCoursesQuery(userId);
            var courses = await _mediator.Send(query);
            return Ok(courses);
        }
        [HttpGet("{courseId}/enrollment-status")]
        public async Task<IActionResult> GetEnrollmentStatus(int courseId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.CourseId == courseId && e.StudentId == userId);

            if (enrollment == null)
            {
                return Ok("not-enrolled");
            }

            return Ok(enrollment.Status.ToString().ToLower());
        }

        [HttpPost("{courseId}/enroll")]
        public async Task<IActionResult> EnrollInCourse(
            int courseId,
            [FromBody] List<int> sessionIds) // Add session IDs from request body
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            // Create command with session IDs
            var command = new EnrollInCourseCommand(
                courseId,
                userId,
                sessionIds
            );

            var result = await _mediator.Send(command);

            // Check against enum values
            return result switch
            {
                EnrollmentResult.Success => Ok("Successfully enrolled"),
                EnrollmentResult.SessionFull => BadRequest("One or more sessions are full"),
                EnrollmentResult.Conflict => Conflict("Scheduling conflict detected"),
                EnrollmentResult.NotFound => NotFound("Course or user not found"),
                _ => BadRequest("Enrollment failed")
            };
        }
        [HttpGet("{courseId}/sessions")]
        public async Task<IActionResult> GetCourseSessions(int courseId)
        {
            var sessions = await _context.CourseSessions.Include(x => x.Reservations)
                .Where(s => s.CourseSchedule.CourseId == courseId)
                .ToListAsync();

            return Ok(sessions);
        }

        [HttpDelete("{courseId}/delete")]
        public async Task<IActionResult> SoftDeleteCourse(int courseId)
        {
            var course = await _context.Courses.Where(x => x.Id == courseId).FirstOrDefaultAsync();
            course.SoftDelete = true;
            await this._context.SaveChangesAsync();
            return Ok("Course Deleted");
        }

        [HttpGet("GetCoursesByCategoryId/{categoryId}")]
        public async Task<IActionResult> GetCoursesByCategoryId(int categoryId)
        {
            var query = new GetCoursesByCategoryQuery(categoryId, true);
            var courses = await _mediator.Send(query);
            return Ok(courses);
        }

    }
}