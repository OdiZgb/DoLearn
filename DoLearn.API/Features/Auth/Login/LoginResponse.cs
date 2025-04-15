namespace DoLearn.API.Features.Auth.Login
{
    public sealed record LoginResponse(
        string Token,
        DateTime Expiration
    );
}