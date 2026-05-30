---
title: "API Gateway / Erweiterung SSO"
client: "Münchener Hypothekenbank"
roles:
  - "Senior/Lead Developer"
  - "DevOps/SecOps Solution Architect"
start: 2023-10-01
end: 2024-02-01
summary: "Erweiterung des MHB SSO/API-Gateways um transparente Absicherung der M2M-/Microservice-Kommunikation via Basic Auth und Anbindung an Ping Identity / Ping Federate."
stack:
  - label: Infrastruktur
    items: [Docker, Portainer, "Spring Cloud Gateway 2023", "Ping Identity OIDC", HAProxy]
  - label: Backend
    items: ["Spring Boot 2.7-3.0", "Spring Security", "Spring Cloud Eureka", Webflux, "MongoDB (Reactive)"]
  - label: Tooling
    items: [IntelliJ, ChatGPT, GitLab, "Docker Compose", "Java 11-17"]
tags: ["Spring Cloud", SSO, OIDC, "Ping Identity", Microservices]
---

Erweiterung des MHB SSO/API-Gateways um transparente Absicherung der
M2M-/Microservice-Kommunikation via Basic Auth und Anbindung an Ping Identity /
Ping Federate. Erweiterung der Service Discovery (Eureka) und Generalisierung der
Spring-Konfiguration für alle Client-Services.
