# Inventario visual y reconstrucción 3D

## Inventario del archivo fotográfico

El archivo `Archive 4.zip` contiene 17 fotografías útiles.

| Archivo | Contenido observado | Uso potencial |
|---|---|---|
| `IMG_7688.jpeg` | laboratorio con dos mesas de trabajo, mesadas y puerta | planta y mobiliario de laboratorio |
| `IMG_7689.jpeg` | consultorio con escritorio, área de examen y camilla | consultorio médico A |
| `IMG_7690.jpeg` | segunda toma/variante del consultorio | validación de proporciones o consultorio B |
| `IMG_7691.jpeg` | enfermería con dos puestos/camillas y mesada clínica | sala de enfermería |
| `IMG_7692.jpeg` | recepción y sala de espera | planta del front-office |
| `IMG_7693.jpeg` | segunda toma/variante de recepción y espera | validación del layout |
| `IMG_7694.jpeg` | segunda toma/variante del laboratorio | validación de proporciones |
| `IMG_7695.jpeg` | segunda toma/variante de recepción y espera | validación de mobiliario y circulación |
| `IMG_7696.jpeg` | radiología, camilla, equipo y mostrador | sala de radiología |
| `IMG_7697.jpeg` | pila de fichas con QR visible | ficha y QR `24` |
| `IMG_7698.jpeg` | pila de fichas con QR desenfocado | ficha y QR `12` |
| `IMG_7699.jpeg` | pila de fichas con QR visible | ficha y QR `28` |
| `IMG_7700.jpeg` | pila de fichas con QR visible | ficha y QR `27` |
| `IMG_7701.jpeg` | pila de fichas con QR visible | ficha y QR `5` |
| `IMG_7702.jpeg` | diagrama de flujo dibujado en pizarra | rutas y retornos del proceso usado |
| `IMG_7703.jpeg` | anotaciones de organización sobre tablero naranja | evidencia del método del equipo |
| `IMG_7704.jpeg` | distribución de roles/proceso sobre tableros naranjas | evidencia del método del equipo |

Algunas fotografías son variantes del mismo tablero físico. No debe asumirse automáticamente que cada imagen representa una habitación diferente.

## Lenguaje visual observado

- Vista cenital con falsa perspectiva en paredes y mobiliario.
- Contornos oscuros irregulares.
- Rellenos con apariencia de marcador o acuarela.
- Pisos azules/grises en áreas clínicas.
- Madera cálida en consultorios.
- Muebles celestes, verdes y marrones.
- Puertas rotuladas: `LABORATORIO`, `CONSULTORIO`, `ENFERMERÍA`, `RADIOLOGÍA` y `SALA DE ESPERA`.
- Plantas y objetos pequeños que vuelven reconocible cada espacio.

La estética más fiel no es fotorealista. Se propone un 3D estilizado que conserve el dibujo manual: geometría simple, contornos suaves y texturas con variación de acuarela.

## Elementos útiles para calibración

Los tableros incluyen:

- retícula regular en el piso;
- cruces y marcas de registro en los bordes;
- barras de color;
- líneas de fuga de las paredes;
- objetos repetidos, como sillas y camillas.

Estos elementos permiten corregir perspectiva y comparar escalas relativas. La medida real de cada celda no está indicada; deberá definirse y validarse antes de modelar. Una celda no debe convertirse automáticamente a metros sin esa confirmación.

## Método propuesto de reconstrucción

1. Conservar las fotos originales como evidencia, fuera del repositorio público hasta confirmar derechos.
2. Corregir rotación, lente y perspectiva del plano de piso.
3. Identificar las esquinas y contar las celdas de la retícula.
4. Crear un plano vectorial por sala.
5. Acordar una escala real y un ancho de circulación coherente.
6. Construir un kit modular en Blender:
   - paredes;
   - puertas y ventanas;
   - mesadas y escritorios;
   - sillas y camillas;
   - equipos clínicos simplificados;
   - señalización.
7. Conectar las salas mediante un corredor común, sin alterar su organización interna salvo decisión de diseño.
8. Aplicar materiales estilizados derivados de la paleta, no fotografías directas con reflejos.
9. Exportar en glTF/GLB y validar colisiones, rutas y distancias.

## Hospital base propuesto

```text
Entrada
  -> Recepción / sala de espera
  -> Enfermería
  -> Consultorio A
  -> Consultorio B
  -> Laboratorio
  -> Radiología
  -> Recepción / salida
```

El corredor debe permitir que el jugador vea acumulaciones sin ofrecer información perfecta. Ventanas interiores, cartelería y sonidos pueden comunicar carga operativa manteniendo la perspectiva limitada de cada rol.

## Objetos que deben ser interactivos

- fichas, pulseras y portapapeles;
- computadora de Administración;
- puestos de Enfermería;
- puertas y llamadores;
- escritorios médicos;
- bandeja de solicitudes y resultados;
- máquina/equipo de análisis;
- sillas de espera;
- tablero o terminal de indicadores.

No todo el mobiliario necesita física. Los objetos que representan estado o handoff sí deben tener interacción clara; el resto puede ser geometría estática optimizada.

## Datos ausentes

Las fotos no definen:

- altura de paredes y cielorrasos;
- conexión exacta entre todas las salas;
- dimensiones reales;
- exterior del hospital;
- iluminación real;
- cantidad definitiva de consultorios y recursos;
- si las variantes son duplicados o configuraciones alternativas.

Estas decisiones deberán quedar explícitas en el plan y no presentarse como reconstrucción literal.
