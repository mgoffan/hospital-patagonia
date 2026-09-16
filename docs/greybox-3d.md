# Greybox 3D first-person

## Estado del corte

La aplicación incluye una fase 3D entre la configuración y el debrief. Ya incorpora pacientes y circulación física vinculada al event log; el objetivo pendiente es convertir las tareas del jugador en acciones que afecten la simulación.

El motor headless procesa la ronda al entrar en esta fase. El reloj visible comienza pausado y puede iniciarse o detenerse; la vista reproduce los eventos calculados. El debrief muestra los resultados de esa ronda precomputada.

## Espacios implementados

- Administración y recepción;
- Enfermería;
- Consultorio 1;
- Consultorio 2;
- Rayos;
- lobby de Administración y espera;
- pasillo clínico transversal;
- Laboratorio;
- perímetro y divisiones con colliders.

La planta es una interpretación jugable de las fotografías, no una reconstrucción métrica. Se utiliza geometría low-poly, pisos codificados por color, cartelería integrada y props provisionales por estación.

## Controles

| Acción | Control |
|---|---|
| Entrar en cámara | botón `Entrar e iniciar ronda` |
| Moverse | `WASD` o flechas del teclado |
| Mirar | mouse con Pointer Lock |
| Liberar mouse | `Esc` |
| Avanzar/retroceder sin Pointer Lock | controles visibles `↑` / `↓` |
| Girar sin Pointer Lock | controles visibles `↶` / `↷` |
| Terminar recorrido | botón `Saltar al resultado` / `Ver resultados` |

## Stack implementado

| Librería | Versión | Uso |
|---|---:|---|
| React | `19.2.8` | UI y ciclo de pantallas |
| Three.js | `0.186.0` | escena y render WebGL |
| React Three Fiber | `9.7.0` | reconciliación declarativa 3D |
| Drei | `10.7.8` | labels HTML en el mundo |
| React Three Rapier | `2.2.0` | colliders y cuerpo del jugador |

React se fijó en `19.2.8` porque React Three Fiber `9.7.0` declara compatibilidad con React `>=19 <19.3`. No se utilizó `--force` para instalar una combinación fuera de soporte.

## Carga y performance

La ruta de operación y el viewport WebGL usan imports dinámicos separados:

```text
setup / debrief
  -> carga GameOperation
      -> si existe WebGL, carga HospitalViewport + Three + Rapier
```

El bundle inicial no precarga el runtime 3D. Rapier incluye su runtime WASM en el chunk diferido; por eso ese chunk es deliberadamente más pesado y sólo se solicita al entrar en la fase de operación.

## Fallback

Si `WebGLRenderingContext` no existe:

- no se importa el viewport 3D;
- se muestra un mensaje accesible;
- el usuario puede ejecutar igualmente la simulación headless;
- el debrief conserva todas sus funciones.

## Verificación

El smoke test de Playwright usa Google Chrome y verifica:

- carga del setup;
- confirmación de partida;
- creación del canvas WebGL;
- aparición de cartelería dentro de la escena;
- transición al debrief;
- ausencia de errores de consola.

## Pendiente tras la circulación M4

- raycast y foco de objetos;
- prompts contextuales con tecla `E`;
- comandos de Administración que afecten el motor y el P&L durante la ronda;
- coworkers capaces de reaccionar a esos comandos;
- evaluar si hace falta navmesh más allá de la red ortogonal actual;
- verificar que los controles alternativos respeten todas las colisiones;
- reconciliar tiempo lógico y trayectos físicos para la interacción;
- medición manual de FPS y compatibilidad en navegadores;
- reemplazo gradual de props provisionales por kit modular derivado de las referencias autorizadas.

## Corrección de planta posterior a validación

La primera revisión confirmó escala general, cámara, colisiones y carga, pero detectó una interpretación incorrecta de las dimensiones de las primitivas. La planta se reconstruyó con medidas totales explícitas y ahora tiene:

- una losa continua de `28 × 18` unidades, sin vacíos entre zonas;
- perímetro cerrado con un único acceso frontal;
- lobby conectado a un pasillo transversal continuo;
- cinco salas independientes al norte del pasillo;
- un vano de puerta visible y transitable por sala;
- muros divisorios completos desde el pasillo hasta el fondo.

La distribución, las puertas, el pasillo, la navegación, la cámara, las colisiones y el tiempo de carga fueron aprobados en la revisión siguiente. La incidencia atribuida inicialmente a la tecla `D` provenía de la extensión Vimium y no del controlador.

## Primer pase visual M3

Sin alterar la planta aprobada, el greybox recibió una primera capa artística basada en las maquetas fotográficas:

- retícula de baldosas clínicas, alfombra azul y sectores de madera;
- escritorios y camillas en ambos consultorios;
- dos puestos y mesada perimetral en Enfermería;
- islas de trabajo y mesada lateral en Laboratorio;
- camilla, equipo y guardado en Radiología;
- recepción, seis asientos de espera, afiche y vegetación;
- puertas codificadas por sala, zócalos cálidos y contornos oscuros;
- cielo saturado, sol facetado, montañas low-poly y tratamiento sutil de pantalla.

Los elementos se construyen con geometría procedural liviana. Las fotografías originales continúan fuera del repositorio público y sólo se usan como referencia.

### Segunda revisión visual

La primera capa M3 fue considerada todavía demasiado primitiva, con trazos excesivos y baja densidad general. La iteración siguiente:

- elimina los contornos automáticos de arquitectura y mobiliario;
- reemplaza superficies planas por un material pintado original y tintable;
- suaviza las líneas de las baldosas y la señalética;
- agrega cielorraso, luminarias y luz interior localizada;
- suma ventanas, armarios, carros clínicos, vegetación y personal;
- usa cantos suavemente redondeados en los props sin alterar los colliders estructurales.

### Flujo visual de pacientes M4

La circulación ya no es una decoración independiente del motor:

- el reloj corre en tiempo real y los personajes recorren físicamente los eventos en orden, incluso si quedan detrás del tiempo lógico;
- las colas clínicas ocupan la sala de espera y los servicios llevan al paciente por el pasillo y la puerta correspondiente;
- el alta conserva al personaje durante su caminata hacia la salida;
- cada ruta se descompone en tramos ortogonales: los pacientes solo giran 90° y nunca caminan en diagonal;
- la entrada admite un paciente por vez hasta que libera Administración, evitando que dos personajes aparezcan en el mismo punto;
- al llegar, cada paciente se detiene 0,5 segundos completos frente al mostrador de Administración; allí recibe la pulsera antes de continuar;
- el QR numérico aparece en frente y espalda de la remera;
- después de Administración se colocan pulseras verdes, amarillas, violetas o rosas para distinguir normal/VIP y con/sin análisis;
- las cintas de piso coral, verde, amarilla, naranja y azul son la misma red ortogonal que usan los pacientes; los tramos dejan libres muros, hojas de puertas y mobiliario;
- el pasillo clínico usa el carril inferior hacia el este y el superior hacia el oeste; los accesos a las puertas mantienen ejes separados para entrada y salida;
- los seis primeros pacientes en espera ocupan una silla solo al alcanzar su punto de llegada, dejan de caminar y miran hacia el pasillo; el excedente espera de pie en posiciones separadas;
- una espera significativa entre servicios se representa físicamente, aunque el recorrido 3D vaya retrasado respecto del reloj lógico;
- el umbral de tardanza de la webapp (`> 60 s`) se expresa con sangre en la cabeza y una etiqueta roja `TARDE`;
- los colliders de personas apoyan en la cota superior del piso y las puertas abren sobre la bisagra real para despejar el vano.
