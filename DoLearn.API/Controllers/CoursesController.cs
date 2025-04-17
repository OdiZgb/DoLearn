using System.Security.Claims;
using DoLearn.API.Features.Courses.CreateCourse;
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

        public CoursesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateCourse([FromBody] CreateCourseDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var command = new CreateCourseCommand(
                dto.Title,
                dto.Description,
                dto.CourseCode,
                dto.StartDate,
                dto.EndDate,
                dto.SessionStartTimes,
                dto.SessionEndTimes,
                userId   
            );


            var result = await _mediator.Send(command);

            // Return the response
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
    }
}
