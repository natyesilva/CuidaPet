using CuidaPet.Application.Services;
using CuidaPet.Application.Validators;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace CuidaPet.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();
        services.AddScoped<AuthService>();
        services.AddScoped<PetService>();
        services.AddScoped<MedicationService>();
        services.AddScoped<TreatmentService>();
        services.AddScoped<DoseService>();
        return services;
    }
}
