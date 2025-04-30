using MediatR;

public sealed record DeleteCategoryCommand(int Id) : IRequest<bool>;