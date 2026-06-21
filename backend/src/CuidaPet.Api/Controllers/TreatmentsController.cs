using CuidaPet.Api.Models;
using CuidaPet.Application.Contracts.Treatments;
using CuidaPet.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CuidaPet.Api.Controllers;

[Route("api/treatments")]
[Authorize]
public sealed class TreatmentsController(TreatmentService service) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken cancellationToken) =>
        Ok(new ApiResponse<IReadOnlyList<TreatmentResponse>>(
            await service.ListAsync(CurrentUserId, cancellationToken)));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken) =>
        Ok(new ApiResponse<TreatmentResponse>(
            await service.GetAsync(CurrentUserId, id, cancellationToken)));

    /// <summary>
    /// Cria um tratamento e gera automaticamente a agenda. A API não calcula dosagem médica.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create(CreateTreatmentRequest request, CancellationToken cancellationToken)
    {
        var response = await service.CreateAsync(CurrentUserId, request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = response.Id }, new ApiResponse<TreatmentResponse>(response));
    }

    [HttpPut("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken cancellationToken) =>
        Ok(new ApiResponse<TreatmentResponse>(
            await service.CancelAsync(CurrentUserId, id, cancellationToken)));

    [HttpPut("{id:guid}/finish")]
    public async Task<IActionResult> Finish(Guid id, CancellationToken cancellationToken) =>
        Ok(new ApiResponse<TreatmentResponse>(
            await service.FinishAsync(CurrentUserId, id, cancellationToken)));
}
