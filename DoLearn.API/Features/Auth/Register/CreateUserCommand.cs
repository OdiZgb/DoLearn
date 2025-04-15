// Features/Auth/Register/CreateUserCommand.cs
using DoLearn.API.Models;
using MediatR;

namespace DoLearn.API.Features.Auth.Register
{
public sealed record CreateUserCommand(
    string Username,
    string Email,
    string Password,
    DateTime Birthdate,
    UserRole Role = UserRole.Student // Add this line
) : IRequest<UserResponse>;
}