using CuidaPet.Application.Abstractions;
using CuidaPet.Application.Common.Exceptions;
using CuidaPet.Application.Contracts.Treatments;
using CuidaPet.Application.Mappings;
using CuidaPet.Domain.Entities;

namespace CuidaPet.Application.Services;

public sealed class TreatmentService(
    ITreatmentRepository treatments,
    IPetRepository pets,
    IMedicationRepository medications,
    IUnitOfWork unitOfWork)
{
    public async Task<IReadOnlyList<TreatmentResponse>> ListAsync(Guid userId, CancellationToken cancellationToken) =>
        (await treatments.ListByUserAsync(userId, cancellationToken))
            .Select(x => x.ToResponse(includeDoses: false))
            .ToList();

    public async Task<TreatmentResponse> GetAsync(Guid userId, Guid id, CancellationToken cancellationToken)
    {
        var treatment = await GetOwnedTreatmentAsync(userId, id, cancellationToken);
        return treatment.ToResponse();
    }

    public async Task<TreatmentResponse> CreateAsync(
        Guid userId,
        CreateTreatmentRequest request,
        CancellationToken cancellationToken)
    {
        var pet = await pets.GetByIdAsync(request.PetId, cancellationToken)
            ?? throw new NotFoundException("Pet não encontrado.");
        if (pet.UserId != userId)
            throw new ForbiddenException("Você não pode criar tratamentos para este pet.");

        Medication? medication = null;
        if (request.MedicationId.HasValue)
        {
            medication = await medications.GetByIdAsync(request.MedicationId.Value, cancellationToken)
                ?? throw new NotFoundException("Medicamento não encontrado.");
        }

        var medicationName = medication?.Name ?? request.MedicationName;
        var treatment = new Treatment(
            request.PetId,
            request.MedicationId,
            medicationName,
            request.Dose,
            request.DoseUnit,
            request.FrequencyHours,
            request.StartDate,
            request.EndDate,
            request.Instructions,
            request.PrescribedBy);

        for (var scheduledAt = request.StartDate;
             scheduledAt <= request.EndDate;
             scheduledAt = scheduledAt.AddHours(request.FrequencyHours))
        {
            treatment.DoseSchedules.Add(new DoseSchedule(treatment.Id, scheduledAt));
        }

        await treatments.AddAsync(treatment, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var created = await treatments.GetByIdWithDetailsAsync(treatment.Id, cancellationToken)
            ?? throw new NotFoundException("Não foi possível carregar o tratamento criado.");
        return created.ToResponse();
    }

    public async Task<TreatmentResponse> CancelAsync(Guid userId, Guid id, CancellationToken cancellationToken)
    {
        var treatment = await GetOwnedTreatmentAsync(userId, id, cancellationToken);
        try
        {
            treatment.Cancel();
        }
        catch (InvalidOperationException exception)
        {
            throw new BusinessRuleException(exception.Message);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return treatment.ToResponse();
    }

    public async Task<TreatmentResponse> FinishAsync(Guid userId, Guid id, CancellationToken cancellationToken)
    {
        var treatment = await GetOwnedTreatmentAsync(userId, id, cancellationToken);
        try
        {
            treatment.Finish();
        }
        catch (InvalidOperationException exception)
        {
            throw new BusinessRuleException(exception.Message);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return treatment.ToResponse();
    }

    private async Task<Treatment> GetOwnedTreatmentAsync(Guid userId, Guid id, CancellationToken cancellationToken)
    {
        var treatment = await treatments.GetByIdWithDetailsAsync(id, cancellationToken)
            ?? throw new NotFoundException("Tratamento não encontrado.");
        if (treatment.Pet.UserId != userId)
            throw new ForbiddenException("Você não tem acesso a este tratamento.");
        return treatment;
    }
}
