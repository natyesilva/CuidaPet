using CuidaPet.Application.Abstractions;
using CuidaPet.Application.Common.Exceptions;
using CuidaPet.Application.Contracts.Medications;
using CuidaPet.Application.Mappings;
using CuidaPet.Domain.Entities;

namespace CuidaPet.Application.Services;

public sealed class MedicationService(IMedicationRepository medications, IUnitOfWork unitOfWork)
{
    public async Task<IReadOnlyList<MedicationResponse>> ListAsync(CancellationToken cancellationToken) =>
        (await medications.ListAsync(cancellationToken)).Select(x => x.ToResponse()).ToList();

    public async Task<MedicationResponse> CreateAsync(CreateMedicationRequest request, CancellationToken cancellationToken)
    {
        if (await medications.ExistsByNameAsync(request.Name.Trim(), cancellationToken))
            throw new ConflictException("Já existe um medicamento com este nome.");

        var medication = new Medication(request.Name, request.Description, request.Unit);
        await medications.AddAsync(medication, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return medication.ToResponse();
    }
}
