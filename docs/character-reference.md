# Referencia y diseño de personajes

## Referencia externa

- [Videoclip oficial de Californication](https://www.youtube.com/watch?v=YlUKcNNmywk).
- [Captura y análisis del lenguaje de videojuego en A.V. Club](https://www.avclub.com/red-hot-chili-peppers-californication-music-video-video-1848608771).

El avatar observado utiliza anatomía humana completa y superficies de baja resolución: torso con hombros, pelvis, cuello, cabeza con rostro, cabello, brazos, manos, piernas y calzado. El aspecto retro surge de la cantidad limitada de polígonos y de la animación, no de reemplazar el cuerpo por símbolos geométricos.

## Traducción original para Hospital Patagonia

Los modelos del hospital no reproducen integrantes de la banda. Adoptan únicamente principios generales:

- proporciones humanas estilizadas;
- cabeza y manos levemente sobredimensionadas para facilitar lectura;
- torso y pelvis separados;
- brazos y piernas articulados;
- variación de piel, cabello, uniforme y ropa de pacientes;
- animación procedural de respiración y marcha;
- identificación visual del paciente VIP sin depender sólo del color de ropa.

## Flujo visible conectado

Los pacientes visibles ahora se derivan de las llegadas, colas, inicios de servicio y altas del event log determinista. La ronda comienza al entrar en first-person y reproduce los cinco minutos a velocidad `×10`.

- Los pacientes aparecen únicamente después de su llegada real.
- Cada cola recibe posiciones ordenadas por antigüedad.
- Cada slot de servicio tiene un anchor dentro de su sala.
- Un alta elimina al paciente del piso activo.
- El HUD muestra activos, pacientes en cola y altas acumuladas.
- El personal usa colliders fijos y los pacientes, cuerpos cinemáticos con cápsula.
- Las hojas abiertas de las puertas tienen colliders alineados con su rotación.

La simulación sigue siendo precomputada y determinista; el renderer reproduce su event log sin modificarlo. Las acciones manuales que alterarán ese log pertenecen al próximo incremento.

Las capturas externas fueron inspeccionadas de forma temporal y no forman parte del repositorio público.
