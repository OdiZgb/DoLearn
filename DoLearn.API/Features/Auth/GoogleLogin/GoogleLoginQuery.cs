using DoLearn.API.Features.Auth.Login;
using MediatR;

namespace DoLearn.API.Features.Auth.GoogleLogin
{
    public sealed record GoogleLoginQuery(
        string IdToken
    ) : IRequest<LoginResponse>;
}
