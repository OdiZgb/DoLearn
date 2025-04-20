using DoLearn.API.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

public class GetCreatedCoursesHandler : IRequestHandler<GetCreatedCoursesQuery, List<Course>>
{
    private readonly AppDbContext _context;

    public GetCreatedCoursesHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Course>> Handle(GetCreatedCoursesQuery request, CancellationToken cancellationToken)
    {

         var courses  = await _context.Courses
            .Where(uc => uc.CreatedBy.Id == request.UserId).Include(uc=>uc.Students).ToListAsync(cancellationToken);;
        
   
         var coursesEnrolledByStudent  = await _context.Enrollments.Where(x=>x.StudentId==request.UserId).ToListAsync(cancellationToken);
             
            foreach (var item in coursesEnrolledByStudent)
            {
                Course simirCourse =  await _context.Courses.Where(uc => uc.Id == item.CourseId).FirstOrDefaultAsync();
                courses.Add(simirCourse);
            }

    foreach (var course in courses)
            {
            course.ImgURL = "http://localhost:5055"+ course.ImgURL;
            }
        return courses;
    }
}