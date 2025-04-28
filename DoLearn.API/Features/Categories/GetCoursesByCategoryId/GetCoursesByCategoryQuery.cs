// GetAllCategoriesQuery.cs
using MediatR;


// GetCategoryByIdQuery.cs
public record GetCoursesByCategoryQuery(int CategoryId, bool IncludeChildren) : IRequest<List<Course>>;

 