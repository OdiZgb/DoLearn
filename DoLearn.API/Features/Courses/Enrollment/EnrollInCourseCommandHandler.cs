using DoLearn.API.Data;
using DoLearn.API.Features.Courses.Commands;
using DoLearn.API.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

public class EnrollInCourseCommandHandler : IRequestHandler<EnrollInCourseCommand, EnrollmentResult>
{
    private readonly AppDbContext _context;

    public EnrollInCourseCommandHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<EnrollmentResult> Handle(EnrollInCourseCommand request, CancellationToken cancellationToken)
    {
        // Get course with schedule and sessions
        var course = await _context.Courses
            .Include(c => c.Schedule)
                .ThenInclude(s => s.Sessions)
            .FirstOrDefaultAsync(c => c.Id == request.CourseId);

        if (course == null) return EnrollmentResult.NotFound;

        // Get user with existing enrollments
        var user = await _context.Users
            .Include(u => u.Enrollments)
                .ThenInclude(e => e.ReservedSessions)
            .FirstOrDefaultAsync(u => u.Id == request.UserId);

        if (user == null) return EnrollmentResult.NotFound;

        // Get selected sessions
        var sessions = await _context.CourseSessions
            .Include(s => s.Reservations)
            .Where(s => request.SessionIds.Contains(s.Id))
            .ToListAsync();

        // Validate sessions
        foreach (var session in sessions)
        {
            // Check session capacity
            if (session.Reservations.Count >= session.Capacity)
                return EnrollmentResult.SessionFull;

            // Check if user already has conflicting sessions
            var hasConflict = user.Enrollments
                .SelectMany(e => e.ReservedSessions)
                .Any(rs => rs.Start < session.Finish && rs.Finish > session.Start);

            if (hasConflict) return EnrollmentResult.Conflict;
        }

        // Create enrollment
        var enrollment = new Enrollment
        {
            CourseId = course.Id,
            StudentId = user.Id,
            Status = EnrollmentStatus.Pending,
            ReservedSessions = sessions
        };

        try
        {
            await _context.Enrollments.AddAsync(enrollment);
            await _context.SaveChangesAsync();
            return EnrollmentResult.Success;
        }
        catch
        {
            return EnrollmentResult.Error;
        }
    }
}