using CuidaPet.Domain.Common;
using CuidaPet.Domain.Enums;

namespace CuidaPet.Domain.Entities;

public sealed class Treatment : Entity
{
    private Treatment() { }

    public Treatment(
        Guid petId,
        Guid? medicationId,
        string medicationName,
        decimal dose,
        string doseUnit,
        int frequencyHours,
        DateTimeOffset startDate,
        DateTimeOffset endDate,
        string? instructions,
        string? prescribedBy)
    {
        PetId = petId;
        MedicationId = medicationId;
        MedicationName = medicationName.Trim();
        Dose = dose;
        DoseUnit = doseUnit.Trim();
        FrequencyHours = frequencyHours;
        StartDate = startDate;
        EndDate = endDate;
        Instructions = string.IsNullOrWhiteSpace(instructions) ? null : instructions.Trim();
        PrescribedBy = string.IsNullOrWhiteSpace(prescribedBy) ? null : prescribedBy.Trim();
        Status = TreatmentStatus.Active;
        CreatedAt = DateTimeOffset.UtcNow;
        UpdatedAt = CreatedAt;
    }

    public Guid PetId { get; private set; }
    public Guid? MedicationId { get; private set; }
    public string MedicationName { get; private set; } = string.Empty;
    public decimal Dose { get; private set; }
    public string DoseUnit { get; private set; } = string.Empty;
    public int FrequencyHours { get; private set; }
    public DateTimeOffset StartDate { get; private set; }
    public DateTimeOffset EndDate { get; private set; }
    public string? Instructions { get; private set; }
    public string? PrescribedBy { get; private set; }
    public TreatmentStatus Status { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }
    public Pet Pet { get; private set; } = null!;
    public Medication? Medication { get; private set; }
    public ICollection<DoseSchedule> DoseSchedules { get; private set; } = new List<DoseSchedule>();

    public void Cancel()
    {
        if (Status != TreatmentStatus.Active)
            throw new InvalidOperationException("Somente tratamentos ativos podem ser cancelados.");

        Status = TreatmentStatus.Canceled;
        UpdatedAt = DateTimeOffset.UtcNow;

        foreach (var dose in DoseSchedules.Where(x => x.Status == DoseScheduleStatus.Pending))
            dose.Skip("Tratamento cancelado.");
    }

    public void Finish()
    {
        if (Status != TreatmentStatus.Active)
            throw new InvalidOperationException("Somente tratamentos ativos podem ser finalizados.");

        Status = TreatmentStatus.Finished;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}
