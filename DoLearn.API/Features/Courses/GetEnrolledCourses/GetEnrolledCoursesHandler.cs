using DoLearn.API.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

public class GetEnrolledCoursesHandler : IRequestHandler<GetEnrolledCoursesQuery, List<Enrollment>>
{
    private readonly AppDbContext _context;

    public GetEnrolledCoursesHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Enrollment>> Handle(GetEnrolledCoursesQuery request, CancellationToken cancellationToken)
    {
        // Fetch enrollments for the user and include the Course details
        var enrollments = await _context.Enrollments
            .Where(e => e.StudentId == request.UserId)
            .Include(x=>x.ReservedSessions)
            .Include(e => e.Course)
            .ThenInclude(c => c.CreatedBy) // Include if needed
            .ToListAsync(cancellationToken);
        
        var courses = enrollments.Select(e => e.Course).ToList();

        // Update image URLs (consider moving this to a DTO or service)
        foreach (var course in courses)
        {
            course.ImgURL = "https://dolearn.net" + course.ImgURL;
            
        }
         courses = courses.Distinct().ToList();
         

        return enrollments;
    }
}