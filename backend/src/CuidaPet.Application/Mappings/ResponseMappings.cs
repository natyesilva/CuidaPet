using CuidaPet.Application.Contracts.Doses;
using CuidaPet.Application.Contracts.Medications;
using CuidaPet.Application.Contracts.Pets;
using CuidaPet.Application.Contracts.Treatments;
using CuidaPet.Domain.Entities;

namespace CuidaPet.Application.Mappings;

public static class ResponseMappings
{
    public static PetResponse ToResponse(this Pet pet) =>
        new(pet.Id, pet.Name, pet.Species, pet.Breed, pet.WeightKg, pet.BirthDate,
            pet.PhotoUrl, pet.Notes, pet.CreatedAt, pet.UpdatedAt);

    public static MedicationResponse ToResponse(this Medication medication) =>
        new(medication.Id, medication.Name, medication.Description, medication.Unit);

    public static DoseResponse ToResponse(this DoseSchedule dose) =>
        new(dose.Id, dose.TreatmentId, dose.Treatment.PetId, dose.Treatment.Pet.Name,
            dose.Treatment.MedicationName, dose.Treatment.Dose, dose.Treatment.DoseUnit,
            dose.ScheduledAt, dose.Status, dose.AppliedAt, dose.AppliedByUserId, dose.Notes);

    public static TreatmentResponse ToResponse(this Treatment treatment, bool includeDoses = true) =>
        new(treatment.Id, treatment.PetId, treatment.Pet.Name, treatment.MedicationId,
            treatment.MedicationName, treatment.Dose, treatment.DoseUnit, treatment.FrequencyHours,
            treatment.StartDate, treatment.EndDate, treatment.Instructions, treatment.PrescribedBy,
            treatment.Status, treatment.CreatedAt,
            includeDoses
                ? treatment.DoseSchedules.OrderBy(x => x.ScheduledAt).Select(x => x.ToResponse()).ToList()
                : []);
}
