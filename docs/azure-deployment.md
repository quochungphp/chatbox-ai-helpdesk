# Azure Deployment And CI/CD

## Delivery Model

- GitHub Free hosts the source repository.
- Azure DevOps Pipelines validates pull requests and deploys approved builds.
- Azure Container Registry stores versioned images.
- Azure Key Vault or linked Azure DevOps Variable Groups store secrets.
- Dev, staging, and production are separate Azure DevOps Environments.

## Deployment Paths

Simple demo path:

- Frontend: Azure Static Web Apps or Azure App Service.
- Backend services: Azure App Service for Containers.
- Data: Azure Database for PostgreSQL and Azure Cache for Redis.

Advanced path:

- Frontend and backend services run as containers on AKS.
- Azure Service Bus replaces local RabbitMQ.
- Azure Monitor, Application Insights, and Log Analytics capture telemetry.

## Image Strategy

Images are tagged with:

- `$(Build.BuildId)`
- `$(Build.SourceBranchName)-$(Build.BuildId)`
- `latest` only for non-production convenience

Build once, promote the same image tag across environments.

## Rollback

Rollback means redeploying the previous known-good image tag from ACR. Production deployments should require manual approval through Azure DevOps Environments.

