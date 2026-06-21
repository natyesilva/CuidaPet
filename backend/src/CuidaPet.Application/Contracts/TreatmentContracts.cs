using CuidaPet.Application.Contracts.Doses;
using CuidaPet.Domain.Enums;

namespace CuidaPet.Application.Contracts.Treatments;

public sealed record CreateTreatmentRequest(
    Guid PetId,
    Guid? MedicationId,
    string MedicationName,
    decimal Dose,
    string DoseUnit,
    int FrequencyHours,
    DateTimeOffset StartDate,
    DateTimeOffset EndDate,
    string? Instructions,
    string? PrescribedBy);

public sealed record TreatmentResponse(
    Guid Id,
    Guid PetId,
    string PetName,
    Guid? MedicationId,
    string MedicationName,
    decimal Dose,
    string DoseUnit,
    int FrequencyHours,
    DateTimeOffset StartDate,
    DateTimeOffset EndDate,
    string? Instructions,
    string? PrescribedBy,
    TreatmentStatus Status,
    DateTimeOffset CreatedAt,
    IReadOnlyList<DoseResponse> Doses);
