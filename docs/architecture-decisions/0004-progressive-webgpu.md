# ADR 0004: WebGL 2 baseline y WebGPU progresivo

- Estado: aceptada
- Fecha: 2026-09-14

## Contexto

WebGPU permite un renderer moderno, pero la simulación debe funcionar en el conjunto de navegadores y equipos usados en el aula. Three.js puede seleccionar WebGPU y usar un backend WebGL 2 cuando no está disponible.

## Decisión

Diseñar el renderer con WebGL 2 como baseline soportado. Activar WebGPU mediante detección de capacidad y mantener variantes económicas de materiales y efectos. Ninguna función operativa dependerá de WebGPU.

## Consecuencias

### Positivas

- adopta capacidades modernas sin excluir equipos;
- ofrece una ruta de mejora gráfica;
- fuerza límites claros entre reglas y render.

### Negativas

- dos rutas de renderer requieren pruebas;
- algunos materiales/efectos pueden necesitar variantes;
- el baseline limita técnicas exclusivas de WebGPU.

## Alternativas consideradas

- Sólo WebGPU: compatibilidad insuficiente para el aula.
- Sólo WebGL 2: menor complejidad, pero sin ruta moderna.
- Detectar soporte sin testear fallback: riesgo de release; descartado.
