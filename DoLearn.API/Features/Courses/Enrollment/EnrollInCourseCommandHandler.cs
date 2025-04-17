using DoLearn.API.Data;
using DoLearn.API.Features.Courses.Commands;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DoLearn.API.Features.Courses.EnrollInCourse
{
    public class EnrollInCourseCommandHandler : IRequestHandler<EnrollInCourseCommand, bool>
    {
        private readonly AppDbContext _context;

        public EnrollInCourseCommandHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(EnrollInCourseCommand request, CancellationToken cancellationToken)
        {
            var alreadyEnrolled = await _context.Enrollments
                .AnyAsync(e => e.CourseId == request.CourseId && e.StudentId == request.UserId, cancellationToken);

            if (alreadyEnrolled) return false;

            _context.Enrollments.Add(new  Enrollment
            {
                CourseId = request.CourseId,
                StudentId = request.UserId,
                Status =  EnrollmentStatus.Active,
                EnrolledAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
