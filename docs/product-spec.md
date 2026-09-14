# Especificación de producto

## 1. Resumen

Hospital Patagonia es una webapp educativa first-person que convierte una simulación de Operaciones en Servicios en un sistema 3D interactivo. El jugador opera un hospital de emergencias compacto, coordina pacientes y recursos bajo demanda variable, y aprende mediante las consecuencias observables de sus decisiones.

El primer release será single-player, con compañeros controlados por IA, una ronda de cinco minutos y una fase posterior de debrief e inversiones. Debe ejecutarse como sitio estático en GitHub Pages.

## 2. Problema

La simulación física vuelve tangibles los handoffs, las colas y la presión, pero requiere materiales, espacio, coordinación y registro manual. La webapp actual registra llegadas y tiempos mediante QR, aunque no modela las estaciones internas, la capacidad ni el recorrido del paciente.

El nuevo producto debe preservar la experiencia sistémica de la actividad y permitir repetir, observar y comparar decisiones sin reducirla a un dashboard ni transformarla en un juego clínico.

## 3. Objetivos

### Objetivos de aprendizaje

- Reconocer variabilidad en llegada y procesamiento.
- Identificar el cuello de botella actual y su desplazamiento.
- Diferenciar tiempo de espera, procesamiento y ciclo total.
- Entender pacientes en cola como inventario en proceso.
- Experimentar el efecto de capacidad, flexibilidad, información y layout.
- Comparar eficiencia, experiencia del paciente y rentabilidad.
- Evaluar inversiones mediante resultados repetibles.

### Objetivos de producto

- Ofrecer un loop completo jugable en sesiones breves.
- Reproducir las cuatro demandas de la webapp de referencia.
- Permitir cambiar de rol entre rondas.
- Producir un event log suficiente para replay y métricas.
- Funcionar offline después de la primera carga.
- Mantener una arquitectura preparada para multijugador futuro.

## 4. No objetivos del MVP

- Diagnóstico médico realista.
- Formación clínica o certificación sanitaria.
- Multijugador en tiempo real.
- Editor completo de hospitales.
- Simulación de un hospital a escala real.
- Avatares humanos fotorrealistas.
- Uso obligatorio de cámara o fichas QR físicas.
- Backend, cuentas de usuario o ranking global.
- Reconstrucción literal de dimensiones no presentes en las fuentes.

## 5. Usuarios

### Alumno/jugador

Quiere comprender el sistema operándolo, probar decisiones y comparar resultados. Puede no tener experiencia previa con videojuegos first-person.

### Profesor/facilitador

Quiere ejecutar una actividad reproducible, observar qué ocurrió y conducir una discusión basada en evidencia.

### Observador

Quiere analizar capacidad, colas y coordinación sin intervenir durante la operación.

El modo específico de facilitador queda fuera del MVP, pero el event log y el replay deben permitir incorporarlo.

## 6. Hipótesis de producto

1. Encarnar un rol genera mejor comprensión de la información parcial que una vista omnisciente.
2. Caminar y entregar fichas vuelve visibles los costos de layout y handoff.
3. Repetir una semilla idéntica permite atribuir cambios de performance a decisiones operativas.
4. Un replay cenital explica el resultado mejor que un score único.
5. Coworkers IA permiten validar el loop antes de construir networking.

## 7. Alcance del MVP

### Mundo

- Recepción y sala de espera.
- Enfermería.
- Dos consultorios.
- Laboratorio/análisis.
- Radiología representada como estación configurable o sala conectada.
- Corredor y salida.
- Greybox funcional previo al arte final.

### Roles

- Administración, controlado por el jugador en el primer vertical slice.
- Enfermería, Guardia y Análisis, controlados inicialmente por IA.
- Selección de cualquier rol al completar el soporte de roles.

### Pacientes

- Llegada según fixture y semilla.
- Tipo normal o clave.
- Ruta con o sin análisis.
- Espera, procesamiento, traslado y egreso.
- Estado visible mediante comportamiento, ficha y HUD contextual.
- Timeout/tardanza según reglas configurables.

### Ronda

- Briefing y selección de escenario.
- Cuenta regresiva de cinco minutos.
- Operación first-person.
- Cierre consistente aun con pacientes pendientes.
- Resumen, métricas y replay.
- Selección de mejoras para una nueva ronda.

### Datos

- Event log local.
- Semilla y versión de reglas.
- Persistencia en IndexedDB.
- Exportación JSON y CSV; XLSX es deseable, no bloqueante del primer slice.

## 8. Recorrido principal

