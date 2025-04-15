using MediatR;
using DoLearn.API.Models;
using DoLearn.API.Data;
using Microsoft.EntityFrameworkCore;

namespace DoLearn.API.Features.Auth.Login
{
    public sealed class LoginQueryHandler 
        : IRequestHandler<LoginQuery, LoginResponse>
    {
        private readonly AppDbContext _context;
        private readonly TokenService _tokenService;

        public LoginQueryHandler(AppDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        public async Task<LoginResponse> Handle(
            LoginQuery request,
            CancellationToken cancellationToken)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("Invalid credentials");

            return new LoginResponse(
                _tokenService.CreateToken(user),
                DateTime.UtcNow.AddMinutes(60)
            );
        }
    }
}