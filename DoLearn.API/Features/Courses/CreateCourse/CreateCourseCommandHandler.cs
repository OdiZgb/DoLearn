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
    : IRequestHandler<CreateCourseCommand, CourseResponse>
{
    private readonly AppDbContext _context;

    public CreateCourseCommandHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CourseResponse> Handle(CreateCourseCommand req, CancellationToken ct)
    {
        // Authorization, entity creation, schedule, sessions…
        var course = new Course {
            Title       = req.Title,
            Description = req.Description,
            CourseCode  = req.CourseCode,
            CreatedById = req.CreatedById,
            ImgURL      = req.ImgURL,
            CreatedAt   = DateTime.UtcNow,
            LastUpdated = DateTime.UtcNow
        };
        _context.Courses.Add(course);
        await _context.SaveChangesAsync(ct);

        var sessions = req.SessionStartTimes
            .Zip(req.SessionEndTimes, (st, et) => new CourseSession {
                Start      = st,
                Finish     = et,
                IsCanceled = false
            })
            .ToList();

        var schedule = new CourseSchedule {
            CourseId      = course.Id,
            StartDate     = req.StartDate,
            EndDate       = req.EndDate,
            Sessions      = sessions,
            IsSoftDeleted = false
        };
        _context.CourseSchedules.Add(schedule);
        await _context.SaveChangesAsync(ct);

        return new CourseResponse(
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
}
