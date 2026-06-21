using System.Net;
using CuidaPet.Api.Models;
using CuidaPet.Application.Common.Exceptions;
using FluentValidation;

namespace CuidaPet.Api.Middleware;

public sealed class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            await HandleAsync(context, exception);
        }
    }

    private async Task HandleAsync(HttpContext context, Exception exception)
    {
        var (status, code, details) = exception switch
        {
            ValidationException validation => (
                HttpStatusCode.BadRequest,
                "validation_error",
                validation.Errors.GroupBy(x => x.PropertyName)
                    .ToDictionary(x => x.Key, x => x.Select(error => error.ErrorMessage).ToArray()) as object),
            NotFoundException => (HttpStatusCode.NotFound, "not_found", null),
            ConflictException => (HttpStatusCode.Conflict, "conflict", null),
            ForbiddenException => (HttpStatusCode.Forbidden, "forbidden", null),
            UnauthorizedException or UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "unauthorized", null),
            BusinessRuleException => (HttpStatusCode.UnprocessableEntity, "business_rule", null),
            _ => (HttpStatusCode.InternalServerError, "internal_error", null)
        };

        if (status == HttpStatusCode.InternalServerError)
            logger.LogError(exception, "Erro não tratado durante a requisição.");
        else
            logger.LogWarning(exception, "Requisição rejeitada: {Message}", exception.Message);

        context.Response.StatusCode = (int)status;
        context.Response.ContentType = "application/json";
        var message = status == HttpStatusCode.InternalServerError
            ? "Ocorreu um erro inesperado."
            : exception.Message;
        await context.Response.WriteAsJsonAsync(new ApiError(code, message, details));
    }
}
