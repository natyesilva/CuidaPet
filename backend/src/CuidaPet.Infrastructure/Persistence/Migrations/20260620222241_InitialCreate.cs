using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CuidaPet.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "medications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Unit = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_medications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Email = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "pets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Species = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    Breed = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    WeightKg = table.Column<decimal>(type: "numeric(8,2)", precision: 8, scale: 2, nullable: false),
                    BirthDate = table.Column<DateOnly>(type: "date", nullable: true),
                    PhotoUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_pets_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "treatments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PetId = table.Column<Guid>(type: "uuid", nullable: false),
                    MedicationId = table.Column<Guid>(type: "uuid", nullable: true),
                    MedicationName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Dose = table.Column<decimal>(type: "numeric(10,3)", precision: 10, scale: 3, nullable: false),
                    DoseUnit = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    FrequencyHours = table.Column<int>(type: "integer", nullable: false),
                    StartDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Instructions = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    PrescribedBy = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_treatments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_treatments_medications_MedicationId",
                        column: x => x.MedicationId,
                        principalTable: "medications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_treatments_pets_PetId",
                        column: x => x.PetId,
                        principalTable: "pets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "dose_schedules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TreatmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    ScheduledAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    AppliedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    AppliedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Notes = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dose_schedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_dose_schedules_treatments_TreatmentId",
                        column: x => x.TreatmentId,
                        principalTable: "treatments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_dose_schedules_users_AppliedByUserId",
                        column: x => x.AppliedByUserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "medications",
                columns: new[] { "Id", "Description", "Name", "Unit" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000001"), "Medicamento de referência. Use somente conforme prescrição veterinária.", "Prednisolona", "ml" },
                    { new Guid("10000000-0000-0000-0000-000000000002"), "Medicamento de referência. Use somente conforme prescrição veterinária.", "Dipirona", "mg" },
                    { new Guid("10000000-0000-0000-0000-000000000003"), "Categoria de referência. Use somente conforme prescrição veterinária.", "Antibiótico", "comprimido" },
                    { new Guid("10000000-0000-0000-0000-000000000004"), "Categoria de referência. Use somente conforme prescrição veterinária.", "Vermífugo", "comprimido" },
                    { new Guid("10000000-0000-0000-0000-000000000005"), "Categoria de referência. Use somente conforme orientação veterinária.", "Suplemento", "ml" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_dose_schedules_AppliedByUserId",
                table: "dose_schedules",
                column: "AppliedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_dose_schedules_Status_ScheduledAt",
                table: "dose_schedules",
                columns: new[] { "Status", "ScheduledAt" });

            migrationBuilder.CreateIndex(
                name: "IX_dose_schedules_TreatmentId_ScheduledAt",
                table: "dose_schedules",
                columns: new[] { "TreatmentId", "ScheduledAt" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_medications_Name",
                table: "medications",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_pets_UserId",
                table: "pets",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_treatments_MedicationId",
                table: "treatments",
                column: "MedicationId");

            migrationBuilder.CreateIndex(
                name: "IX_treatments_PetId",
                table: "treatments",
                column: "PetId");

            migrationBuilder.CreateIndex(
                name: "IX_users_Email",
                table: "users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "dose_schedules");

            migrationBuilder.DropTable(
                name: "treatments");

            migrationBuilder.DropTable(
                name: "medications");

            migrationBuilder.DropTable(
                name: "pets");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
