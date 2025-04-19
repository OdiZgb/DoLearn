using System.Security.Claims;
using DoLearn.API.Features.Courses.GetCourse;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DoLearn.API.Models;
using DoLearn.API.Features.Courses.Commands;

namespace DoLearn.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IWebHostEnvironment _env;   // ← add this

        public CoursesController(IMediator mediator, IWebHostEnvironment env)
        {
            _mediator = mediator;
             _env      = env;
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

        // Endpoint to enroll a user in a course
        [HttpPost("{courseId}/enroll")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> EnrollInCourse(int courseId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var command = new EnrollInCourseCommand(courseId, userId);
            var result = await _mediator.Send(command);

            if (!result)
                return BadRequest("Failed to enroll in the course.");

            return Ok("Successfully enrolled.");
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

    }
}
