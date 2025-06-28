using MediatR;
using Microsoft.EntityFrameworkCore;
using DoLearn.API.Data;
using DoLearn.API.Models;
using DoLearn.API.Features.Auth.Login;
using Google.Apis.Auth;

namespace DoLearn.API.Features.Auth.GoogleLogin
{
    public sealed class GoogleLoginQueryHandler 
        : IRequestHandler<GoogleLoginQuery, LoginResponse>
    {
        private readonly AppDbContext _context;
        private readonly TokenService _tokenService;

        public GoogleLoginQueryHandler(AppDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        public async Task<LoginResponse> Handle(GoogleLoginQuery request, CancellationToken cancellationToken)
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken);

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == payload.Email, cancellationToken);

            if (user == null)
            {
                user = new User
                {
                    Email = payload.Email,
                    Username = payload.Name ?? payload.Email.Split('@')[0],
                    PasswordHash = null, // no password for Google users
                    Role = UserRole.Student
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync(cancellationToken);
            }

            return new LoginResponse(
                _tokenService.CreateToken(user),
                DateTime.UtcNow.AddMinutes(60)
            );
        }
    }
}
