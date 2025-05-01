using DoLearn.API.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

public class GetAllCategoriesHandler : IRequestHandler<GetAllCategoriesQuery, List<Category>>
{
    private readonly AppDbContext _context;

    public GetAllCategoriesHandler(AppDbContext context) => _context = context;

    public async Task<List<Category>> Handle(GetAllCategoriesQuery request, CancellationToken ct)
    {
        var allCategories = await _context.Categories
            .AsNoTracking()
            .ToListAsync(ct);

        return BuildHierarchy(allCategories);
    }

    private List<Category> BuildHierarchy(List<Category> categories)
    {
        var dict = categories.ToLookup(c => c.ParentId);
        
        foreach (var category in categories)
        {
            category.Children = dict[category.Id].ToList();
        }

        return dict[null].ToList(); // Return root categories
    }
}