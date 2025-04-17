using DoLearn.API.Data;
using DoLearn.API.Features.Courses.Commands;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace DoLearn.API.Features.Courses.CancelSession
{
    public class CancelSessionCommandHandler : IRequestHandler<CancelSessionCommand, bool>
    {
        private readonly AppDbContext _context;

        public CancelSessionCommandHandler(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(CancelSessionCommand request, CancellationToken cancellationToken)
        {
            var session = await _context.Set<CourseSession>()
                .FirstOrDefaultAsync(s => s.Id == request.SessionId, cancellationToken);

            if (session == null || session.IsCanceled)
                return false;

            session.IsCanceled = true;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
