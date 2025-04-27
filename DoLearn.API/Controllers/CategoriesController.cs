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

        public CategoriesController(IMediator mediator)
        {
            _mediator = mediator;
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
            return NoContent();
        }
        
        [HttpGet("GetCoursesByCategoryId/{categoryId}")]
        public async Task<IActionResult> GetCoursesByCategoryId( int categoryId)
        {
            var query = new GetCoursesByCategoryIdQuery(categoryId);
            var courses = await _mediator.Send(query);
            return Ok(courses);
        }

    }
}