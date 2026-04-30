# Kubernetes Manifests

Each service is intended to be deployed as an independent Kubernetes workload.

Suggested next step:

```text
infra/k8s/<service-name>/
  deployment.yaml
  service.yaml
  configmap.yaml
  hpa.yaml
```

The starter manifest under `infra/k8s/api-gateway` shows the expected shape.

