namespace CuidaPet.Application.Contracts.Medications;

public sealed record CreateMedicationRequest(string Name, string? Description, string Unit);
public sealed record MedicationResponse(Guid Id, string Name, string? Description, string Unit);
