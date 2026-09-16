# Traspaso para la próxima sesión

_Estado relevado el 16 de septiembre de 2026, sobre `main` en `012d827`._ Este documento es una foto del estado del proyecto, no reemplaza el código ni las reglas de negocio documentadas en los archivos enlazados. Si el repositorio avanzó, verificar primero `git log` y `git status`.

## En un minuto

- Repositorio público: <https://github.com/mgoffan/hospital-patagonia>.
- Sitio publicado mediante `gh-pages`: <https://mgoffan.github.io/hospital-patagonia/>.
- Stack implementado: Vite, React, TypeScript, React Three Fiber, Three.js y Rapier; versiones exactas en `package.json` y `package-lock.json`.
- El usuario acaba de validar favorablemente el aspecto y la circulación actuales: «Ahora está genial». No rediseñar planta, puertas, pasillos, cámara, personas ni cintas de piso sin un motivo concreto o una regresión comprobada.
- Próximo salto de producto: pasar de **observar una ronda calculada de antemano** a **operar Administración durante la ronda**, con decisiones que modifiquen colas, tiempos y P&L.

## Qué existe hoy

La secuencia de pantallas es configuración → confirmación económica → hospital first-person y reloj → debrief operativo/P&L. `src/App.tsx` calcula `runSimulation(configuration)` al entrar en la operación. El motor (`src/simulation/engine.ts`) produce por adelantado un event log determinista de cinco minutos y los resultados. `src/simulation/visualTimeline.ts` proyecta ese log al tiempo visible. `src/features/operation/GameOperation.tsx` controla el reloj, la navegación básica y la salida hacia el debrief; **todavía no recibe comandos de atención del jugador**.

La representación física ya usa esos eventos: `src/three/HospitalScene.tsx` hace aparecer, caminar, esperar, sentarse, atenderse y salir a los pacientes. Puede ir retrasada respecto del reloj lógico para completar los trayectos; ese desfase es deliberado en el prototipo actual, pero deberá revisarse al volver interactiva la ronda. No confundir la conexión al event log con una simulación editable en tiempo real.

### Circulación aprobada que conviene preservar

- Entrada de a una persona; primer destino: mostrador de Administración.
- Pausa física de **0,5 s completos** frente al mostrador; después se coloca la pulsera visible.
- QR en la remera; pulsera codificada por normal/VIP y con/sin rayos.
- Recorridos exclusivamente ortogonales, compartidos con las cintas del piso en `src/three/patientNavigation.ts`; los tramos deben evitar muros, hojas de puertas y mobiliario.
- Pasillo clínico con carriles de ida/vuelta y ejes diferenciados al entrar y salir de las salas.
- Seis sillas: el paciente se sienta solo al llegar a su posición; si no hay silla, espera de pie.
- Separación entre personas mediante espera cuando el siguiente paso está ocupado; movimiento con aceleración y giro suavizados.
- Indicador visual de tardanza cuando supera los 60 s, conforme a la regla económica documentada.

La planta es una interpretación jugable de las referencias, no un plano métrico. Las fotografías y PDF de origen no se publicaron en el repo. La dirección artística actual se explica en [dirección de arte](./art-direction.md), [referencia visual](./visual-reference.md) y [greybox 3D](./greybox-3d.md).

## Mapa de código útil

| Responsabilidad | Archivo principal |
| --- | --- |
| Transición de pantallas y creación de la simulación | `src/App.tsx` |
| Configuración, costos y recursos | `src/domain/configuration.ts`, `src/domain/economy.ts` |
| Motor, eventos, pacientes y estaciones | `src/simulation/engine.ts` |
| Proyección temporal para la vista | `src/simulation/visualTimeline.ts` |
| Reloj y controles de la ronda | `src/features/operation/GameOperation.tsx` |
| Planta, NPC y movimiento físico | `src/three/HospitalScene.tsx` |
| Red de rutas y cintas pintadas | `src/three/patientNavigation.ts` |
| Cámara y movimiento del jugador | `src/three/FirstPersonController.tsx` |
| Resultados y P&L | `src/domain/results.ts`, `src/features/debrief/RoundDebrief.tsx` |
| Pruebas de circulación | `src/three/patientNavigation.test.ts`, `e2e/patient-flow.spec.ts` |

Las reglas y sus supuestos están en [reglas de simulación](./simulation-rules.md), [motor implementado](./simulation-engine.md) y [economía y resultados](./economics-and-results.md). [Plan de implementación](./implementation-plan.md) y [criterios de aceptación](./acceptance-criteria.md) son el roadmap original: no asumir que cada hito allí nombrado ya está completo.

## Siguiente hito recomendado: vertical slice jugable de Administración

Alcance acotado: una ronda en la que el jugador recibe pacientes en el mostrador, consulta su ficha/QR, confirma su ingreso y les coloca la pulsera. Las demás estaciones pueden seguir con coworkers automáticos. La acción debe afectar el estado del motor, no solo disparar una animación sobre un resultado ya cerrado.

Orden de trabajo sugerido:

