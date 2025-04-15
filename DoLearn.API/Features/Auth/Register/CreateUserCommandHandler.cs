using MediatR;
using DoLearn.API.Models;
using DoLearn.API.Data;
using System;

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
            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password), // Changed to Password
                Birthdate = request.Birthdate,
                EmailVerificationToken = GenerateToken()
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync(cancellationToken);
            return new UserResponse
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Birthdate = user.Birthdate,
                Registered = user.Registered
            };
        }

        private static string GenerateToken()
        {
            return Guid.NewGuid().ToString("N");
        }
    }
}