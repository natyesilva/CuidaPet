using CuidaPet.Application.Contracts.Auth;
using CuidaPet.Application.Contracts.Medications;
using CuidaPet.Application.Contracts.Pets;
using CuidaPet.Application.Contracts.Treatments;
using FluentValidation;

namespace CuidaPet.Application.Validators;

public sealed class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(180);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
    }
}

public sealed class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public sealed class CreatePetRequestValidator : AbstractValidator<CreatePetRequest>
{
    public CreatePetRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Species).NotEmpty().MaximumLength(60);
        RuleFor(x => x.WeightKg).GreaterThan(0);
        RuleFor(x => x.PhotoUrl).MaximumLength(500);
        RuleFor(x => x.Notes).MaximumLength(2000);
    }
}

public sealed class UpdatePetRequestValidator : AbstractValidator<UpdatePetRequest>
{
    public UpdatePetRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Species).NotEmpty().MaximumLength(60);
        RuleFor(x => x.WeightKg).GreaterThan(0);
        RuleFor(x => x.PhotoUrl).MaximumLength(500);
        RuleFor(x => x.Notes).MaximumLength(2000);
    }
}

public sealed class CreateMedicationRequestValidator : AbstractValidator<CreateMedicationRequest>
{
    public CreateMedicationRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Unit).NotEmpty().MaximumLength(40);
        RuleFor(x => x.Description).MaximumLength(1000);
    }
}

public sealed class CreateTreatmentRequestValidator : AbstractValidator<CreateTreatmentRequest>
{
    public CreateTreatmentRequestValidator()
    {
        RuleFor(x => x.PetId).NotEmpty();
        RuleFor(x => x.MedicationName).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Dose).GreaterThan(0)
            .WithMessage("A dose deve ser informada conforme orientação veterinária.");
        RuleFor(x => x.DoseUnit).NotEmpty().MaximumLength(40);
        RuleFor(x => x.FrequencyHours).GreaterThan(0).LessThanOrEqualTo(720);
        RuleFor(x => x.EndDate).GreaterThan(x => x.StartDate);
        RuleFor(x => x.Instructions).MaximumLength(2000);
        RuleFor(x => x.PrescribedBy).MaximumLength(150);
    }
}
