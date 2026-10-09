# Flujo de caja ODESA

Tablero interactivo del flujo de efectivo de ODESA Caribe SAS.

## Archivos

- `index.html`: pantalla de ingreso. Pide la contraseña y, si es correcta, lleva al tablero.
- `tablero.html`: el tablero con los datos. Si se abre sin haber ingresado, devuelve a la pantalla de ingreso.
- `cripto.js`: cifrado y sesión, compartido por las dos pantallas.
- `data.enc.js`: los datos del flujo, cifrados con AES-256. Sin la contraseña no se pueden leer. Es el único archivo que se reemplaza cada mes.

Nunca subir a este repositorio el Excel de contabilidad ni un `data.js` sin cifrar.

## Actualización mensual

1. Ingresar al tablero (`tablero.html`) desde la página publicada.
2. Hacer clic en **Cargar Excel nuevo** y elegir el Excel del flujo de efectivo que se descarga de contabilidad.
3. Escribir la contraseña dos veces y hacer clic en **Descargar data.enc.js**.
4. En GitHub, elegir **Add file → Upload files**, arrastrar el `data.enc.js` nuevo y hacer clic en **Commit changes**.

La página se actualiza sola en uno o dos minutos.

## Contraseña

- Usar una frase larga, de al menos 4 palabras o 16 caracteres.
- Enviarla a los jefes por un medio distinto al del enlace.
- Para cambiarla, generar de nuevo `data.enc.js` con la contraseña nueva y subirlo.
