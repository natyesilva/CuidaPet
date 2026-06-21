using CuidaPet.Api.Models;
using CuidaPet.Application.Contracts.Auth;
using CuidaPet.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CuidaPet.Api.Controllers;

[Route("api/auth")]
[AllowAnonymous]
public sealed class AuthController(AuthService service) : ApiControllerBase
{
    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        var response = await service.RegisterAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, new ApiResponse<AuthResponse>(response));
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken cancellationToken) =>
        Ok(new ApiResponse<AuthResponse>(await service.LoginAsync(request, cancellationToken)));
}
