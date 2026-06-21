using CuidaPet.Domain.Enums;

namespace CuidaPet.Application.Contracts.Doses;

public sealed record ApplyDoseRequest(string? Notes);
public sealed record SkipDoseRequest(string? Notes);

public sealed record DoseResponse(
    Guid Id,
    Guid TreatmentId,
    Guid PetId,
    string PetName,
    string MedicationName,
    decimal Dose,
    string DoseUnit,
    DateTimeOffset ScheduledAt,
    DoseScheduleStatus Status,
    DateTimeOffset? AppliedAt,
    Guid? AppliedByUserId,
    string? Notes);
