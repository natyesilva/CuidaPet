using CuidaPet.Application.Abstractions;
using CuidaPet.Application.Common.Exceptions;
using CuidaPet.Application.Contracts.Doses;
using CuidaPet.Application.Mappings;
using CuidaPet.Domain.Entities;

namespace CuidaPet.Application.Services;

public sealed class DoseService(IDoseScheduleRepository doses, IUnitOfWork unitOfWork)
{
    public async Task<IReadOnlyList<DoseResponse>> ListTodayAsync(
        Guid userId,
        DateTimeOffset day,
        CancellationToken cancellationToken) =>
        (await doses.ListTodayByUserAsync(userId, day, cancellationToken))
            .Select(x => x.ToResponse()).ToList();

    public async Task<IReadOnlyList<DoseResponse>> ListPendingAsync(Guid userId, CancellationToken cancellationToken) =>
        (await doses.ListPendingByUserAsync(userId, cancellationToken))
            .Select(x => x.ToResponse()).ToList();

    public async Task<DoseResponse> ApplyAsync(
        Guid userId,
        Guid id,
        ApplyDoseRequest request,
        CancellationToken cancellationToken)
    {
        var dose = await GetOwnedDoseAsync(userId, id, cancellationToken);
        try
        {
            dose.Apply(userId, request.Notes);
        }
        catch (InvalidOperationException exception)
        {
            throw new BusinessRuleException(exception.Message);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return dose.ToResponse();
    }

    public async Task<DoseResponse> SkipAsync(
        Guid userId,
        Guid id,
        SkipDoseRequest request,
        CancellationToken cancellationToken)
    {
        var dose = await GetOwnedDoseAsync(userId, id, cancellationToken);
        try
        {
            dose.Skip(request.Notes);
        }
        catch (InvalidOperationException exception)
        {
            throw new BusinessRuleException(exception.Message);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return dose.ToResponse();
    }

    private async Task<DoseSchedule> GetOwnedDoseAsync(Guid userId, Guid id, CancellationToken cancellationToken)
    {
        var dose = await doses.GetByIdWithTreatmentAsync(id, cancellationToken)
            ?? throw new NotFoundException("Dose não encontrada.");
        if (dose.Treatment.Pet.UserId != userId)
            throw new ForbiddenException("Você não tem acesso a esta dose.");
        return dose;
    }
}
