#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 9901

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["HZY.WebHost/HZY.WebHost.csproj", "HZY.WebHost/"]
COPY ["HZY.Infrastructure/HZY.Infrastructure.csproj", "HZY.Infrastructure/"]
COPY ["HZY.Controllers.App/HZY.Controllers.App.csproj", "HZY.Controllers.App/"]
COPY ["HZY.EFCore/HZY.EFCore.csproj", "HZY.EFCore/"]
COPY ["HZY.Models/HZY.Models.csproj", "HZY.Models/"]
COPY ["HZY.FreeSqlCore/HZY.FreeSqlCore.csproj", "HZY.FreeSqlCore/"]
COPY ["HZY.Services.Admin/HZY.Services.Admin.csproj", "HZY.Services.Admin/"]
COPY ["HZY.Domain.Services/HZY.Domain.Services.csproj", "HZY.Domain.Services/"]
COPY ["HZY.Controllers.Admin/HZY.Controllers.Admin.csproj", "HZY.Controllers.Admin/"]
RUN dotnet restore "HZY.WebHost/HZY.WebHost.csproj"
COPY . .
WORKDIR "/src/HZY.WebHost"
RUN dotnet build "HZY.WebHost.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "HZY.WebHost.csproj" -c Release -o /app/publish


FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:9901
#解决docker容器时间市区差八小时问题
ENV TZ=Asia/Shanghai
ENTRYPOINT ["dotnet", "HZY.WebHost.dll"]