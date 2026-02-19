# Method Enterprise Builder Planning — Cursor AI

> **Una metodología granular de planificación y construcción de software enterprise-grade, de misión crítica y alta disponibilidad, diseñada para agentes Cursor AI.**

Licencia: MIT | Compatible con Cursor | Idioma: ES/EN

**Autor:** Francisco J Bernades  
**GitHub:** [@exchanet](https://github.com/exchanet)  
**Repositorio:** [method_enterprise_builder_planning_cursor](https://github.com/exchanet/method_enterprise_builder_planning_cursor)

---

## Recomendado usar en combinación con

- [Method Modular Design](https://github.com/exchanet/method_modular_design_cursor) — Patrón de arquitectura Core + Packs
- [Método PDCA-T](https://github.com/exchanet/method_pdca-t_coding_Cursor) — Ciclo de aseguramiento de calidad (cobertura de tests ≥99%)

---

## ¿Qué es esto?

**Method Enterprise Builder Planning** es un módulo de Cursor AI (Rules + Skills + Packs) que proporciona un **marco sistemático y granular para planificar y construir software enterprise**.

El nombre **Builder** refleja el propósito dual del método: no solo *planifica*, sino que guía la *construcción completa* del software enterprise, desde el análisis de contexto inicial hasta las decisiones de arquitectura, el endurecimiento de seguridad, la estrategia de tests y la entrega con evidencia.

### Niveles de calidad de software objetivo

| Estándar | Descripción |
|---|---|
| Enterprise-grade | Alta carga de usuarios, transacciones complejas, estándares de seguridad estrictos |
| Software de misión crítica | Tolerancia cero al tiempo de inactividad, prevención de fallos catastróficos |
| Alta disponibilidad (HA) | Arquitectura con 99.999% de uptime (5 nines) |
| Seguridad por diseño | Seguridad integrada desde la arquitectura, no añadida al final |
| Ingeniería de sistemas escalables | Capacidad para manejar crecimiento masivo de datos y transacciones |
| Cumplimiento ACID | Atomicidad, Consistencia, Aislamiento, Durabilidad en todas las transacciones |
| RegTech / Compliance | ISO 27001, ISO/IEC 25000 (SQuaRE), CMMI nivel 3+, RGPD, SOC2, PCI-DSS |

---

## Inicio rápido

### Instalación express (recomendado)

1. Descarga este repositorio como `.zip` desde [GitHub](https://github.com/exchanet/method_enterprise_builder_planning_cursor) y descomprímelo
2. Copia la ruta de la carpeta descomprimida — por ejemplo: `C:\Users\tu-nombre\Downloads\method-enterprise_builder_planning`
3. Abre Cursor → Nuevo chat de agente
4. Pega la ruta y escribe:

```
Instala este método para que pueda utilizarlo en Cursor: C:\Users\tu-nombre\Downloads\method-enterprise_builder_planning
```

5. Cierra y vuelve a abrir Cursor
6. Para utilizarlo directamente, escribe en cualquier chat: `/method-enterprise_builder`

### Instalación manual

```bash
# Clonar repositorio
git clone https://github.com/exchanet/method_enterprise_builder_planning_cursor.git
cd method_enterprise_builder_planning_cursor

# Copiar a tu proyecto
cp -r .cursor /ruta/a/tu/proyecto/
```

Instala también los métodos complementarios:

```bash
# Method Modular Design (patrón Core + Packs)
git clone https://github.com/exchanet/method_modular_design_cursor.git
cp -r method_modular_design_cursor/.cursor /ruta/a/tu/proyecto/

# Método PDCA-T (ciclo de aseguramiento de calidad)
git clone https://github.com/exchanet/method_pdca-t_coding_Cursor.git
cp -r method_pdca-t_coding_Cursor/.cursor/rules/METODO-PDCA-T.md /ruta/a/tu/proyecto/.cursor/rules/
cp -r method_pdca-t_coding_Cursor/.cursor/skills/metodo-pdca-t /ruta/a/tu/proyecto/.cursor/skills/
```

---

## Activación

Una vez instalado, activa con cualquiera de estas frases:

```
/method-enterprise_builder

"Planifica feature enterprise: [descripción]"
"Diseña sistema de misión crítica: [tipo de sistema]"
"Crea módulo ACID-compliant para [feature]"
"Construye componente de alta disponibilidad con SLA 99.99%"
"Implementa módulo con seguridad por diseño, audit trail y cumplimiento RGPD"
```

Cursor te guiará automáticamente a través del ciclo completo de 8 fases.

---

## El Ciclo Builder de 8 Fases

```
FASE 1: Análisis de Contexto Enterprise
         │  Clasificación del sistema · Stakeholders · Entorno regulatorio
         ▼
FASE 2: Requisitos No Funcionales (RNF)
         │  SLOs de rendimiento · SLA de disponibilidad · Escalabilidad · Seguridad
         ▼
FASE 3: Matriz de Riesgos
         │  Modelo de amenazas STRIDE · Catálogo de riesgos técnicos · Mitigaciones
         ▼
FASE 4: Descomposición en Micro-Tareas (PDCA-T)
         │  Feature → Dominio → Capa → Micro-tareas ≤50 líneas con DAG de dependencias
         ▼
FASE 5: Decisiones de Arquitectura (ADR)
         │  Selección de patrón · Diagramas C4 · Mapeo a Packs · ADR por decisión
         ▼
FASE 6: Seguridad y Mapeo de Compliance
         │  STRIDE por módulo · Matriz RBAC · Fronteras ACID · Matriz de compliance
         ▼
FASE 7: Estrategia de Tests
         │  Pirámide de tests · Quality gates · Tests de carga · CI/CD gates
         ▼
FASE 8: Reporte de Entrega
         │  Sign-off con evidencia · Métricas de tests · Seguridad · Checklist de compliance
```

---

## Estructura del Repositorio

```
method-enterprise_builder_planning/
├── .cursor/
│   ├── rules/
│   │   ├── METHOD-ENTERPRISE-BUILDER-PLANNING.md  ← regla principal (trigger: manual)
│   │   ├── ENTERPRISE_ARCHITECTURE.md
│   │   ├── ENTERPRISE_SECURITY.md
│   │   ├── ENTERPRISE_SCALABILITY.md
│   │   ├── ENTERPRISE_COMPLIANCE.md
│   │   ├── ENTERPRISE_TESTING.md
│   │   └── ENTERPRISE_MICROTASK_PLANNER.md
│   └── skills/
│       └── method-enterprise-builder-planning/
│           ├── SKILL.md                        ← skill orquestador principal
│           ├── architecture-planning.md
│           ├── security-planning.md
│           ├── scalability-planning.md
│           ├── compliance-planning.md
│           ├── microtask-decomposition.md
│           ├── testing-strategy.md
│           └── delivery-report.md
├── core/
│   └── planning-engine/                        ← capa Core (solo infraestructura)
├── packs/
│   ├── enterprise-architecture-pack/
│   ├── security-compliance-pack/
│   ├── high-availability-pack/
│   ├── testing-coverage-pack/
│   └── acid-compliance-pack/
├── examples/
│   ├── banking-system-plan.md
│   ├── high-availability-saas-plan.md
│   └── mission-critical-api-plan.md
├── docs/
│   ├── INSTALLATION.md
│   ├── USAGE.md
│   └── ENTERPRISE-STANDARDS-REFERENCE.md
├── README.md
└── README.es.md
```

---

## Packs disponibles

| Pack | Activado en fase | Proporciona |
|---|---|---|
| `enterprise-architecture-pack` | Fase 5 | Plantillas ADR, diagramas C4, árboles de decisión |
| `security-compliance-pack` | Fase 3, 6 | Plantillas STRIDE, matrices RBAC, checklists de auditoría |
| `high-availability-pack` | Fase 2, 5 | Definiciones SLA/SLO, estrategias de failover, chaos engineering |
| `testing-coverage-pack` | Fase 4, 7 | Pirámide de tests, requisitos de cobertura, plantillas k6 |
| `acid-compliance-pack` | Fase 4, 6 | Fronteras de transacción, estrategias rollback, idempotencia |

---

## Métodos relacionados

| Método | Rol |
|---|---|
| [Method Modular Design](https://github.com/exchanet/method_modular_design_cursor) | Patrón de arquitectura (Core + Packs) usado en todo el código generado |
| [Método PDCA-T](https://github.com/exchanet/method_pdca-t_coding_Cursor) | Ciclo de calidad (cobertura ≥99%) aplicado a cada micro-tarea |

---

## Licencia

MIT — ver archivo [LICENSE](LICENSE).

---

## Autor

**Francisco J Bernades**  
GitHub: [@exchanet](https://github.com/exchanet)
