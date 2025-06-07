// Features/Courses/CreateCourse/CreateCourseCommandHandler.cs
using DoLearn.API.Data;
using DoLearn.API.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

public class CreateCourseCommandHandler
    : IRequestHandler<CreateCourseCommand, CourseCreateResponse>
{
    private readonly AppDbContext _context;

    public CreateCourseCommandHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CourseCreateResponse> Handle(CreateCourseCommand req, CancellationToken ct)
    {
        // Validate category exists
        var category = await _context.Categories
            .FirstOrDefaultAsync(x => x.Id == req.CategoryId, ct);
        if (category == null)
        {
            throw new Exception("Invalid category ID");
        }

        // Validate session times
        if (req.SessionStartTimes.Count != req.SessionEndTimes.Count)
        {
            throw new Exception("Mismatched session start/end times");
        }

        await using var transaction = await _context.Database.BeginTransactionAsync(ct);

        try
        {
            // Create course
            var course = new Course
            {
                Title = req.Title,
                Description = req.Description,
                CourseCode = req.CourseCode,
                CreatedById = req.CreatedById,
                ImgURL = req.ImgURL,
                CreatedAt = DateTime.UtcNow,
                LastUpdated = DateTime.UtcNow,
                CategoryId = req.CategoryId
            };
            _context.Courses.Add(course);
            await _context.SaveChangesAsync(ct);

            // Create sessions with MeetingURLs
            var sessions = req.SessionStartTimes
                .Zip(req.SessionEndTimes, (st, et) => new CourseSession
                {
                    Start = st,
                    Finish = et,
                    IsCanceled = false,
                    MeetingURL = GenerateMeetingUrl() // Implement this
                })
                .ToList();

            // Create schedule
            var schedule = new CourseSchedule
            {
                CourseId = course.Id,
                StartDate = req.StartDate,
                EndDate = req.EndDate,
                Sessions = sessions,
                IsSoftDeleted = false
            };
            _context.CourseSchedules.Add(schedule);

            await _context.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            return new CourseCreateResponse(
                course.Id,
                course.Title,
                course.CourseCode,
                course.CreatedAt,
                req.StartDate,
                req.EndDate,
                req.SessionStartTimes,
                req.SessionEndTimes,
                req.ImgURL
            );
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }

    private string GenerateMeetingUrl()
    {
        // Implement your meeting URL generation logic
        return $"https://meet.jit.si/{Guid.NewGuid()}";
    }
}