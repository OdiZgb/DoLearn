using MediatR;

namespace DoLearn.API.Features.Auth.VerifyEmail
{
    public sealed record VerifyEmailCommand(string Token) : IRequest<bool>;
}