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
        return await _context.Courses.ToListAsync(cancellationToken);
    }
}
}