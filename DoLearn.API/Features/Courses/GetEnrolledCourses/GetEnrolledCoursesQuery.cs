using MediatR;

public record GetEnrolledCoursesQuery(int UserId) : IRequest<List<Course>>;
