# Documentación de investigación

Este directorio reúne la investigación previa al plan de implementación de Hospital Patagonia. Su objetivo es separar las reglas observadas, las inferencias y las decisiones propuestas antes de construir el producto.

## Especificación y plan

1. [Especificación de producto](./product-spec.md)
2. [Game Design Document](./game-design-document.md)
3. [Modelo de dominio](./domain-model.md)
4. [Plan de implementación](./implementation-plan.md)
5. [Criterios de aceptación](./acceptance-criteria.md)
6. [Architecture Decision Records](./architecture-decisions/README.md)

## Investigación de base

1. [Fuentes y alcance](./sources-and-scope.md)
2. [Reglas de la simulación](./simulation-rules.md)
3. [Auditoría de la webapp actual](./current-webapp-audit.md)
4. [Lectura de códigos QR](./qr-codes.md)
5. [Inventario visual y reconstrucción 3D](./visual-reference.md)
6. [Concepto de videojuego](./game-concept.md)
7. [Stack y arquitectura propuestos](./technical-architecture.md)
8. [Preguntas abiertas](./open-questions.md)

## Estado

- Investigación documental: completa para las fuentes recibidas.
- Inspección del bundle público de la webapp: completa, con las limitaciones indicadas en la auditoría.
- Inventario de las 17 fotografías: completo.
- Lectura de los cinco QR visibles: completa.
- Especificación y plan de implementación: completos con supuestos provisionales explícitos.
- Implementación: pendiente; la próxima etapa es `M0 - Foundation`.

## Principio rector

El producto debe simular un sistema de operaciones de servicios. El hospital es el contexto que vuelve visibles las colas, la variabilidad, los handoffs y las decisiones de capacidad; no se busca construir un simulador de diagnóstico clínico.
