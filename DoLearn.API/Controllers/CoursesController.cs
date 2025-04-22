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
             _env      = env;
             _context = context;
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
            dto.ImgURL
        );

        var result = await _mediator.Send(cmd);
        return CreatedAtAction(nameof(GetCourse), new { id = result.Id }, result);
    }
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetCourse(int id)
        {
            var query = new GetCourseQuery(id);
            var course = await _mediator.Send(query);

            if (course == null)
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
        [Authorize]
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
    var sessions = await _context.CourseSessions.Include(x=>x.Reservations)
        .Where(s => s.CourseSchedule.CourseId == courseId)
        .ToListAsync();

    return Ok(sessions);
}

 
    }
    }