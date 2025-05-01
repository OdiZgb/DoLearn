// GetAllCategoriesQuery.cs
using MediatR;

public record GetAllCategoriesQuery : IRequest<List<Category>>;

// GetCategoryByIdQuery.cs
public record GetCategoryByIdQuery(int Id) : IRequest<Category>;

// UpdateCategoryCommand.cs
public record UpdateCategoryCommand(
    string name,
    string description,
    int parentId
) : IRequest<Unit>;

// DeleteCategoryCommand.cs