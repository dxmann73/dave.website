---
needs_translation: true
title: "API Gateway / OpenID Connect / SSO"
client: "Münchener Hypothekenbank"
roles:
  - "Senior/Lead Developer"
  - "DevOps/SecOps Solution Architect"
start: 2020-11-01
end: 2021-11-01
summary: "Konzeption, Design und Aufbau einer integrierten SSO/API-Gateway-Lösung zur Absicherung der Microservice-internen Kommunikation und Integration der Front- und Backend-Services in das bestehende SSO (Kerberos/LDAP) via Keycloak OAuth2/JWT."
stack:
  - label: Infrastruktur
    items:
      [
        "Keycloak 12",
        "Spring Cloud Gateway 2020.0.1 (Ilford)",
        Docker,
        Portainer,
        HAProxy,
        PGP,
      ]
  - label: Backend
    items:
      [
        "Spring Boot 2.4-2.6",
        "Spring Security",
        "Spring Cloud Netflix Eureka",
        Webflux,
        "MongoDB (Reactive)",
      ]
  - label: Frontend
    items: ["React 17 (hooks)", "React Router", "Styled Components", Storybook]
  - label: Tooling
    items:
      [
        IntelliJ,
        GitLab,
        Sonar,
        "Nexus/Artifactory",
        mvn,
        "JUnit 5",
        npm,
        "NodeJS 14",
        "Java 11",
      ]
tags: ["Spring Cloud", SSO, OIDC, Keycloak, Microservices]
---

Konzeption, Design und Aufbau einer integrierten SSO/API-Gateway-Lösung zur
Absicherung der Microservice-internen Kommunikation sowie Integration der Front-
und Backend-Services in das bestehende SSO (Kerberos/LDAP) mittels Keycloak
OAuth2/JWT. Aufbau der Service Discovery (Eureka). Konzeption und Aufbau von
React-HOCs für API-Zugriffe / Portal.
