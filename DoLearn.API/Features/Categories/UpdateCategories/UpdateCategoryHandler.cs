using DoLearn.API.Data;
using MediatR;

public class UpdateCategoryHandler : IRequestHandler<UpdateCategoryWithIdCommand, Unit>
{
    private readonly AppDbContext _context;

    public UpdateCategoryHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(UpdateCategoryWithIdCommand request, CancellationToken cancellationToken)
    {
        var category = await _context.Categories.FindAsync(request.id);
        if (category == null) throw new Exception("Category not found");

        category.Name = request.name;
        category.Description = request.description;

        await _context.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}