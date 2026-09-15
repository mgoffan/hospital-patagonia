# Dirección de arte

## Norte visual

El juego adopta una estética de videojuego 3D de fines de los noventa inspirada en el videoclip oficial de **Californication**: formas low-poly legibles, colores saturados, cielos amplios, iluminación solar exagerada y una presentación que se siente como un juego de consola imaginado desde otro medio.

Referencia principal: [videoclip oficial](https://www.youtube.com/watch?v=YlUKcNNmywk).

La referencia guía el lenguaje visual; no se copiarán personajes, logos, escenas, música, tipografías ni assets del video.

## Traducción a Hospital Patagonia

- Arquitectura de polígonos grandes y siluetas simples.
- Personajes estilizados con proporciones amigables, sin realismo clínico.
- Sombras definidas, gradientes de cielo y niebla coloreada.
- Paleta cálida exterior y salas codificadas con acentos intensos.
- Texturas pequeñas, pintadas y ligeramente imperfectas.
- Animaciones expresivas con pocos keyframes.
- Señalética grande integrada al mundo.
- HUD compacto con paneles translúcidos, números gruesos y transiciones de arcade.

## Paleta inicial

| Uso | Color |
|---|---|
| Cielo / foco | `#73CFE6` |
| Sol / alerta amable | `#FFD166` |
| Terracota | `#D96C4B` |
| Vegetación / éxito | `#4E9F6D` |
| Azul hospital | `#236A8D` |
| Tinta | `#17252E` |
| Papel / superficie | `#F4E9D8` |
| VIP | `#E94F8A` |

## Render propuesto

- Three.js + React Three Fiber.
- Geometría low-poly y materiales `MeshToonMaterial` o shader propio muy pequeño.
- Vertex colors y texturas atlas de baja resolución.
- Iluminación direccional principal más ambiente hemisférico.
- Sombras limitadas a personajes y props críticos.
- Fog para profundidad y para mantener bajo el costo de dibujo.
- Postprocesado mínimo y opcional; el aspecto debe sobrevivir sin él.

## Movimiento y cámara

Aunque el videoclip se presenta principalmente en tercera persona, Hospital Patagonia conserva first-person para reforzar información parcial y responsabilidad por rol. El parentesco visual se construye con mundo, color, animación y UI, no copiando el encuadre del video.

## Guardrails

- No usar el audio de RHCP ni imitar su identidad de marca.
- No reconstruir una escena reconocible del videoclip.
- No usar modelos que parezcan miembros de la banda.
- No aplicar filtros que reduzcan la legibilidad de colas o estados.
- Mantener texto nítido aunque el mundo use baja resolución visual.

