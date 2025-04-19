using MediatR;

public record GetCreatedCoursesQuery(int UserId) : IRequest<List<Course>>;
