# ADR 0001: Cliente estático con Vite y GitHub Pages

- Estado: aceptada
- Fecha: 2026-09-14

## Contexto

El repositorio ya publica un sitio en GitHub Pages. El MVP no necesita cuentas, datos compartidos ni lógica de servidor. La mayor parte del trabajo ocurre en el navegador: render 3D, simulación, replay y persistencia local.

## Decisión

Construir el cliente con React 19, TypeScript y Vite. Generar un build estático bajo el base path `/hospital-patagonia/` y publicarlo mediante GitHub Actions en GitHub Pages.

## Consecuencias

### Positivas

- hosting simple y consistente con el repositorio;
- operación offline mediante PWA;
- desarrollo rápido y bundle controlable;
- no requiere infraestructura adicional para el MVP.

### Negativas

- no permite estado multijugador autoritativo por sí solo;
- persistencia limitada al dispositivo salvo exportación;
- routing y assets deben respetar el base path.

## Alternativas consideradas

- Next.js/SSR: complejidad sin beneficio para el juego cliente.
- Backend desde el inicio: retrasa la validación del loop.
- Unity WebGL: bundle y pipeline menos adecuados para una webapp integrada.
