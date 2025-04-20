using DoLearn.API.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

public class GetEnrolledCoursesHandler : IRequestHandler<GetEnrolledCoursesQuery, List<Course>>
{
    private readonly AppDbContext _context;

    public GetEnrolledCoursesHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Course>> Handle(GetEnrolledCoursesQuery request, CancellationToken cancellationToken)
    {
        // Fetch enrollments for the user and include the Course details
        var enrollments = await _context.Enrollments
            .Where(e => e.StudentId == request.UserId)
            .Include(e => e.Course)
            .ThenInclude(c => c.CreatedBy) // Include if needed
            .ToListAsync(cancellationToken);

        var courses = enrollments.Select(e => e.Course).ToList();

        // Update image URLs (consider moving this to a DTO or service)
        foreach (var course in courses)
        {
            course.ImgURL = $"http://localhost:5055{course.ImgURL}";
        }

        return courses;
    }
}