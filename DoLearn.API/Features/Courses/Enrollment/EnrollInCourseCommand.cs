using MediatR;

public class EnrollInCourseCommand : IRequest<EnrollmentResult>
{
    public int CourseId { get; }
    public int UserId { get; }
    public List<int> SessionIds { get; }

    public EnrollInCourseCommand(int courseId, int userId, List<int> sessionIds)
    {
        CourseId = courseId;
        UserId = userId;
        SessionIds = sessionIds;
    }
}
