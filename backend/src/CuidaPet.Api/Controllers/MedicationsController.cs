using CuidaPet.Api.Models;
using CuidaPet.Application.Contracts.Medications;
using CuidaPet.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CuidaPet.Api.Controllers;

[Route("api/medications")]
[Authorize]
public sealed class MedicationsController(MedicationService service) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken cancellationToken) =>
        Ok(new ApiResponse<IReadOnlyList<MedicationResponse>>(
            await service.ListAsync(cancellationToken)));

    [HttpPost]
    public async Task<IActionResult> Create(CreateMedicationRequest request, CancellationToken cancellationToken)
    {
        var response = await service.CreateAsync(request, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, new ApiResponse<MedicationResponse>(response));
    }
}
