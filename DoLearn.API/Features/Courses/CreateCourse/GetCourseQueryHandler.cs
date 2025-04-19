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
                .Include(c => c.Schedule)
                .ThenInclude(s => s.Sessions)
                .FirstOrDefaultAsync(c => c.Id == request.CourseId, cancellationToken);

            if (course == null) return null!;

            var schedule = course.Schedule;

            var sessionStartTimes = schedule?.Sessions.Select(s => s.Start).ToList() ?? new List<DateTime>();
            var sessionEndTimes = schedule?.Sessions.Select(s => s.Finish).ToList() ?? new List<DateTime>();
            course.ImgURL = "http://localhost:5055/"+ course.ImgURL;

            return new CourseResponse(
                course.Id,
                course.Title,
                course.CourseCode,
                course.CreatedAt,
                schedule?.StartDate ?? DateTime.MinValue,
                schedule?.EndDate   ?? DateTime.MinValue,
                sessionStartTimes,
                sessionEndTimes,
                ImgURL:"http://localhost:5055/"+ course.ImgURL           // ← pass the stored image URL here
            );
            
        }
    }
}
