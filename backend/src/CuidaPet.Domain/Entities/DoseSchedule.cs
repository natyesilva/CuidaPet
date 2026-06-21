using CuidaPet.Domain.Common;
using CuidaPet.Domain.Enums;

namespace CuidaPet.Domain.Entities;

public sealed class DoseSchedule : Entity
{
    private DoseSchedule() { }

    public DoseSchedule(Guid treatmentId, DateTimeOffset scheduledAt)
    {
        TreatmentId = treatmentId;
        ScheduledAt = scheduledAt;
        Status = DoseScheduleStatus.Pending;
    }

    public Guid TreatmentId { get; private set; }
    public DateTimeOffset ScheduledAt { get; private set; }
    public DoseScheduleStatus Status { get; private set; }
    public DateTimeOffset? AppliedAt { get; private set; }
    public Guid? AppliedByUserId { get; private set; }
    public string? Notes { get; private set; }
    public Treatment Treatment { get; private set; } = null!;
    public User? AppliedByUser { get; private set; }

    public void Apply(Guid userId, string? notes)
    {
        if (Status == DoseScheduleStatus.Applied)
            throw new InvalidOperationException("Esta dose já foi aplicada.");
        if (Status != DoseScheduleStatus.Pending)
            throw new InvalidOperationException("Somente doses pendentes podem ser aplicadas.");

        Status = DoseScheduleStatus.Applied;
        AppliedAt = DateTimeOffset.UtcNow;
        AppliedByUserId = userId;
        Notes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();
    }

    public void Skip(string? notes)
    {
        if (Status != DoseScheduleStatus.Pending)
            throw new InvalidOperationException("Somente doses pendentes podem ser ignoradas.");

        Status = DoseScheduleStatus.Skipped;
        Notes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();
    }
}
