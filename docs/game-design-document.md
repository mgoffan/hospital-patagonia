# Game Design Document

## 1. Identidad

### Título de trabajo

**Hospital Patagonia: Turno Crítico**

### Género

Simulación educativa de operaciones, first-person, single-player con coworkers IA.

### Duración

- Tutorial inicial: 3-5 minutos.
- Ronda operativa: 5 minutos.
- Debrief e inversión: 3-10 minutos.
- Sesión recomendada: 2 o 3 rondas.

### Plataforma

Navegador desktop. Teclado y mouse como input principal. Instalación opcional como PWA.

## 2. Fantasía del jugador

El jugador no es “el héroe que atiende todo”. Es una parte limitada de un sistema. Debe ejecutar bien su rol, coordinar con otros y descubrir que la performance emerge del proceso completo.

La tensión proviene de elegir qué atender, qué comunicar y dónde invertir tiempo bajo demanda variable.

## 3. Pilares

### El flujo es físico

Pacientes, fichas, resultados y personas se desplazan por un espacio. Las distancias y esperas son observables.

### La información es parcial

Cada rol dispone de una vista distinta. Un handoff incompleto puede bloquear el sistema aun cuando haya capacidad ociosa.

### Las mejoras cambian el sistema

Una inversión altera capacidad, información, velocidad o rutas y puede mover el cuello de botella.

### El aprendizaje ocurre en el replay

La ronda produce presión y experiencia; el debrief permite comprender causalidad.

## 4. Estructura de sesión

### Briefing

El jugador conoce:

- rol;
- recursos disponibles;
- costos;
- nivel de servicio;
- mejoras ya aplicadas.

No conoce la secuencia futura de llegadas.

### Preparación

Puede recorrer la estación, leer controles y completar un tutorial contextual. El reloj no corre.

### Operación

- Comienzan el reloj y el fixture de llegadas.
- La IA opera las estaciones no elegidas.
- Las tareas aparecen en el mundo y en un HUD mínimo.
- El jugador debe desplazarse e interactuar.
- Los pacientes continúan recorriendo el proceso hasta cierre o estado terminal.

### Cierre

Al llegar a 300 segundos:

- se detienen nuevas llegadas;
- el escenario decide si se congela inmediatamente o permite vaciar el sistema;
- el MVP utilizará congelamiento para comparar con la actividad original;
- pacientes pendientes quedan registrados como WIP.

### Debrief

Incluye KPIs, timeline, replay, colas, utilización, ledger y comparación con la ronda anterior.

### Mejora

El jugador selecciona una inversión o cambio de proceso y decide repetir la semilla o iniciar otra demanda.

## 5. Controles

| Acción | Input inicial |
|---|---|
| Moverse | `WASD` / flechas |
| Mirar | mouse |
| Interactuar | `E` o click principal |
| Cancelar / soltar | `Esc` o click secundario |
| Ver tarea del rol | `Tab` |
| Abrir pausa accesible | `Esc` |
| Caminar rápido | no incluido inicialmente |

No habrá salto ni sprint en el MVP. Evita explotar el movimiento y reduce mareo.

## 6. Sistema de interacción

### Selección

- Raycast corto desde el centro de cámara.
- El objeto enfocado muestra contorno y verbo.
- La acción sólo se habilita si el dominio la considera válida.
- Un rechazo explica brevemente qué falta.

### Acciones temporizadas

Una tarea de proceso utiliza:

- animación contextual;
- progreso visible;
- posibilidad de cancelación cuando la regla lo permita;
- evento de inicio y finalización.

Mantener una tecla presionada no debe reemplazar toda la simulación. La decisión de comenzar una tarea importa más que la destreza manual.

### Objetos de handoff

- ficha del paciente;
- bandeja de entrada/salida;
- terminal compartida si hay sistema;
- resultado de análisis;
- marcador de habitación o llamado.

Los objetos críticos tienen una representación de dominio. Los props decorativos no.

## 7. Diseño de roles

### Administración

#### Información disponible

- pacientes arribados;
- ficha de identidad;
- estado de admisión/egreso;
- caja y cola de mostrador.

#### Acciones

- llamar siguiente;
- crear/validar ficha;
- ingresar paciente;
- recibir alta completa;
- registrar egreso.

#### Riesgos

- duplicar o asociar mal una ficha;
- enviar sin admisión completa;
- mantener egresos bloqueados en la misma cola de ingresos.

### Enfermería

#### Información disponible

- pacientes admitidos;
- señales necesarias para triage;
- disponibilidad visible o comunicada de Guardia.

#### Acciones

- llamar paciente;
- iniciar triage;
- asignar prioridad;
- derivar a consultorio.

#### Riesgos

- priorización incorrecta;
- saturar Guardia sin coordinar;
- dejar capacidad médica ociosa por falta de handoff.

### Guardia

#### Información disponible

- ficha admitida y triage;
- cola asignada;
- resultados solicitados/recibidos.

#### Acciones

- comenzar consulta;
- solicitar análisis;
- revisar resultado;
- emitir alta.

#### Riesgos

- bloquear consultorio esperando un resultado;
- perder trazabilidad entre solicitud y paciente;
- acumular altas sin egreso.

### Análisis/radiología

#### Información disponible

- solicitudes válidas;
- prioridad autorizada;
- estado de equipos y operador.

#### Acciones

- tomar solicitud;
- preparar equipo;
- procesar estudio;
- entregar resultado.

#### Riesgos

- procesar sin solicitud;
- acumular resultados no entregados;
- máquina ociosa por falta de operador.

## 8. Coworkers IA

La IA debe ser competente y explicable, no óptima.

### Comportamiento base

