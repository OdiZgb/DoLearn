using DoLearn.API.Data;
using DoLearn.API.Features.Courses.Commands;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DoLearn.API.Features.Courses.WithdrawFromCourse
{
    public class WithdrawFromCourseCommandHandler : IRequestHandler<WithdrawFromCourseCommand, bool>
    {
        private readonly AppDbContext _context;

        public WithdrawFromCourseCommandHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(WithdrawFromCourseCommand request, CancellationToken cancellationToken)
        {
            var enrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.CourseId == request.CourseId && e.StudentId == request.UserId, cancellationToken);

            if (enrollment == null || enrollment.Status != EnrollmentStatus.Active)
                return false;

            enrollment.Status = EnrollmentStatus.Withdrawn;
            enrollment.EndedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
