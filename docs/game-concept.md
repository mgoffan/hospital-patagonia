# Concepto de videojuego

## Dirección recomendada

**Hospital Patagonia: Turno Crítico** es una simulación first-person de operaciones de servicios. Puede jugarse en solitario con compañeros controlados por IA y, en una fase posterior, en modo cooperativo.

El objetivo no es diagnosticar enfermedades. El desafío es coordinar recursos, información y capacidad bajo demanda variable.

## Promesa de la experiencia

> Entrar físicamente en un proceso que normalmente se dibuja como un diagrama y descubrir que cada mejora local cambia el problema del sistema completo.

## Bucle principal

1. Asignar roles, recursos y configuración inicial.
2. Recibir un escenario de demanda desconocido.
3. Operar durante una ronda de cinco minutos reales.
4. Revisar resultados y reproducir el flujo completo.
5. Invertir, reasignar o rediseñar.
6. Repetir la ronda o afrontar un nuevo escenario.
7. Comparar nivel de servicio, experiencia y ROI.

## Roles jugables

### Administración

- Admite pacientes.
- Crea o recupera la ficha.
- Mantiene la cola de ingreso y egreso.
- Cobra o confirma la salida.
- Sufre directamente los errores de datos y los retornos incompletos.

### Enfermería

- Recibe pacientes admitidos.
- Realiza triage mediante una interacción breve.
- Decide prioridad y deriva al médico libre.
- Gestiona excepciones y pacientes que empeoran mientras esperan.

### Médico de guardia

- Atiende en un consultorio.
- Decide o confirma la necesidad de análisis.
- Espera o consulta resultados.
- Da el alta y completa el handoff hacia Administración.

### Laboratorio / radiología

- Mantiene su propia cola.
- Opera equipos con capacidad limitada.
- Gestiona solicitudes, resultados y fallos.
- Devuelve información a Guardia sin perder trazabilidad.

### Director / observador

- Observa el sistema en vivo o durante el replay.
- Registra hipótesis y momentos críticos.
- Introduce eventos solamente en un modo facilitador autorizado.

## Mecánicas centrales

### Información imperfecta

Cada rol ve sólo lo que necesita. La información completa requiere un handoff correcto o una inversión en sistemas. No deben existir etiquetas flotantes omniscientes que eliminen el problema operativo.

### Paciente como trabajo en proceso

Los pacientes ocupan espacio, esperan, preguntan, se impacientan y pueden abandonar. La cola deja de ser un número abstracto y se vuelve inventario visible.

### Handoffs físicos y digitales

La ficha, la pulsera y el resultado de análisis representan estado. Una bandeja mal organizada, una ficha olvidada o una carga incorrecta generan espera y retrabajo.

La inversión en sistemas reemplaza parte de esa fricción con un registro compartido, pero introduce mantenimiento y posibles fallos.

### Movimiento con costo operativo

Caminar y buscar recursos consume tiempo. El layout modifica la performance, pero el juego no debe convertirse en una carrera de destreza. La velocidad de movimiento debe ser estable y las distancias deben expresar decisiones de diseño.

### Variabilidad reproducible

Las llegadas y los tiempos de servicio usan una semilla. El equipo desconoce el patrón durante la ronda, pero el facilitador puede repetir exactamente la demanda para comparar dos configuraciones.

### Cuello de botella móvil

Agregar médicos puede saturar análisis. Mejorar análisis puede acumular pacientes en egreso. El juego debe evitar upgrades que simplemente aumenten un score: cada cambio altera la red de colas.

### Flexibilidad

La inversión en capacitación habilita que ciertos roles cubran otra estación con eficiencia reducida y costo de cambio. Esto transforma la flexibilidad en una acción observable.

## Fase de mejora entre rondas

Las decisiones observadas en la simulación se representan como cambios reales:

- **Sistemas:** expediente compartido y visibilidad de estado.
- **Personal:** un segundo recurso en una estación.
- **Máquina de rayos:** mayor capacidad de radiología.
- **Flexibilidad:** cobertura cruzada entre roles.
- **Triage:** prioridad explícita antes de Guardia.
- **Rediseño:** cambio de rutas, colas o layout.

## Debrief y replay

El replay cenital es parte del producto, no una pantalla secundaria. Debe mostrar:

- trayectoria de cada paciente;
- tiempo de espera y proceso por estación;
- longitud de cada cola a lo largo del tiempo;
- utilización y bloqueo de recursos;
- fichas o resultados detenidos;
- abandono y penalidades;
- momento en que cambia el cuello de botella.

Los resultados no deben reducirse a un score único.

## Métricas propuestas

- throughput total;
- tiempo de ciclo promedio, mediana y percentiles 90/95;
- tiempo de espera por estación;
- pacientes pendientes al finalizar;
- tardíos y abandonos;
- utilización por recurso;
- errores y retrabajo;
- ingresos y costos;
- ROI;
- experiencia del paciente.

## Modos derivados

### Cambio de perspectiva

Una persona juega la misma semilla desde varios roles. Expone la diferencia entre optimización local y desempeño sistémico.

### Aula competitiva

Varios equipos reciben la misma demanda y comparan decisiones, no reflejos. El profesor puede introducir ausentismo, picos o fallos de equipos.

### Cooperativo en tiempo real

Cada participante ocupa un rol. Requiere servidor autoritativo y queda fuera de la primera versión estática.

## Principios de diseño

- Enseñar mediante consecuencias, no mediante textos extensos.
- Mantener la presión temporal sin penalizar accesibilidad.
- No exigir conocimiento médico especializado.
- No revelar información que el rol real no tendría.
- Preservar la comparabilidad entre rondas.
- Hacer visible por qué una decisión mejora o empeora el sistema.
