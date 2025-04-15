using MediatR;
using DoLearn.API.Models;
using DoLearn.API.Data;
using System;
using Microsoft.EntityFrameworkCore;

namespace DoLearn.API.Features.Auth.Register
{
    public sealed class CreateUserCommandHandler
        : IRequestHandler<CreateUserCommand, UserResponse>
    {
        private readonly AppDbContext _context;

        public CreateUserCommandHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UserResponse> Handle(
            CreateUserCommand request,
            CancellationToken cancellationToken)
        {
         var emailExists = await _context.Users
            .AnyAsync(u => u.Email == request.Email, cancellationToken);

    if (emailExists)
        throw new DuplicateEmailException("Email already registered");
        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Birthdate = request.Birthdate,
            Role = request.Role, // Add this line
            EmailVerificationToken = GenerateToken()
        };
            _context.Users.Add(user);
            await _context.SaveChangesAsync(cancellationToken);
        return new UserResponse(
            Id: user.Id,
            Username: user.Username,
            Email: user.Email,
            Birthdate: user.Birthdate,
            Registered: user.Registered,
            Role: user.Role
        );
        }

        private static string GenerateToken()
        {
            return Guid.NewGuid().ToString("N");
        }
    }
}