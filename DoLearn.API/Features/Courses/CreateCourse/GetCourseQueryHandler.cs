using DoLearn.API.Data;
using DoLearn.API.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DoLearn.API.Features.Courses.GetCourse
{
    public class GetCourseQueryHandler : IRequestHandler<GetCourseQuery, CourseResponse>
    {
        private readonly AppDbContext _context;

        public GetCourseQueryHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<CourseResponse> Handle(GetCourseQuery request, CancellationToken cancellationToken)
        {
            var course = await _context.Courses
            .Include(c=>c.CreatedBy)
                .Include(c => c.Schedule)
                .ThenInclude(s => s.Sessions)
                .FirstOrDefaultAsync(c => c.Id == request.CourseId, cancellationToken);

            if (course == null) return null!;

            var schedule = course.Schedule;


            course.CreatedBy.EmailVerificationToken = null;
            course.CreatedBy.EmailVerified = false;
            course.CreatedBy.PasswordHash = "";
            course.CreatedBy.ResetTokenExpires = null;
            course.CreatedBy.PasswordResetToken= null;
            
            return new CourseResponse(
                course.Id,
                course.Title,
                course.CourseCode,
                course.CreatedAt,
                schedule?.StartDate ?? DateTimeOffset.MinValue,
                schedule?.EndDate ?? DateTimeOffset.MinValue,
                schedule.Sessions,
                ImgURL: "https://www.dolearn.net:5000/" + course.ImgURL,
                course.Description,
                course.CreatedBy


            );
            
        }
    }
}
