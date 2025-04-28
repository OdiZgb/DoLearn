// CreateCategoryCommand.cs
using System.Text.Json.Serialization;
using MediatR;

public sealed record CreateCategoryCommand(
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("description")] string Description,
    [property: JsonPropertyName("parentId")] int? ParentId
) : IRequest<Category>;