using System.Net;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using System.Linq;
using System.Threading.Tasks;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;

    public ExceptionHandlingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try 
        {
            await _next(context);
        }
        catch (DuplicateEmailException ex)
        {
            context.Response.StatusCode = (int)HttpStatusCode.Conflict;
            await context.Response.WriteAsJsonAsync(new
            {
                error = "A conflict occurred",
                details = new
                {
                    message = ex.Message,
                    type = ex.GetType().Name,
                    stackTrace = ex.StackTrace
                }
            });
        }
        catch (ValidationException ex)
        {
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            await context.Response.WriteAsJsonAsync(new 
            {
                errors = ex.Errors.Select(e => new 
                {
                    field = e.PropertyName,
                    message = e.ErrorMessage
                })
            });
        }
        catch (Exception ex)
        {
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            await context.Response.WriteAsJsonAsync(new 
            { 
                error = "An unexpected error occurred",
                details = new 
                {
                    message = ex.Message,
                    type = ex.GetType().Name,
                    stackTrace = ex.StackTrace
                }
            });
        }
    }
}
