// GetAllCategoriesQuery.cs
using MediatR;

public record GetAllCategoriesQuery : IRequest<List<Category>>;

// GetCategoryByIdQuery.cs
public record GetCategoryByIdQuery(int Id) : IRequest<Category>;

// UpdateCategoryCommand.cs
public record UpdateCategoryCommand(
    int Id,
    string Name,
    string Description
) : IRequest<Unit>;

// DeleteCategoryCommand.cs
public record DeleteCategoryCommand(int Id) : IRequest<Unit>;