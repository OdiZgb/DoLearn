using MediatR;
using Microsoft.AspNetCore.Mvc;
using DoLearn.API.Features.Auth.Register;

namespace DoLearn.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AuthController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] CreateUserDto dto)
        {
            var command = new CreateUserCommand(
                dto.Username,
                dto.Email,
                dto.Password, // Map to command's Password
                dto.Birthdate
            );
            
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            // We'll implement this later
            return Ok();
        }
    }
}