# Preguntas abiertas

Estas preguntas deben resolverse antes o durante la elaboración del plan. No todas bloquean un prototipo, pero sí una simulación académicamente fiel.

## Reglas académicas

1. ¿El máximo de `60 s` de la webapp reemplaza o complementa los tiempos por estación?
2. ¿Cómo se calculan exactamente las penalidades por gravedad?
3. ¿Los costos de personal y mantenimiento se cobran por ronda o una sola vez?
4. ¿Qué efecto cuantitativo tiene cada inversión?
5. ¿Cuál es el recorrido exacto después de análisis: vuelve a Guardia, Enfermería o puede ir a Administración?
6. ¿Triage es una decisión sin costo independiente del rediseño de procesos?
7. ¿Existe un límite físico de pacientes por sala o sólo una cola conceptual?
8. ¿Existe presupuesto inicial o se compara libremente el P&L entre configuraciones?

### Resuelto con `Archive 5.zip`

Los tiempos `5/10`, `5/15` y `5/10` son rangos aleatorios por servicio. Los programas Scratch no condicionan esos tiempos por gravedad.

## Experiencia de producto

1. ¿El primer release debe priorizar juego individual, cooperativo en aula o ambos?
2. ¿Cada participante usará su propia notebook o compartirán una pantalla?
3. ¿La ronda debe durar siempre cinco minutos reales?
4. ¿El profesor necesita crear escenarios desde una interfaz?
5. ¿Debe conservarse compatibilidad con las fichas QR físicas?
6. ¿La dificultad debe incluir errores humanos o sólo capacidad y tiempos?
7. ¿Se permitirá mover habitaciones o únicamente modificar recursos y rutas?
8. ¿Qué métricas definen una partida exitosa?

## Mundo 3D

1. ¿Cuánto mide una celda de la retícula de los tableros?
2. ¿Las fotos duplicadas representan copias del mismo tablero o salas diferentes?
3. ¿Cuántos consultorios, médicos y equipos debe mostrar la configuración inicial?
4. ¿Cómo se conectan físicamente las salas?
5. ¿La estética acuarelada debe conservar los logos y cartelería originales?
6. ¿Hay autorización para publicar derivados de los materiales en un repositorio público?

## Datos y facilitación

1. ¿Los resultados deben descargarse en Excel con el formato actual?
2. ¿Se necesita un dashboard agregado para comparar equipos?
3. ¿Las partidas requieren nombres de alumnos o deben ser anónimas?
4. ¿Cuánto tiempo debe conservarse el historial?
5. ¿El facilitador puede introducir shocks durante una ronda?

## Decisiones provisionales no bloqueantes

Mientras no haya respuesta, un prototipo puede asumir:

- single-player con coworkers IA;
- cinco minutos reales con modo acelerado sólo para desarrollo;
- fixtures actuales de 49, 28, 17 y 8 llegadas;
- límite de servicio de 60 segundos;
- paciente normal `$50`, clave `$200`, tarde `$0`;
- personal y mantenimiento contabilizados por ronda;
- penalidad adicional inicial `$0`, marcada como regla pendiente;
- ruta de análisis con retorno a Guardia;
- estética 3D estilizada sin logos dentro de los assets públicos;
- escala definida por circulación jugable, marcada como aproximada.

Estas suposiciones deben vivir en escenarios versionados para poder reemplazarlas sin reescribir el motor.
