# Reglas de la simulación

## Propósito educativo observado

La simulación aplica Gestión de Operaciones a un servicio con variabilidad de oferta y demanda. Los resultados deben permitir discutir:

- capacidad y demanda;
- tiempos de procesamiento y tiempo de ciclo;
- teoría de colas e inventario de pacientes;
- cuellos de botella;
- flujo de información y handoffs;
- diseño del proceso y layout;
- calidad y experiencia del cliente;
- costos, ingresos, inversiones y ROI;
- flexibilidad y digitalización.

## Flujo nominal

```text
Llegada
  -> Administración (ingreso)
  -> Enfermería
  -> Médico de guardia disponible
  -> Análisis, cuando corresponde
  -> Médico/Enfermería
  -> Administración (egreso)
  -> Salida
```

Las diapositivas y el boceto del equipo muestran retornos desde análisis y circuitos de información hacia Administración. La ruta exacta posterior a análisis deberá confirmarse antes de cerrar el modelo de dominio.

## Roles observados

### Administración

- Registra el ingreso del paciente.
- Registra su salida del sistema.

### Enfermería

- Recibe al paciente ingresado.
- Lo deriva al médico disponible.
- En las diapositivas aparece asociada a triage y a una posible mejora de velocidad coordinada con Guardia.

### Médicos de guardia

- Atienden al paciente.
- Solicitan análisis cuando corresponde.
- Dan el alta y devuelven el paciente a Administración para el egreso.

### Análisis / radiología

- Procesa los estudios solicitados.
- Constituye una estación con capacidad propia y posibilidad de incorporar otra máquina u operador.

### Dirección / observadores

- Observan y registran la performance.
- En el videojuego pueden convertirse en un modo de facilitación y debrief, sin intervenir directamente durante la ronda.

## Ronda y demanda

- Cada iteración dura 5 minutos.
- La demanda es desconocida para el equipo durante la operación.
- Existen al menos dos severidades:
  - paciente normal/no grave: ingreso de `$50`;
  - usuario clave/grave: ingreso de `$200`.
- Algunos pacientes necesitan análisis.
- Un paciente no atendido dentro del límite recibe una penalidad dependiente de la gravedad; el detalle completo de esa penalidad no aparece en los materiales recibidos.

## Costos observados

| Recurso | Costo |
|---|---:|
| Médico | `$100` cada uno |
| Enfermero | `$50` |
| Operador de rayos | `$50` |
| Administrativo | `$50` |
| Mantenimiento de sistemas | `$50` |

No se especifica en las fuentes si estos costos se cobran por ronda, por incorporación o por otra unidad temporal. Es una pregunta abierta.

## Inversiones y cambios observados

| Decisión | Costo observado |
|---|---:|
| Invertir en sistemas | `$250` |
| Agregar personal | según recurso solicitado |
| Agregar máquina de rayos | `$400` |
| Invertir en flexibilidad | `$200` |
| Rediseñar procesos / ingeniero especialista | `$200` |
| Triage | sin costo |

También se menciona una mejora de velocidad coordinada entre Enfermería y Médicos, pero su costo y efecto exactos no están explicitados.

## Tiempos mostrados en las diapositivas

Una lámina presenta las siguientes referencias:

| Estación | Valores mostrados |
|---|---:|
| Enfermería | `5 / 10 s` |
| Guardia | `5 / 15 s` |
| Análisis | `5 / 10 s` |
| Tratamiento total | mínimo `15 s`, máximo `25 s` |

La correspondencia entre cada valor, severidad y tipo de paciente no está definida en el texto extraído. Debe validarse con el facilitador antes de codificarla como regla.

## Reglas actualmente codificadas en la webapp

La aplicación pública agrega estas reglas operativas:

- duración: `300 s`;
- tiempo máximo por paciente: `60 s`;
- exactamente `60 s` se considera atendido; se marca tarde a partir de `61 s`;
- código numérico divisible por `3`: requiere análisis;
- código numérico divisible por `5`: usuario clave;
- paciente completado normal: `$50`;
- paciente completado clave: `$200`;
- paciente tarde: `$0`;
- reescaneo permitido después de `10 s`;
- lecturas idénticas dentro de `1,5 s` se ignoran como duplicadas.

Estas reglas deben tratarse como una implementación de referencia, no necesariamente como definición académica final.
