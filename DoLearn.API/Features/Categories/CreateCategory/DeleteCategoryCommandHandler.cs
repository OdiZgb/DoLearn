using DoLearn.API.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DoLearn.API.Features.Categories.GetCategories
{
public class DeleteCategoryCommandHandler 
    : IRequestHandler<DeleteCategoryCommand, bool> // Must match command's return type
{
        private readonly AppDbContext _context;

        public DeleteCategoryCommandHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
        {
            // 1. Find the category (without ParentId restriction)
            var category = await _context.Categories
                .Include(c => c.Children) // Include children for cascade delete
                .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

            if (category == null)
                return false;

            // 2. Handle children (if needed)
            if (category.Children?.Count > 0)
            {
                _context.Categories.RemoveRange(category.Children);
            }

            // 3. Remove the main category
            _context.Categories.Remove(category);

            // 4. Save changes to database
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}