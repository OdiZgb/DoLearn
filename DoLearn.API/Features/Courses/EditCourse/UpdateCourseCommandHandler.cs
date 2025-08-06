using DoLearn.API.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

public class UpdateCourseCommandHandler : IRequestHandler<UpdateCourseCommand>{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public UpdateCourseCommandHandler(
        AppDbContext context, 
        IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    public async Task<Unit> Handle(UpdateCourseCommand request, CancellationToken ct)    {
        var course = await _context.Courses
            .Include(c => c.Schedule)
                .ThenInclude(s => s.Sessions)
                    .ThenInclude(s => s.Reservations)
            .Include(c => c.Pricing)
            .FirstOrDefaultAsync(c => c.Id == request.CourseId, ct);

        if (course == null) throw new Exception("Course not found");

        // Update basic properties
        course.Title = request.Title;
        course.Description = request.Description;
        course.CourseCode = request.CourseCode;
        course.CategoryId = request.CategoryId;
        course.LastUpdated = DateTime.UtcNow;

        // Update pricing
        if (course.Pricing == null)
        {
            course.Pricing = new CoursePricing 
            { 
                Price = request.Price, 
                Currency = "USD" 
            };
        }
        else
        {
            course.Pricing.Price = request.Price;
        }

        // Update schedule dates
        course.Schedule.StartDate = request.StartDate;
        course.Schedule.EndDate = request.EndDate;

        // Handle image update
        if (request.Image != null)
        {
            // Delete old image if exists
            if (!string.IsNullOrEmpty(course.ImgURL))
            {
                var oldFilePath = Path.Combine(
                    _env.WebRootPath, 
                    course.ImgURL.TrimStart('/'));
                
                if (System.IO.File.Exists(oldFilePath))
                {
                    System.IO.File.Delete(oldFilePath);
                }
            }

            // Save new image
            var imagesFolder = Path.Combine(_env.WebRootPath, "images");
            Directory.CreateDirectory(imagesFolder);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(request.Image.FileName)}";
            var fullPath = Path.Combine(imagesFolder, fileName);
            
            await using var stream = System.IO.File.Create(fullPath);
            await request.Image.CopyToAsync(stream, ct);
            
            course.ImgURL = $"/images/{fileName}";
        }

        // Update sessions
        foreach (var sessionDto in request.Sessions)
        {
            if (sessionDto.Id.HasValue)
            {
                var session = course.Schedule.Sessions
                    .FirstOrDefault(s => s.Id == sessionDto.Id.Value);
                
                if (session != null)
                {
                    session.Start = sessionDto.Start;
                    session.Finish = sessionDto.End;
                    session.IsCanceled = sessionDto.IsCanceled;
                }
            }
            else
            {
                // Add new session
                course.Schedule.Sessions.Add(new CourseSession
                {
                    Start = sessionDto.Start,
                    Finish = sessionDto.End,
                    IsCanceled = sessionDto.IsCanceled,
                    MeetingURL = GenerateMeetingUrl(),
                    Capacity = 20
                });
            }
        }

        // Handle deleted sessions
        foreach (var sessionId in request.DeletedSessionIds)
        {
            var session = course.Schedule.Sessions
                .FirstOrDefault(s => s.Id == sessionId);
            
            if (session != null)
            {
                if (session.Reservations.Any())
                {
                    // Cannot delete physically, mark as canceled
                    session.IsCanceled = true;
                }
                else
                {
                    course.Schedule.Sessions.Remove(session);
                }
            }
        }

        await _context.SaveChangesAsync(ct);
        return Unit.Value;    }

    private string GenerateMeetingUrl() => $"https://meet.jit.si/{Guid.NewGuid()}";
}