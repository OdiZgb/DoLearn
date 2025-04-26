using DoLearn.API.Data;
using MediatR;

public class CreateCategoryHandler : IRequestHandler<CreateCategoryCommand, Category>
{
    private readonly AppDbContext _context;

    public CreateCategoryHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Category> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = new Category
        {
            name = request.Name,
            description = request.Description
        };

        await _context.Categories.AddAsync(category, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return category;
    }
}