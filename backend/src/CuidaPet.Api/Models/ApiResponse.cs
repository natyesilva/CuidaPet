namespace CuidaPet.Api.Models;

public sealed record ApiResponse<T>(T Data);
public sealed record ApiError(string Code, string Message, object? Details = null);
