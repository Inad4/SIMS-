FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /app
COPY ../ .
RUN cd ./SIMS_BACKEND
RUN dotnet publish -c Release -o /out


FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app/SIMS_BACKEND
COPY --from=build /out ./
EXPOSE 8080
ENTRYPOINT ["dotnet", "SIMS_BACKEND.dll"]
