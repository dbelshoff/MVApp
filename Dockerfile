# Usa a imagem oficial do .NET SDK para build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copia o arquivo de projeto e restaura as dependências
COPY *.csproj ./  
RUN dotnet restore

# Copia todos os arquivos e faz o build da aplicação
COPY . .  
RUN dotnet publish -c Release -o /out

# Usa a mesma imagem do SDK para execução (permite rodar dotnet ef dentro do contêiner)
FROM mcr.microsoft.com/dotnet/sdk:8.0
WORKDIR /app

# Instala a ferramenta dotnet-ef
RUN dotnet tool install --global dotnet-ef
ENV PATH="${PATH}:/root/.dotnet/tools"

# Copia os arquivos do build
COPY --from=build /out . 

# Define a porta padrão da aplicação
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# Executa as migrações antes de iniciar o aplicativo
CMD ["sh", "-c", "dotnet ef database update && dotnet MVConsultoria.Web.dll"]

# Comando de inicialização
ENTRYPOINT ["dotnet", "MVConsultoria.Web.dll"]



