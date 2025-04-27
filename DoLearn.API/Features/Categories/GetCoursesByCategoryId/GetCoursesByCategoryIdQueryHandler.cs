using DoLearn.API.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

public class GetCoursesByCategoryIdQueryHandler 
    : IRequestHandler<GetCoursesByCategoryIdQuery, List<Course>>
{
    private readonly AppDbContext _context;

    public GetCoursesByCategoryIdQueryHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Course>> Handle(
        GetCoursesByCategoryIdQuery request, 
        CancellationToken cancellationToken)
    {
        var courses =  await _context.Courses.Include(x=>x.Category).Where(x=>x.CategoryId==request.GetCoursesByCategoryId).ToListAsync(cancellationToken);
        foreach (var course in courses)
        {
            course.ImgURL = "http://localhost:5055"+ course.ImgURL;
        }
        return courses;
    }
}
