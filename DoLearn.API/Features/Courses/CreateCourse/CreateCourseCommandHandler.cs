// Features/Courses/CreateCourse/CreateCourseCommandHandler.cs
using DoLearn.API.Data;
using DoLearn.API.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DoLearn.API.Features.Courses.CreateCourse
{
    public sealed class CreateCourseCommandHandler
        : IRequestHandler<CreateCourseCommand, CourseResponse>
    {
        private readonly AppDbContext _context;

        public CreateCourseCommandHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<CourseResponse> Handle(
            CreateCourseCommand request,
            CancellationToken cancellationToken)
        {
            // Admin validation
            var creator = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == request.CreatedById, cancellationToken);

            if (creator?.Role != UserRole.Admin)
                throw new UnauthorizedAccessException("Only admins can create courses");

            var course = new Course
            {
                Title = request.Title,
                Description = request.Description,
                CourseCode = request.CourseCode,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                CreatedById = request.CreatedById
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync(cancellationToken);

            return new CourseResponse(
                course.Id,
                course.Title,
                course.CourseCode,
                course.CreatedAt,
                course.StartDate,
                course.EndDate
            );
        }
    }
}