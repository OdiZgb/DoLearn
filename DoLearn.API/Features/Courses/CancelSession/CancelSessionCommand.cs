using MediatR;

namespace DoLearn.API.Features.Courses.Commands
{
    public record CancelSessionCommand(int SessionId) : IRequest<bool>;
}
