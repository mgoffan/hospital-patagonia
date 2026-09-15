# Hospital Patagonia

Webapp educativa first-person para explorar Gestión de Operaciones en Servicios mediante la simulación de un hospital de emergencias.

El proyecto se encuentra en pre-alpha. El corte actual implementa configuración, un prototipo visual 3D, simulación determinista de cinco minutos y debrief operativo/P&L.

## Corte jugable actual

1. Configurar demanda, rol y dotación.
2. Confirmar el snapshot económico.
3. Recorrer el prototipo visual low-poly del hospital en first-person.
4. Ejecutar una ronda headless con colas y capacidad.
5. Analizar pacientes, cuello de botella, utilización y P&L.

El mundo incluye una primera circulación animada de pacientes para validar su lectura. El siguiente hito conecta esas rutas con el motor determinista y agrega tareas interactivas; por ahora, simulación y render permanecen desacoplados.

## Desarrollo

Requiere Node.js 22.12 o posterior.

```bash
npm install
npm run dev
```

`npm run check` ejecuta formato, lint, tipos, tests y build de producción.
`npm run test:e2e` levanta el build y valida el flujo completo en Google Chrome.

## Documentación

La [investigación previa al plan](./docs/README.md) reúne las reglas de la simulación, la auditoría de la webapp existente, la lectura de los QR, el inventario visual, el concepto de juego y la arquitectura técnica propuesta.

## Sitio

La página pública se publica automáticamente desde la rama `gh-pages`:

<https://mgoffan.github.io/hospital-patagonia/>
