using DoLearn.API.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

public class GetCourseForEditQueryHandler 
    : IRequestHandler<GetCourseForEditQuery, CourseEditResponse>
{
    private readonly AppDbContext _context;

    public GetCourseForEditQueryHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CourseEditResponse> Handle(
        GetCourseForEditQuery request, 
        CancellationToken cancellationToken)
    {
        var course = await _context.Courses
            .Include(c => c.Schedule)
                .ThenInclude(s => s.Sessions)
            .Include(c => c.Pricing)
            .FirstOrDefaultAsync(c => c.Id == request.CourseId, cancellationToken);

        if (course == null) throw new Exception("Course not found");

        return new CourseEditResponse
        {
            Id = course.Id,
            Title = course.Title,
            Description = course.Description,
            CourseCode = course.CourseCode,
            StartDate = course.Schedule.StartDate,
            EndDate = course.Schedule.EndDate,
            Price = course.Pricing?.Price ?? 0,
            CategoryId = course.CategoryId,
            ImgURL = course.ImgURL,
            Sessions = course.Schedule.Sessions.Select(s => new SessionResponse
            {
                Id = s.Id,
                Start = s.Start,
                End = s.Finish,
                IsCanceled = s.IsCanceled
            }).ToList()
        };
    }
}