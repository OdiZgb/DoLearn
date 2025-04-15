using System.ComponentModel.DataAnnotations;

namespace DoLearn.API.Features.Auth.Register
{
    public sealed class CreateUserDto
    {
        [Required, MinLength(3)]
        public string Username { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; }

        [Required, MinLength(8)]
        public string Password { get; set; }

        [Required]
        public DateTime Birthdate { get; set; }
    }
}