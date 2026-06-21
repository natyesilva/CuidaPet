using CuidaPet.Application.Abstractions;
using CuidaPet.Application.Common.Exceptions;
using CuidaPet.Application.Contracts.Pets;
using CuidaPet.Application.Mappings;
using CuidaPet.Domain.Entities;

namespace CuidaPet.Application.Services;

public sealed class PetService(IPetRepository pets, IUnitOfWork unitOfWork)
{
    public async Task<IReadOnlyList<PetResponse>> ListAsync(Guid userId, CancellationToken cancellationToken) =>
        (await pets.ListByUserAsync(userId, cancellationToken)).Select(x => x.ToResponse()).ToList();

    public async Task<PetResponse> GetAsync(Guid userId, Guid id, CancellationToken cancellationToken)
    {
        var pet = await GetOwnedPetAsync(userId, id, cancellationToken);
        return pet.ToResponse();
    }

    public async Task<PetResponse> CreateAsync(Guid userId, CreatePetRequest request, CancellationToken cancellationToken)
    {
        var pet = new Pet(userId, request.Name, request.Species, request.Breed, request.WeightKg,
            request.BirthDate, request.PhotoUrl, request.Notes);
        await pets.AddAsync(pet, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return pet.ToResponse();
    }

    public async Task<PetResponse> UpdateAsync(Guid userId, Guid id, UpdatePetRequest request, CancellationToken cancellationToken)
    {
        var pet = await GetOwnedPetAsync(userId, id, cancellationToken);
        pet.Update(request.Name, request.Species, request.Breed, request.WeightKg,
            request.BirthDate, request.PhotoUrl, request.Notes);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return pet.ToResponse();
    }

    public async Task DeleteAsync(Guid userId, Guid id, CancellationToken cancellationToken)
    {
        var pet = await GetOwnedPetAsync(userId, id, cancellationToken);
        pets.Remove(pet);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task<Pet> GetOwnedPetAsync(Guid userId, Guid id, CancellationToken cancellationToken)
    {
        var pet = await pets.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("Pet não encontrado.");
        if (pet.UserId != userId)
            throw new ForbiddenException("Você não tem acesso a este pet.");
        return pet;
    }
}
