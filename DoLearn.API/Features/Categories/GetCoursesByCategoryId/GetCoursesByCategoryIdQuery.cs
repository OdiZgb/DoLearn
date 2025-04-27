// GetAllCategoriesQuery.cs
using MediatR;


// GetCategoryByIdQuery.cs
public record GetCoursesByCategoryIdQuery(int GetCoursesByCategoryId) : IRequest<List<Course>>;

 