1. El usuario abre la aplicación.
2. Elige **Nueva simulación**.
3. Selecciona escenario o semilla y rol.
4. Revisa recursos, costos y objetivo.
5. Ingresa al hospital en first-person.
6. Completa un tutorial contextual corto.
7. Inicia la ronda.
8. Atiende tareas propias mientras la IA opera otras estaciones.
9. La ronda termina a los 300 segundos.
10. Revisa KPIs, timeline, colas y trayectorias.
11. Compra o activa una mejora.
12. Repite con la misma demanda o una nueva.

## 9. Requisitos funcionales

### RF-01 Escenarios

El sistema debe cargar escenarios versionados con duración, llegadas, reglas, capacidad, costos, ingresos y semilla.

### RF-02 Reloj determinista

La simulación debe avanzar con un reloj lógico independiente del framerate y soportar velocidad acelerada en tests/replay.

### RF-03 Pacientes

Cada paciente debe conservar identidad, atributos, ubicación operativa, historial de estados y timestamps.

### RF-04 Colas y capacidad

Cada estación debe declarar capacidad, disciplina de cola y duración de servicio. No puede atender por encima de su capacidad.

### RF-05 Roles

Cada acción operativa debe pertenecer a un rol. La IA y el jugador deben usar la misma interfaz de comandos del dominio.

### RF-06 Handoffs

El cambio entre estaciones debe ocurrir mediante un evento explícito. La ubicación visual no puede reemplazar el estado de dominio.

### RF-07 Interacción first-person

El jugador debe navegar, enfocar objetos y ejecutar acciones contextuales con teclado/mouse. Debe existir una alternativa sin Pointer Lock.

### RF-08 IA

Los coworkers deben elegir tareas válidas, reservar recursos, desplazarse y completar acciones sin violar reglas de capacidad.

### RF-09 Métricas

El sistema debe calcular throughput, tiempos, WIP, tardíos, utilización, ingresos, costos y ROI desde el event log.

### RF-10 Replay

El usuario debe poder reproducir una ronda desde una vista cenital con controles de tiempo y capas operativas.

### RF-11 Inversiones

Las mejoras deben modificar parámetros explícitos del escenario o proceso y quedar registradas para comparar rondas.

### RF-12 Persistencia

Una partida debe poder guardarse localmente y recuperarse después de recargar la página.

### RF-13 Exportación

Cada sesión debe exportarse con versión de reglas, configuración, eventos y métricas.

### RF-14 Tutorial

El primer uso debe enseñar movimiento, interacción, tarea del rol y lectura de estado sin requerir documentación externa.

### RF-15 Accesibilidad

Las señales críticas deben combinar texto, iconos, color y audio opcional.

## 10. Requisitos no funcionales

### Performance

- Objetivo de 60 FPS a 1080p en notebook de gama media.
- Umbral aceptable de 30 FPS en fallback/equipos mínimos.
- La simulación no debe depender de la frecuencia de render.
- Primera escena jugable cargada progresivamente.

### Compatibilidad

- Últimas dos versiones estables de Chrome, Edge, Firefox y Safari al momento del release.
- WebGL 2 como baseline.
- WebGPU como mejora progresiva.
- Desktop prioritario; tablet/touch posterior al vertical slice.

### Confiabilidad

- Misma semilla + mismas reglas + mismos comandos = mismo event log lógico.
- Recuperación segura de una sesión persistida.
- No duplicar ingresos, egresos ni costos.

### Privacidad

- Sin datos personales en el MVP.
- Identificadores de pacientes ficticios.
- Ninguna telemetría externa sin decisión explícita.

### Publicación

- Build estático bajo `/hospital-patagonia/`.
- Deployment automatizado a `gh-pages`.
- Assets cacheados con versión.

## 11. Configuración provisional

Hasta confirmar las reglas académicas:

- duración: `300 s`;
- timeout: mayor a `60 s`;
- normal completado: `$50`;
- clave completado: `$200`;
- tarde: `$0` antes de penalidades adicionales;
- `% 3`: requiere análisis en el importador QR;
- `% 5`: usuario clave en el importador QR;
- análisis retorna a revisión médica;
- coworkers IA operan estaciones no elegidas.

Todos estos valores deben vivir fuera del código de render y estar versionados.

## 12. Criterio de éxito del MVP

Una persona puede completar una ronda como Administración, observar pacientes que recorren todas las estaciones con coworkers IA, revisar un replay que explica el cuello de botella, aplicar una mejora y repetir exactamente la demanda para comparar el resultado.

Los criterios verificables están detallados en [acceptance-criteria.md](./acceptance-criteria.md).
