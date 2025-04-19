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

        var courses  = await _context.Courses
            .Where(uc => uc.CreatedBy.Id == request.UserId).ToListAsync(cancellationToken);;
            foreach (var course in courses)
            {
            course.ImgURL = "http://localhost:5055"+ course.ImgURL;
            }

        return courses;
    }
}
