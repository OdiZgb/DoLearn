using MediatR;
using DoLearn.API.Models;

public record GetAllCoursesQuery() : IRequest<List<Course>>;
