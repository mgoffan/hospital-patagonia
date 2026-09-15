# Criterios de aceptación

## Convenciones

- **Automático:** verificable mediante test unitario, de integración o E2E.
- **Manual:** requiere inspección visual, auditiva o de usabilidad.
- **Bloqueante:** debe cumplirse para considerar completo el hito.

## Hito 0 - Foundation

- [ ] **Automático, bloqueante:** instalación reproducible desde un checkout limpio.
- [ ] **Automático, bloqueante:** lint, typecheck y tests ejecutan en CI.
- [ ] **Automático, bloqueante:** build funciona con base `/hospital-patagonia/`.
- [ ] **Automático, bloqueante:** workflow publica el artefacto estático en GitHub Pages.
- [ ] **Manual:** pantalla inicial carga sin errores visibles en Chrome, Firefox y Safari.
- [ ] **Automático:** dependencias directas y decisiones arquitectónicas están documentadas.

## Hito 0.5 - Configuración de partida

- [ ] **Manual, bloqueante:** se puede elegir demanda, rol, nombre y semilla antes de iniciar.
- [ ] **Manual, bloqueante:** cada recurso muestra costo unitario, cantidad y subtotal.
- [ ] **Automático, bloqueante:** el total equivale a la suma de recursos y mantenimiento activos.
- [ ] **Automático:** los ingresos unitarios son `$50` normal, `$200` VIP y `$0` tarde.
- [ ] **Automático, bloqueante:** no se confirma una ronda sin administrativo, enfermero y médico.
- [ ] **Automático:** radiología activa exige operador y máquina.
- [ ] **Automático, bloqueante:** confirmar crea un snapshot que no cambia al editar el formulario.
- [ ] **Manual:** la interfaz distingue ingresos, costos e inversiones sin llamar ganancia al ingreso.
- [ ] **Manual:** la pantalla funciona con teclado y no depende sólo de color.

## Hito 1 - Motor determinista

- [ ] **Automático, bloqueante:** el escenario puede declarar duración y schedule de llegadas.
- [ ] **Automático, bloqueante:** las cuatro secuencias existentes producen 49, 28, 17 y 8 llegadas.
- [ ] **Automático, bloqueante:** mismo escenario, semilla y comandos generan eventos idénticos.
- [ ] **Automático, bloqueante:** el motor puede saltar al siguiente evento sin render.
- [ ] **Automático, bloqueante:** ninguna estación excede su capacidad.
- [ ] **Automático, bloqueante:** un paciente no pertenece a dos colas.
- [ ] **Automático, bloqueante:** un recurso no ejecuta dos servicios incompatibles.
- [ ] **Automático:** `24`, `12`, `28`, `27` y `5` se importan con los atributos documentados.
- [ ] **Automático:** tiempo, ingresos y costos se registran una sola vez.
- [ ] **Automático:** estado reconstruido desde eventos coincide con el snapshot final.

## Hito 2 - Greybox first-person

- [ ] **Manual, bloqueante:** se puede recorrer recepción, Enfermería, dos consultorios, análisis y radiología.
- [ ] **Manual, bloqueante:** puertas y pasillos no permiten salir del mundo.
- [ ] **Automático:** el jugador no atraviesa colliders estáticos.
- [ ] **Manual, bloqueante:** todos los objetos interactivos comunican foco y acción.
- [ ] **Manual:** cada sala se reconoce sin depender del HUD.
- [ ] **Manual:** existe alternativa de interacción sin Pointer Lock.
- [ ] **Manual:** opciones de sensibilidad y reducción de movimiento funcionan.
- [ ] **Automático:** la escena carga mediante el base path de GitHub Pages.

## Hito 3 - Vertical slice de Administración

- [ ] **Manual, bloqueante:** el jugador completa admisión y egreso first-person.
- [ ] **Automático, bloqueante:** una admisión válida mueve al paciente a Enfermería.
- [ ] **Automático, bloqueante:** no se puede egresar un paciente sin alta válida.
- [ ] **Automático:** una acción inválida no cambia el dominio y devuelve motivo.
- [ ] **Manual:** la ficha física/digital permite identificar al paciente sin revelar atributos no descubiertos.
- [ ] **Automático, bloqueante:** coworkers IA completan Enfermería, Guardia y Análisis para al menos dos rutas.
- [ ] **Manual, bloqueante:** un paciente sin análisis y uno con análisis completan el recorrido visible.
- [ ] **Automático:** los NPC reservan destinos antes de desplazarse.
- [ ] **Manual:** un NPC bloqueado recupera su ruta sin teletransportarse visiblemente.

