# Lectura de códigos QR

## Resultado

Se detectaron cinco códigos QR completamente visibles en las fotografías de fichas. Todos contienen texto numérico plano; ninguno contiene una URL ni datos personales.

| Fotografía | Contenido QR | Divisible por 3 | Divisible por 5 | Interpretación de la webapp |
|---|---:|---:|---:|---|
| `IMG_7697.jpeg` | `24` | sí | no | paciente normal que necesita análisis |
| `IMG_7698.jpeg` | `12` | sí | no | paciente normal que necesita análisis |
| `IMG_7699.jpeg` | `28` | no | no | paciente normal sin análisis |
| `IMG_7700.jpeg` | `27` | sí | no | paciente normal que necesita análisis |
| `IMG_7701.jpeg` | `5` | no | sí | usuario clave sin análisis |

## Método

1. Se extrajeron las fotografías del ZIP hacia un directorio temporal.
2. Se intentó una lectura directa con ZBar.
3. ZBar recuperó `28` y `5` directamente.
4. Se recortaron las regiones QR y se corrigió la perspectiva sobre copias temporales.
5. La corrección permitió recuperar `24` y `27` con ZBar.
6. Se verificó el conjunto completo con ZXing-C++ sobre las fotografías originales; recuperó `24`, `12`, `28`, `27` y `5` sin errores reportados.

La fotografía `IMG_7698.jpeg` está notablemente desenfocada y no fue legible con ZBar. Su resultado `12` proviene de ZXing-C++, que pudo decodificar el QR directamente en la fotografía original.

## Alcance y limitaciones

- Sólo se reportan códigos cuya superficie completa es visible.
- Las fichas inferiores de cada pila están parcialmente ocultas y no pueden decodificarse de manera confiable.
- Los números manuscritos visibles en algunas fichas no deben usarse para reemplazar el contenido QR: son campos diferentes y no siempre coinciden.
- La interpretación de análisis/gravedad corresponde al algoritmo de la webapp inspeccionada; debe confirmarse como regla definitiva antes de implementar el motor.

## Implicancia para el nuevo producto

El QR funciona como identificador compacto y como generador implícito de atributos mediante divisibilidad. En una aplicación totalmente digital conviene separar esos conceptos:

```ts
type Patient = {
  id: string;
  severity: "normal" | "key";
  requiresAnalysis: boolean;
};
```

Para compatibilidad con las fichas físicas se puede mantener un importador que derive atributos desde el código numérico, sin acoplar el modelo interno a `% 3` y `% 5`.
