// Features/Auth/Register/UserResponse.cs
using DoLearn.API.Models;

namespace DoLearn.API.Features.Auth.Register
{
public sealed record UserResponse(
    int Id,
    string Username,
    string Email,
    DateTime Birthdate,
    DateTime Registered,
    UserRole Role // Add this parameter
);
}