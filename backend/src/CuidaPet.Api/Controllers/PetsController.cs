using CuidaPet.Api.Models;
using CuidaPet.Application.Contracts.Pets;
using CuidaPet.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CuidaPet.Api.Controllers;

[Route("api/pets")]
[Authorize]
public sealed class PetsController(PetService service) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(CancellationToken cancellationToken) =>
        Ok(new ApiResponse<IReadOnlyList<PetResponse>>(
            await service.ListAsync(CurrentUserId, cancellationToken)));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken) =>
        Ok(new ApiResponse<PetResponse>(
            await service.GetAsync(CurrentUserId, id, cancellationToken)));

    [HttpPost]
    public async Task<IActionResult> Create(CreatePetRequest request, CancellationToken cancellationToken)
    {
        var response = await service.CreateAsync(CurrentUserId, request, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = response.Id }, new ApiResponse<PetResponse>(response));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdatePetRequest request, CancellationToken cancellationToken) =>
        Ok(new ApiResponse<PetResponse>(
            await service.UpdateAsync(CurrentUserId, id, request, cancellationToken)));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await service.DeleteAsync(CurrentUserId, id, cancellationToken);
        return NoContent();
    }
}
