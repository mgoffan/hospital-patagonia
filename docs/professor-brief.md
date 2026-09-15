# Consigna del profesor y programas de rol

## Fuente

`Archive 5.zip`, recibido el 2026-09-14, contiene tres fotografías de las diapositivas usadas por el profesor. Los archivos originales no se incorporan al repositorio público.

## Costos visibles

| Recurso | Costo observado |
|---|---:|
| Médico | `$100` cada uno |
| Enfermero | `$50` cada uno |
| Operador de rayos | `$50` cada uno |
| Administrativo | `$50` cada uno |
| Mantenimiento de sistemas | `$50` |

## Cambios posibles

| Decisión | Costo observado |
|---|---:|
| Invertir en sistemas | `$250` |
| Agregar personal | costo del recurso solicitado |
| Agregar máquina de rayos | `$400` |
| Invertir en flexibilidad | `$200` |
| Rediseñar procesos / ingeniero especialista | `$200` |
| Triage | sin costo |

La diapositiva también menciona “velocidad en atención Enfermería x Médicos”, pero no define fórmula ni costo adicional.

## QR de roles

La tercera fotografía tiene cuatro QR. Su contenido, verificado con ZBar y ZXing, es:

| Etiqueta | Destino |
|---|---|
| Admin | <https://queue-scan-assist.lovable.app/> |
| Enfermero | <https://scratch.mit.edu/projects/322723091/> |
| Médico | <https://scratch.mit.edu/projects/322722424/> |
| Rayos | <https://scratch.mit.edu/projects/322727544/> |

## Comportamiento de los programas Scratch

Se inspeccionó el JSON público de los tres proyectos. Cada proyecto contiene tres sprites equivalentes, lo que permite operar hasta tres recursos del mismo tipo. Al hacer click en un sprite, el recurso queda ocupado durante una cantidad aleatoria de ciclos y después solicita el pase del paciente.

| Rol | Ciclos aleatorios | Duración por ciclo | Duración resultante |
|---|---:|---:|---:|
| Enfermero | `56..98` | `0,10 s` | `5,6..9,8 s` |
| Médico | `49..150` | `0,10 s` | `4,9..15,0 s` |
| Rayos | `56..98` | `0,10 s` | `5,6..9,8 s` |

Esto confirma que los valores `5/10`, `5/15` y `5/10` de las diapositivas son rangos aproximados de procesamiento aleatorio, no tiempos asignados por gravedad.

## Implicancias para el juego

- La configuración debe aceptar de uno a tres recursos por rol, sin acoplar el motor a ese máximo.
- Cada servicio toma una muestra entera del rango correspondiente usando el PRNG de la partida.
- La severidad/VIP afecta el ingreso y la penalidad, pero no cambia estos tiempos según las fuentes observadas.
- Los costos deben registrarse antes de comenzar; los ingresos sólo se reconocen al egreso válido.
- La periodicidad de los costos y la fórmula de penalidades siguen pendientes de confirmación.