1. Evalúa tareas permitidas para su rol.
2. Respeta disciplina de cola y prioridad.
3. Reserva paciente, estación y recurso.
4. Se desplaza por navmesh.
5. Ejecuta la interacción.
6. Completa el handoff.

### Parámetros ajustables

- demora de reacción;
- eficiencia;
- probabilidad de error, desactivada inicialmente;
- frecuencia de actualización;
- tolerancia para cobertura cruzada.

La IA no recibe acceso omnisciente a atributos todavía no descubiertos.

## 9. Pacientes NPC

### Estados visuales

- llegando;
- esperando;
- llamado;
- trasladándose;
- siendo atendido;
- esperando resultado;
- listo para egreso;
- impaciente/tarde;
- egresado/abandono.

### Comportamiento

- Ocupan un asiento cuando está disponible.
- Se ubican en una espera de pie cuando no hay asiento.
- Responden a llamados autorizados.
- Caminan a una posición reservada.
- Expresan espera mediante postura y audio no verbal.

No se usarán síntomas realistas ni representaciones gráficas sensibles en el MVP.

## 10. Dificultad

La dificultad proviene de:

- frecuencia y picos de llegada;
- mix de rutas;
- variabilidad de tiempos;
- capacidad inicial;
- visibilidad de información;
- costo de desplazamiento;
- disciplina de cola;
- fallos configurables en etapas posteriores.

No debe aumentar mediante controles más incómodos o texto deliberadamente ilegible.

## 11. Inversiones

| Inversión | Efecto jugable propuesto |
|---|---|
| Sistemas | estado compartido, menos handoffs físicos, mantenimiento |
| Personal | agrega recurso con capacidad de trabajo |
| Máquina de rayos | agrega capacidad de equipo; requiere operador |
| Flexibilidad | habilita cobertura cruzada con eficiencia configurable |
| Triage | cambia disciplina de cola/prioridad |
| Rediseño | modifica rutas, separación de colas o posiciones entre rondas |

Cada inversión debe mostrar costo antes de aplicar y efecto observado después, sin prometer mejora garantizada.

## 12. Scoring y resultados

No existe un puntaje canónico único en el MVP. La pantalla presenta un panel balanceado:

- servicio: throughput, tardíos, WIP y experiencia;
- flujo: tiempos, colas y utilización;
- calidad: errores y retrabajo;
- economía: ingresos, costos, penalidades y ROI.

Puede existir una evaluación del escenario, pero debe explicar su fórmula y permitir ver los KPIs originales.

## 13. Replay

### Controles

- reproducir/pausar;
- velocidad `0.5x`, `1x`, `2x`, `4x`;
- scrubber temporal;
- selección de paciente o estación;
- comparación con ronda anterior.

### Capas

- trayectorias;
- longitud de colas;
- utilización;
- tiempos de espera;
- handoffs y bloqueos;
- ingresos/costos.

### Momentos destacados

El sistema sugiere momentos, sin emitir juicio definitivo:

- cola máxima;
- primer timeout;
- recurso ocioso con cola aguas arriba;
- resultado detenido;
- cambio de cuello de botella.

## 14. UX y HUD

### Durante la ronda

- reloj;
- tarea/rol actual;
- paciente u objeto enfocado;
- feedback de comando;
- indicador sutil de presión/cola propia.

No se muestran dashboards completos durante la operación base. La inversión en sistemas puede habilitar mayor visibilidad.

### Accesibilidad

- remapeo de teclas;
- sensibilidad y eje Y configurable;
- retícula ajustable;
- subtítulos;
- no depender sólo de color;
- reducción de movimiento y head bob;
- giro por pasos opcional;
- interacción por click sin Pointer Lock;
- pausa fuera de una sesión evaluada.

## 15. Arte

### Dirección

“El tablero cobra vida”: geometría 3D simple con contornos suaves, paleta derivada de las ilustraciones y materiales con variación de acuarela.

### Prioridades

1. Legibilidad de estaciones y rutas.
2. Siluetas claras de objetos interactivos.
3. Consistencia de escala.
4. Identidad visual de cada sala.
5. Detalle decorativo.

### Pipeline

Greybox -> kit modular -> materiales estilizados -> props -> iluminación -> optimización.

## 16. Audio

- ambiente diferente por sala;
- llegada y llamado;
- comienzo/fin de tarea;
- equipo de análisis;
- alarma de tiempo configurable;
- señales espaciales de acumulación sin sustituir feedback visual.

## 17. Tutorial

El tutorial usa un paciente controlado y no consume la ronda.

1. Movimiento y cámara.
2. Identificar estación.
3. Enfocar e interactuar.
4. Completar una tarea del rol.
5. Entregar un handoff.
6. Leer reloj y feedback.

Debe poder omitirse y repetirse.

## 18. Riesgos de diseño

| Riesgo | Mitigación |
|---|---|
| Caminar domina el juego | hospital compacto y velocidad estable |
| La IA oculta el cuello de botella | replay y parámetros visibles en debrief |
| Exceso de UI | HUD contextual y dashboard posterior |
| Minijuegos clínicos distraen | interacciones operativas breves |
| Mareo first-person | opciones de cámara y modo alternativo |
| Score incentiva conducta incorrecta | KPIs múltiples y fórmula explícita |
| Reglas académicas incompletas | escenarios versionados y parámetros configurables |

## 19. Vertical slice de referencia

El slice inicial contiene:

- un escenario de demanda media reducido a 90 segundos para desarrollo;
- Administración jugable;
- Enfermería, un médico y análisis operados por IA;
- recepción, corredor y salas en greybox;
- un paciente sin análisis y uno con análisis;
- ingreso y egreso completos;
- event log;
- resumen y replay básico.

Una vez validado, se extiende a los 300 segundos y fixtures completos.
