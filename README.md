# Hospital Patagonia

Webapp educativa first-person para explorar Gestión de Operaciones en Servicios mediante la simulación de un hospital de emergencias.

El proyecto se encuentra en pre-alpha. El corte actual implementa configuración, un prototipo visual 3D, simulación determinista de cinco minutos y debrief operativo/P&L.

## Corte jugable actual

1. Configurar demanda, rol y dotación.
2. Confirmar el snapshot económico.
3. Recorrer el prototipo visual low-poly del hospital en first-person.
4. Ejecutar una ronda headless con colas y capacidad.
5. Analizar pacientes, cuello de botella, utilización y P&L.

El mundo reproduce las llegadas, los servicios y las salidas del motor determinista. Los pacientes se detienen en Administración, reciben pulsera, siguen las cintas de piso, esperan sentados o de pie y evitan superponerse. La ronda aún se calcula antes de entrar al mundo: falta que las decisiones del jugador durante la partida modifiquen la simulación y el P&L.

## Desarrollo

Requiere Node.js 22.12 o posterior.

```bash
npm install
npm run dev
```

`npm run check` ejecuta formato, lint, tipos, tests y build de producción.
`npm run test:e2e -- --workers=1` valida los recorridos en Google Chrome. CI ejecuta solo el smoke `@smoke` para no depender de la duración de una ronda WebGL; la prueba de demanda alta `@extended` queda disponible con `npm run test:e2e -- --grep @extended --workers=1`.

## Documentación

Empezá por el [traspaso para la próxima sesión](./docs/continuity-handoff.md) para conocer el estado actual, las pruebas y el siguiente hito. El [índice de documentación](./docs/README.md) reúne las reglas de la simulación, la auditoría de la webapp existente, la lectura de los QR, el inventario visual y las decisiones de arquitectura.

## Sitio

La página pública se publica automáticamente desde la rama `gh-pages`:

<https://mgoffan.github.io/hospital-patagonia/>
