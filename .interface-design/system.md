# Sistema visual — Mercado Pago Playground

## Dirección
Herramienta de pruebas para desarrolladores: clara, operativa y serena. La información de pago debe poder escanearse rápidamente, con el monto y el estado como señales principales.

## Fundaciones
- Usar Bootstrap 5 como sistema de componentes y mantener el fondo claro con superficies blancas.
- Profundidad: tarjetas con shadow-sm; no añadir sombras más marcadas ni bordes decorativos.
- Espaciado: base de 4 px; tarjetas con p-4, separación entre módulos mt-4, y grupos de controles con gap-3.
- Tipografía: títulos h3 para la acción principal y h4 para módulos secundarios; texto de apoyo en text-secondary.

## Patrones reutilizables
- Módulo de operación: tarjeta con título, explicación breve, acción alineada a la derecha en escritorio y debajo en móvil.
- Tabla de datos: contenedor responsive, filas hover y alineación vertical centrada; números a la derecha y sin salto de línea; incluir caption accesible.
- Estado de pago: badge semántico — verde para approved, amarillo para pending e in_process, rojo para rejected, gris para cancelled y refunded; mostrar el detalle debajo en texto secundario.
- Estados asíncronos: botón deshabilitado y texto que describe la carga; comunicar resultados mediante una región role=status con aria-live=polite; ocultar tabla y paginación cuando no existan resultados o haya error.
- Paginación: bloque compacto bajo la tabla, con rango visible y grupo de botones nativos Anterior/Siguiente.

## Accesibilidad
- Mantener jerarquía de encabezados y secciones con aria-labelledby.
- Usar controles nativos y texto visible en botones; deshabilitar acciones no disponibles.
- Los datos no deben inyectarse con HTML: crear nodos y usar textContent.
