// Features/Auth/GetUser.cs
using MediatR;
using DoLearn.API.Models;
using Microsoft.EntityFrameworkCore;
using DoLearn.API.Data;

namespace DoLearn.API.Features.Auth
{
    public static class GetUser
    {
        public sealed record Query(int UserId) : IRequest<Response>;
        
        public sealed class Handler : IRequestHandler<Query, Response>
        {
            private readonly AppDbContext _context;
            
            public Handler(AppDbContext context)
            {
                _context = context;
            }

            public async Task<Response> Handle(Query request, CancellationToken cancellationToken)
            {
                var user = await _context.Users
                    .Include(u => u.CreatedCourses)
                    .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

                return user == null 
                    ? throw new KeyNotFoundException("User not found")
                    : new Response(
                        user.Id,
                        user.Username,
                        user.Email,
                        user.Birthdate,
                        user.Registered,
                        user.Role.ToString(),
                        user.CreatedCourses.Count
                    );
            }
        }

        public sealed record Response(
            int Id,
            string Username,
            string Email,
            DateTime Birthdate,
            DateTime Registered,
            string Role,
            int CreatedCoursesCount
        );
    }
}