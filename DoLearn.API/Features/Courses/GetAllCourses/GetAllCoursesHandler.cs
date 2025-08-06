using DoLearn.API.Data;
using DoLearn.API.Features.Courses.Commands;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DoLearn.API.Features.Courses.EnrollInCourse
{
  public class GetAllCoursesHandler : IRequestHandler<GetAllCoursesQuery, List<Course>>
{
    private readonly AppDbContext _context;

    public GetAllCoursesHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Course>> Handle(GetAllCoursesQuery request, CancellationToken cancellationToken)
    {
        var courses =  await _context.Courses.Include(x=>x.Teachers).Include(x=>x.Category).Where(x=>x.SoftDelete!=true).ToListAsync(cancellationToken);
        foreach (var course in courses)
        {
            course.ImgURL = "https://dolearn.net"+ course.ImgURL;
        }
        return courses;
    }
}
}