1. Definir el contrato de comandos y estado incremental del motor: iniciar partida, avanzar tiempo lógico, registrar una acción de Administración y recalcular eventos/resultados desde ese estado. Preservar semilla, orden estable y la capacidad de reproducir una misma secuencia de comandos. El `runSimulation` actual puede permanecer como ejecución automática de referencia durante la transición.
2. Hacer que el paciente espere físicamente en el mostrador después de su pausa mínima. Presentar una ficha legible y una interacción contextual (tecla `E` y control alternativo visible/operable con teclado) para completar el check-in. La pulsera no debe aparecer antes de esa acción en el modo jugable.
3. Conectar la acción validada con Administración y con el siguiente destino. Si el jugador no actúa, el paciente permanece esperando y el retraso se refleja en colas, atención y resultado económico; no debe avanzar por el itinerario precomputado.
4. Mantener la circulación física existente como capa de presentación de eventos confirmados. Al introducir cambios de ruta o prioridad, recalcular el objetivo sin atravesar geometría ni teletransportar al paciente.
5. Mostrar durante la ronda una señal clara de qué decisión falta y, en el debrief, explicar qué decisiones afectaron el resultado.

### Criterios de salida del vertical slice

- Una llegada se detiene en Administración; espera al menos 0,5 s y luego espera una acción explícita del jugador.
- La ficha muestra los datos necesarios para decidir; el check-in genera un evento/comando de dominio verificable.
- Pulsera y derivación ocurren **después** del check-in, no por un temporizador visual autónomo.
- La misma configuración, semilla y secuencia de comandos producen el mismo event log y P&L.
- Demorar o no atender produce una diferencia observable en tiempo de espera y resultados, sin ingresos contabilizados antes del egreso válido.
- El jugador puede completar la interacción sin Pointer Lock ni mouse; la cámara y los controles existentes siguen funcionando.
- Las pruebas de rutas y de no superposición siguen pasando, además de pruebas nuevas del comando, la espera y su efecto económico.

### Decisiones que requieren diseño antes de implementar

- Cómo se relacionan los 300 s lógicos con trayectos físicos que hoy pueden terminar después del evento lógico. Para el modo interactivo, definir si una estación empieza cuando el NPC llega físicamente o si el desplazamiento continúa siendo una proyección visual; evitar dos verdades contradictorias.
- Qué dato exacto de la ficha puede cambiar la decisión del jugador y qué errores/penalidades están permitidos. No inventar penalidades clínicas: la fuente no define su fórmula, y hoy su valor provisional es `$0`.
- Si la prioridad VIP o el orden de cola se vuelve una decisión del jugador en este primer corte o en el siguiente. Mantener el MVP pequeño y comprobable.
- El mazo completo de fichas/QR aún no está importado al motor; la generación de pacientes por divisibilidad del código es un fixture provisional.

## Verificación y límites conocidos

Desde la raíz del repo:

```bash
npm ci
npm run check
npm run test:e2e -- --workers=1 --grep '@smoke'
npm run test:e2e -- --workers=1 --grep '@extended'
npm run dev
```

Node.js `>=22.12.0`; Playwright usa Google Chrome. `npm run check` incluye formato, lint, tipos, unit tests y build. El smoke E2E recorre configuración, escena y debrief; corre en CI. La prueba `@extended` de demanda alta observa sillas, rutas y distancias entre personas durante más tiempo, pero **no corre en CI** por la sensibilidad del render WebGL y los temporizadores del navegador. Ejecutarla manualmente al modificar navegación, pacientes o reloj. La prueba `e2e/patient-flow.spec.ts` de recorrido del primer paciente tampoco forma parte del smoke de CI.

Última verificación local de este traspaso (16/09/2026): `npm run check` pasó con 25 tests unitarios y build; el smoke de Playwright pasó en Google Chrome (1 test). No se ejecutó la prueba `@extended` en esta actualización documental.

Puntos para vigilar, no defectos confirmados en la revisión del usuario: con mucha demanda, el tiempo físico puede quedar atrás del reloj lógico; `useFrame` sigue activo aunque el reloj de `GameOperation.tsx` esté pausado, así que verificar el comportamiento de pausa al convertirlo en juego interactivo. Hacer una prueba manual de ronda completa en Chrome, incluida demanda alta, antes de dar por cerrado un cambio de circulación.

El push a `main` dispara CI; tras CI exitoso, `.github/workflows/deploy.yml` publica `dist` en `gh-pages`. Verificar la ejecución y el sitio después de cambios funcionales. No editar `gh-pages` a mano.

## Guardarraíles de producto

- El núcleo es gestión de operaciones: colas, handoffs, capacidad, tiempo de atención e ingresos. No convertirlo en simulador de diagnóstico médico.
- La configuración y el P&L ya expresan ingresos `$50` normal / `$200` VIP si el paciente egresa en `<= 60 s`; egresos tardíos o pendientes generan `$0`. Ver [economía y resultados](./economics-and-results.md) para el detalle y los supuestos.
- Seguir usando commits pequeños y descriptivos. Mantener la página pública actualizada mediante CI/Pages.
- Las fotos originales y el material del profesor son referencias privadas; no subirlos ni usar assets derivados sin revisar permisos. La estética toma inspiración de videojuegos low-poly de la época, sin copiar personajes ni arte del videoclip citado por el usuario.
