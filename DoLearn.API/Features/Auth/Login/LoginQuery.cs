using MediatR;

namespace DoLearn.API.Features.Auth.Login
{
    public sealed record LoginQuery(
        string Email,
        string Password
    ) : IRequest<LoginResponse>;
}