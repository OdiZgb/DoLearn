// CreateCategoryCommand.cs
using MediatR;

public record CreateCategoryCommand(
    string Name,
    string Description
) : IRequest<Category>;