## Hito 4 - Ronda completa

- [ ] **Automático, bloqueante:** la ronda dura 300 segundos lógicos.
- [ ] **Manual:** existe una cuenta regresiva clara sin dominar la pantalla.
- [ ] **Automático, bloqueante:** el cierre no pierde pacientes pendientes.
- [ ] **Automático:** WIP, tardíos y egresados son categorías separadas.
- [ ] **Automático:** fixtures repetidos conservan las mismas llegadas.
- [ ] **Automático:** la IA no accede a datos aún no descubiertos.
- [ ] **Manual:** la demanda alta produce presión observable y la baja deja ociosidad observable.
- [ ] **Automático:** una partida se recupera después de recargar la página.

## Hito 5 - Debrief y replay

- [ ] **Automático, bloqueante:** KPIs se calculan exclusivamente desde event log y ledger.
- [ ] **Automático, bloqueante:** throughput, WIP, tardíos, tiempos, utilización, ingresos, costos y ROI tienen tests.
- [ ] **Manual, bloqueante:** replay cenital reproduce llegadas, colas, servicios y egresos.
- [ ] **Manual:** usuario puede pausar, cambiar velocidad y navegar el tiempo.
- [ ] **Manual:** seleccionar un paciente muestra su trayectoria y esperas.
- [ ] **Automático:** replay finaliza en un estado equivalente al snapshot de la ronda.
- [ ] **Manual:** se identifica visualmente la cola máxima y el primer timeout.
- [ ] **Automático:** exportación JSON incluye versiones, semilla, reglas, eventos y métricas.
- [ ] **Automático:** CSV contiene una fila consistente por paciente.

## Hito 6 - Inversiones y comparación

- [ ] **Automático, bloqueante:** cada inversión aplica efectos declarativos a la siguiente ronda.
- [ ] **Automático:** no puede aplicarse una inversión sin presupuesto.
- [ ] **Manual:** costo y efecto esperado se explican antes de confirmar.
- [ ] **Automático, bloqueante:** repetir semilla conserva llegadas y cambia sólo configuración/comandos.
- [ ] **Manual, bloqueante:** pantalla compara dos rondas en KPIs y timeline.
- [ ] **Automático:** agregar capacidad puede cambiar utilización y cola sin romper invariantes.
- [ ] **Automático:** inversión en flexibilidad agrega skill con eficiencia configurable.
- [ ] **Automático:** inversión en sistemas cambia visibilidad/handoffs mediante reglas explícitas.

## Hito 7 - Arte, sonido y accesibilidad

- [ ] **Manual, bloqueante:** la estética conserva la identidad acuarelada sin usar assets no autorizados.
- [ ] **Manual:** materiales, escala y cartelería son consistentes.
- [ ] **Manual:** sonidos críticos tienen alternativa textual.
- [ ] **Manual, bloqueante:** ninguna información crítica depende sólo del color.
- [ ] **Manual:** tutorial puede omitirse y repetirse.
- [ ] **Manual:** navegación por menú funciona con teclado.
- [ ] **Manual:** se puede desactivar head bob, alarmas intensas y audio.

## Hito 8 - Performance y release

- [ ] **Automático, bloqueante:** CI genera build de producción sin warnings críticos.
- [ ] **Manual, bloqueante:** 60 FPS objetivo en equipo de referencia y 30 FPS mínimo soportado.
- [ ] **Manual:** fallback WebGL 2 mantiene todas las funciones.
- [ ] **Manual:** modo WebGPU se activa sólo cuando es compatible.
- [ ] **Automático:** no hay errores de consola en recorrido E2E principal.
- [ ] **Automático:** PWA funciona offline después de primera carga.
- [ ] **Automático:** actualización de versión invalida caches incompatibles.
- [ ] **Manual, bloqueante:** URL pública carga, inicia y completa el vertical slice.
- [ ] **Manual:** licencia y permisos de assets están documentados.

## Definition of Done por feature

Una feature se considera terminada cuando:

1. satisface sus criterios funcionales;
2. tiene tests proporcionales a su riesgo;
3. no rompe determinismo ni invariantes;
4. incluye estados vacío, carga, error y recuperación cuando corresponden;
5. es usable con teclado y señales no dependientes sólo del color;
6. está documentada si agrega reglas, dependencias o decisiones;
7. funciona en el build de GitHub Pages;
8. deja el repositorio sin errores de lint, tipos ni tests.
