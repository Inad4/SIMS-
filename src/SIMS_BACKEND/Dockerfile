FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /app
COPY . .
WORKDIR /app/SIMS_BACKEND

RUN dotnet tool install --global dotnet-ef --version 9.0.*
ENV PATH="${PATH}:/root/.dotnet/tools"

RUN dotnet restore

RUN dotnet ef database update --context SharedDbContext --project ../SharedModels/SharedModels.csproj --startup-project SIMS_BACKEND.csproj

ENTRYPOINT ["dotnet", "run"]

# RUN dotnet publish -c Release -o /out


# FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
# WORKDIR /app/SIMS_BACKEND
# COPY --from=build /out ./
# EXPOSE 5128
# EXPOSE 8080
# ENTRYPOINT ["dotnet", "SIMS_BACKEND.dll"]
