namespace CuidaPet.Application.Contracts.Pets;

public sealed record CreatePetRequest(
    string Name,
    string Species,
    string? Breed,
    decimal WeightKg,
    DateOnly? BirthDate,
    string? PhotoUrl,
    string? Notes);

public sealed record UpdatePetRequest(
    string Name,
    string Species,
    string? Breed,
    decimal WeightKg,
    DateOnly? BirthDate,
    string? PhotoUrl,
    string? Notes);

public sealed record PetResponse(
    Guid Id,
    string Name,
    string Species,
    string? Breed,
    decimal WeightKg,
    DateOnly? BirthDate,
    string? PhotoUrl,
    string? Notes,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
