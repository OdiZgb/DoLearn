using Microsoft.AspNetCore.Mvc;

namespace DoLearn.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthCheckController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get() => Ok(new { status = "ok", time = DateTime.UtcNow });
    }
}
