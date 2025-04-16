// Controllers/CoursesController.cs
using System.Security.Claims;
using DoLearn.API.Features.Courses.CreateCourse;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
        public async Task<IActionResult> CreateCourse(
            [FromBody] CreateCourseDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            
            var command = new CreateCourseCommand(
                dto.Title,
                dto.Description,
                dto.CourseCode,
                dto.StartDate,
                dto.EndDate,
                userId
            );

            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetCourse), new { id = result.Id }, result);
        }

        // GetCourse endpoint to be implemented later
        [HttpGet("{id}")]
        public IActionResult GetCourse(int id) => Ok();
    }
}