using FluentValidation;
using DoLearn.API.Features.Auth.Register;

namespace DoLearn.API.Validators
{
    public class CreateUserCommandValidator 
        : AbstractValidator<CreateUserCommand>
    {
        public CreateUserCommandValidator()
        {
            RuleFor(x => x.Password)
                .NotEmpty()
                .MinimumLength(8)
                .Matches(@"(?=.*[A-Z])").WithMessage("Password must contain at least one uppercase letter")
                .Matches(@"(?=.*[a-z])").WithMessage("Password must contain at least one lowercase letter")
                .Matches(@"(?=.*\d)").WithMessage("Password must contain at least one digit")
                .Matches(@"(?=.*[^\w\s])").WithMessage("Password must contain at least one special character");
        }
    }
}