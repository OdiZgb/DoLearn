using System.Net;
using FluentValidation;
using Microsoft.AspNetCore.Http;
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
            await context.Response.WriteAsJsonAsync(new { error = ex.Message });
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
                details = ex.Message
            });
        }
    }
}