// Features/Auth/Register/UserResponse.cs
namespace DoLearn.API.Features.Auth.Register
{
    public sealed class UserResponse
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public DateTime Birthdate { get; set; }
        public DateTime Registered { get; set; }
    }
}