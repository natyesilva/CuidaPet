using CuidaPet.Api.Models;
using CuidaPet.Application.Contracts.Doses;
using CuidaPet.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CuidaPet.Api.Controllers;

[Route("api/doses")]
[Authorize]
public sealed class DosesController(DoseService service) : ApiControllerBase
{
    [HttpGet("today")]
    public async Task<IActionResult> Today(
        [FromQuery] DateTimeOffset? date,
        CancellationToken cancellationToken) =>
        Ok(new ApiResponse<IReadOnlyList<DoseResponse>>(
            await service.ListTodayAsync(CurrentUserId, date ?? DateTimeOffset.UtcNow, cancellationToken)));

    [HttpGet("pending")]
    public async Task<IActionResult> Pending(CancellationToken cancellationToken) =>
        Ok(new ApiResponse<IReadOnlyList<DoseResponse>>(
            await service.ListPendingAsync(CurrentUserId, cancellationToken)));

    [HttpPut("{id:guid}/apply")]
    public async Task<IActionResult> Apply(Guid id, ApplyDoseRequest request, CancellationToken cancellationToken) =>
        Ok(new ApiResponse<DoseResponse>(
            await service.ApplyAsync(CurrentUserId, id, request, cancellationToken)));

    [HttpPut("{id:guid}/skip")]
    public async Task<IActionResult> Skip(Guid id, SkipDoseRequest request, CancellationToken cancellationToken) =>
        Ok(new ApiResponse<DoseResponse>(
            await service.SkipAsync(CurrentUserId, id, request, cancellationToken)));
}
