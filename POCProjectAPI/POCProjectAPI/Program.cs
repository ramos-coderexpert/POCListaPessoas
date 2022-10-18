using Microsoft.EntityFrameworkCore;
using POCProjectAPI.Configurations;
using POCProjectAPI.Infra.Data.Context;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers().AddJsonOptions(options => options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Setting DBContexts
builder.Services.AddDbContext<AppDBContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddDependencyInjectionConfiguration();
builder.Services.AddAutoMapperConfiguration();
builder.Services.AddSignalR();

builder.Services.AddCors(options => options.AddDefaultPolicy(builder =>
{
    builder.WithOrigins(new[] { "http://localhost:4200", "https://localhost:7029" }).AllowAnyMethod().AllowAnyHeader().AllowCredentials();
}));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthorization();
app.MapControllers();
app.UseEndpoints(endpoints => endpoints.MapHub<HubConfig>("/chat"));

app.Run();