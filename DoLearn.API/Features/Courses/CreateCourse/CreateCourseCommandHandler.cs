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
            var creator = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == request.CreatedById, cancellationToken);

            if (creator?.Role != UserRole.Admin)
                throw new UnauthorizedAccessException("Only admins can create courses");

            var course = new Course
            {
                Title = request.Title,
                Description = request.Description,
                CourseCode = request.CourseCode,
                CreatedById = request.CreatedById,
                CreatedAt = DateTime.UtcNow,
                LastUpdated = DateTime.UtcNow
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync(cancellationToken);

            var sessions = request.SessionStartTimes
                .Zip(request.SessionEndTimes, (start, end) => new CourseSession
                {
                    Start = start,
                    Finish = end,
                    IsCanceled = false
                })
                .ToList();

            var schedule = new CourseSchedule
            {
                CourseId = course.Id,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Sessions = sessions,
                IsSoftDeleted = false
            };

            _context.CourseSchedules.Add(schedule);
            await _context.SaveChangesAsync(cancellationToken);
            return new CourseResponse(
                course.Id,
                course.Title,
                course.CourseCode,
                course.CreatedAt,
                request.StartDate,
                request.EndDate,
                request.SessionStartTimes,
                request.SessionEndTimes
            );

        }
    }
}
