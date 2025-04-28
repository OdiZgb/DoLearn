using DoLearn.API.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

public class GetAllCategoriesHandler : IRequestHandler<GetAllCategoriesQuery, List<Category>>
{
    private readonly AppDbContext _context;

    public GetAllCategoriesHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Category>> Handle(GetAllCategoriesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Categories
            .AsNoTracking()
            .Include(c => c.Children)  // Load child categories
            .Where(c => c.ParentId == null)  // Only get root categories
            .ToListAsync(cancellationToken);
    }
}