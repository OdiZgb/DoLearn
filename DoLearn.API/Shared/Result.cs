// Shared/Result.cs
namespace DoLearn.API.Shared
{
    public class Result<T>
    {
        public bool IsSuccess { get; }
        public T Value { get; }
        public IEnumerable<string> Errors { get; }

        private Result(T value, bool isSuccess, IEnumerable<string> errors)
        {
            Value = value;
            IsSuccess = isSuccess;
            Errors = errors;
        }

        public static Result<T> Success(T value) => new Result<T>(value, true, Array.Empty<string>());
        public static Result<T> Failure(IEnumerable<string> errors) => new Result<T>(default!, false, errors);

        public TResult Match<TResult>(
            Func<T, TResult> success,
            Func<IEnumerable<string>, TResult> failure) =>
            IsSuccess ? success(Value!) : failure(Errors);
    }
}