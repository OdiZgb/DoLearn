using System.Security.Claims;
using DoLearn.API.Features.Courses.GetCourse;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DoLearn.API.Models;
using DoLearn.API.Features.Courses.Commands;
using DoLearn.API.Data;
using Microsoft.EntityFrameworkCore;

namespace DoLearn.API.Controllers{

    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase{

        private readonly IMediator _mediator;
        private readonly IWebHostEnvironment _env;   // ← add this
            private readonly AppDbContext _context;

        public CategoriesController(IMediator mediator, IWebHostEnvironment env, AppDbContext context)
        {
            _mediator = mediator;
             _env      = env;
             _context = context;
        }
        


        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var query = new GetAllCategoriesQuery();
            var categories = await _mediator.Send(query);
            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var query = new GetCategoryByIdQuery(id);
            var category = await _mediator.Send(query);
            return category != null ? Ok(category) : NotFound();
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCategoryCommand command)
        {
            var category = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryCommand command)
        {
            if (id != command.Id) return BadRequest("ID mismatch");
            await _mediator.Send(command);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var command = new DeleteCategoryCommand(id);
            await _mediator.Send(command);
            return NoContent(); // Proper 204 response for successful deletion
        }
        [HttpGet("GetCoursesByCategoryId/{categoryId}")]
        public async Task<IActionResult> GetCoursesByCategoryId( int categoryId)
        {
            var query = new GetCoursesByCategoryQuery(categoryId, false);
            var courses = await _mediator.Send(query);
            return Ok(courses);
        }
        [HttpGet("hierarchy")]
        public async Task<IActionResult> GetHierarchy()
        {
            var categories = await _context.Categories
                .Include(c => c.Children)
                .Where(c => c.ParentId == null)
                .ToListAsync();
            return Ok(categories);
        }

        [HttpGet("{categoryId}/courses")]
        public async Task<IActionResult> GetCategoryCourses(int categoryId)
        {
            var query = new GetCoursesByCategoryQuery(categoryId, true);
            var courses = await _mediator.Send(query);
            return Ok(courses);
        }
    }
}