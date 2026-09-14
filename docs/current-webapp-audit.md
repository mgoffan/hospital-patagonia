# Auditoría de la webapp actual

## Alcance

Se inspeccionaron el HTML renderizado de `/simulator` y el bundle JavaScript público cargado por esa ruta el 2026-09-14.

- Aplicación: <https://queue-scan-assist.lovable.app/simulator>
- Bundle: <https://queue-scan-assist.lovable.app/assets/simulator-UNMSXjao.js>
- Sourcemap: no disponible públicamente (HTTP 404).

Por esa razón, los nombres de variables citados corresponden al bundle minificado y no al código fuente original.

## Responsabilidad actual

La aplicación funciona como reloj, generador de llegadas y registrador de entrada/salida mediante QR. No representa las estaciones internas ni valida el recorrido real del paciente.

### Flujo de uso

1. El operador elige uno de cuatro escenarios.
2. Presiona **Iniciar** y concede acceso a la cámara.
3. Comienza un contador de 300 segundos.
4. La aplicación anuncia las llegadas según el escenario elegido.
5. El primer escaneo de un código registra la entrada.
6. El segundo escaneo registra la salida y calcula el tiempo total.
7. Un tercer escaneo avisa que el usuario ya dejó el sistema.
8. Los resultados pueden exportarse a Excel.

## Escenarios de demanda

Los tiempos están expresados en segundos desde el inicio de la ronda.

| Escenario | Cantidad | Tiempos de llegada |
|---|---:|---|
| Demanda alta | 49 | `6, 12, 18, 28, 30, 42, 42, 48, 54, 60, 66, 66, 66, 84, 90, 96, 108, 108, 114, 126, 126, 132, 138, 144, 156, 156, 162, 169, 179, 180, 186, 197, 199, 204, 214, 216, 228, 230, 234, 246, 246, 258, 258, 264, 270, 276, 282, 288, 294` |
| Demanda intermedia | 28 | `8, 20, 35, 47, 58, 70, 78, 90, 90, 105, 120, 132, 144, 144, 158, 172, 185, 198, 198, 212, 226, 240, 252, 252, 265, 278, 288, 296` |
| Demanda media | 17 | `8, 14, 42, 63, 68, 95, 125, 129, 148, 180, 202, 206, 235, 252, 258, 280, 292` |
| Demanda baja | 8 | `25, 58, 100, 135, 170, 210, 250, 290` |

Las llegadas son arreglos constantes, no distribuciones probabilísticas. Esto permite repetir una demanda idéntica y comparar decisiones, aunque la interfaz la presenta como desconocida durante la ronda.

## Estado registrado por paciente

Cada código mantiene, en memoria:

- código;
- número de escaneos;
- instante del primer y último escaneo;
- duración;
- estado `pending`, `completed` o `late`;
- beneficio;
- orden de entrada.

El estado de la ronda no se persiste. La aplicación sí intenta cargar desde `localStorage` un mapa de mensajes bajo `qr_code_messages_v1`, aunque los mensajes efectivos del flujo inspeccionado se generan directamente en el componente. Esto parece ser una función heredada o incompleta.

## Lógica de clasificación

La aplicación toma el primer grupo de dígitos del contenido QR y lo convierte a entero.

```text
si código % 3 == 0 -> necesita análisis
si código % 5 == 0 -> usuario clave
```

Ambas condiciones pueden ser verdaderas; por ejemplo, el código `15` requiere análisis y es usuario clave.

## Validación de llegadas

Antes de aceptar un código nuevo, la aplicación compara:

```text
cantidad de códigos únicos registrados >= cantidad de llegadas ocurridas
```

Si la condición se cumple, rechaza el escaneo como “usuario que aún no llegó”. No comprueba que un código concreto forme parte de la secuencia; sólo limita la cantidad total de pacientes admitidos.

## Tiempos y duplicados

- Dos detecciones iguales separadas por menos de `1,5 s` se ignoran silenciosamente.
- Un reescaneo antes de `10 s` se desestima con aviso.
- En el segundo escaneo se redondea la diferencia entre timestamps a segundos.
- Una duración mayor a `60 s` produce estado `late` y beneficio `$0`.
- Una duración menor o igual a `60 s` produce estado `completed`.

## Métricas

La cabecera muestra:

- promedio de duración de pacientes `completed`;
- cantidad de completados;
- cantidad de registros con `completed == false`;
- suma de beneficios.

La métrica titulada “No atendidos” incluye tanto pacientes tarde como pacientes todavía pendientes. Para el nuevo producto conviene separar:

- WIP actual;
- abandonos/tardíos;
- egresos correctos;
- pacientes que nunca ingresaron.

## Exportación

La exportación genera un `.xlsx` con:

- turno;
- código;
- tiempo en segundos;
- estado;
- beneficio;
- total de beneficios.

## Web APIs y dependencias observadas

- React y hooks para interfaz y estado.
- Router con streaming/SSR compatible con el formato de TanStack Router/Start; esto es una inferencia por el marcador `$tsr` del HTML.
- Clases utilitarias compatibles con Tailwind CSS.
- `getUserMedia` para cámara.
- `canvas` y un decoder QR embebido.
- `requestAnimationFrame` para el ciclo de escaneo.
- Web Audio API para señales sonoras.
- Speech Synthesis para avisos hablados en español.
- SheetJS/XLSX para exportar resultados.
- `localStorage` para mensajes.

## Limitaciones relevantes para el videojuego

- No hay estado por estación ni cola interna.
- No existe capacidad explícita de cada recurso.
- No hay handoffs ni errores de información.
- El layout no afecta el resultado.
- No se distinguen tiempos de espera y procesamiento.
- El estado vive en un único navegador.
- No hay semilla o identificador formal de sesión.
- No hay replay ni event log completo.

El nuevo motor debe conservar las secuencias de demanda como fixtures de compatibilidad, pero modelar el flujo completo como eventos y estados de dominio.
