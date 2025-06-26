using System.Linq;
using DoLearn.API.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

public class GetCoursesByCategoryQueryHandler  
    : IRequestHandler<GetCoursesByCategoryQuery, List<Course>>
{
    private readonly AppDbContext _context;

    public GetCoursesByCategoryQueryHandler (AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Course>> Handle(
        GetCoursesByCategoryQuery request, 
        CancellationToken cancellationToken)
    {
                var categoryIds = new List<int> { request.CategoryId };
       if(request.IncludeChildren)
        {
            var childIds = await _context.Categories
                .Where(c => c.ParentId == request.CategoryId)
                .Select(c => c.Id)
                .ToListAsync(cancellationToken);
            categoryIds.AddRange(childIds);
        }

        var courses =  _context.Courses
            .Include(c => c.Category)
            .Where(c => categoryIds.Contains(c.CategoryId))
            .ToList();
        
        foreach (var course in courses)
        {
            course.ImgURL = "https://dolearn:5000"+ course.ImgURL;
        }
     return courses;
    }
}
