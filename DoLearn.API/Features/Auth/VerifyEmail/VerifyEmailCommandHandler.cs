// Features/Auth/VerifyEmail/VerifyEmailCommandHandler.cs
using MediatR;
using DoLearn.API.Models;
using DoLearn.API.Data;
using Microsoft.EntityFrameworkCore;

namespace DoLearn.API.Features.Auth.VerifyEmail
{
    public sealed class VerifyEmailCommandHandler 
        : IRequestHandler<VerifyEmailCommand, bool>
    {
        private readonly AppDbContext _context;

        public VerifyEmailCommandHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(
            VerifyEmailCommand request, 
            CancellationToken cancellationToken)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => 
                    u.EmailVerificationToken == request.Token, 
                    cancellationToken);

            if (user == null) return false;

            user.EmailVerified = true;
            user.EmailVerificationToken = null; // Consume the token
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}