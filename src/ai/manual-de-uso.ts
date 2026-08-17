export interface ManualAccion {
  nombre: string;
  pasos: string[];
}

export interface ManualSeccion {
  seccion: string;
  descripcion: string;
  acciones: ManualAccion[];
}

export const MANUAL_DE_USO: ManualSeccion[] = [
  {
    seccion: 'Stock',
    descripcion:
      'Pantalla principal (Inicio). Muestra el resumen del inventario de pajuelas, con búsqueda por toro o cliente y exportación de reportes.',
    acciones: [
      {
        nombre: 'Ver el resumen de stock',
        pasos: [
          'Entrá a la sección Stock (Inicio) desde el menú lateral.',
          'Ahí se listan las colectas con su stock, el toro, el cliente y la fecha.',
        ],
      },
      {
        nombre: 'Buscar una colecta',
        pasos: [
          'En Stock (Inicio), usá el buscador que dice "Buscar por toro o cliente".',
          'Escribí el nombre del toro o del cliente y los resultados se filtran.',
        ],
      },
    ],
  },
  {
    seccion: 'Colectas',
    descripcion:
      'Una colecta es un lote de pajuelas de un toro, de una raza, con su calidad (vigor/motilidad), fecha y cliente.',
    acciones: [
      {
        nombre: 'Registrar una colecta nueva',
        pasos: [
          'En Stock (Inicio), tocá el botón "Registrar nueva colecta".',
          'Completá toro, cliente, fecha, vigor/motilidad, cantidad y color.',
          'Agregá uno o más contenedores con "+ Agregar Contenedor" (termo, canastillo y cantidad).',
          'Tocá "Registrar Colecta" para guardar.',
        ],
      },
      {
        nombre: 'Editar una colecta',
        pasos: [
          'Abrí el detalle de la colecta desde el listado.',
          'Tocá editar, modificá los campos y confirmá con "Actualizar Colecta".',
        ],
      },
    ],
  },
  {
    seccion: 'Movimientos',
    descripcion:
      'Los movimientos son ingresos o salidas de pajuelas de una colecta, con cliente, remito y notas.',
    acciones: [
      {
        nombre: 'Registrar un ingreso',
        pasos: [
          'Abrí el detalle de la colecta (sección Stock → clic en la colecta).',
          'Elegí la opción de registrar ingreso.',
          'Completá cantidad, cliente, remito y notas, y confirmá con "Registrar Ingreso".',
        ],
      },
      {
        nombre: 'Registrar una salida',
        pasos: [
          'Abrí el detalle de la colecta (sección Stock → clic en la colecta).',
          'Elegí la opción de registrar salida.',
          'Completá cantidad, cliente, remito y notas, y confirmá con "Registrar Salida".',
        ],
      },
      {
        nombre: 'Transferir stock entre termos',
        pasos: [
          'Abrí el detalle de la colecta.',
          'Tocá la opción de transferencia.',
          'Elegí el termo/canastillo de origen y el de destino con la cantidad, y confirmá.',
        ],
      },
    ],
  },
  {
    seccion: 'Toros',
    descripcion:
      'Catálogo de toros con su raza. Las razas disponibles son AA, AAC, AAN, PH, SH y LMAn.',
    acciones: [
      {
        nombre: 'Agregar un toro',
        pasos: [
          'En el menú lateral, entrá a la sección Toros.',
          'Tocá el botón "Nuevo Toro".',
          'Completá el nombre y elegí la raza.',
          'Tocá "Crear Toro" para guardar.',
        ],
      },
      {
        nombre: 'Editar un toro',
        pasos: [
          'En la sección Toros, elegí el toro del listado.',
          'Tocá editar, modificá nombre o raza y confirmá con "Guardar Cambios".',
        ],
      },
    ],
  },
  {
    seccion: 'Termos',
    descripcion:
      'Termos criogénicos que almacenan las pajuelas por canastillos. La capacidad se calcula automáticamente según el código del termo.',
    acciones: [
      {
        nombre: 'Agregar un termo',
        pasos: [
          'En el menú lateral, entrá a la sección Termos.',
          'Tocá el botón "Nuevo Termo".',
          'Ingresá el código del termo y tocá "Crear Termo".',
        ],
      },
      {
        nombre: 'Activar o desactivar un termo',
        pasos: [
          'En la sección Termos, sobre la tarjeta del termo tocá "Desactivar" o "Activar".',
        ],
      },
    ],
  },
  {
    seccion: 'Clientes',
    descripcion:
      'Clientes con su razón social y CUIT, a los que se les asocian colectas y movimientos.',
    acciones: [
      {
        nombre: 'Agregar un cliente',
        pasos: [
          'En el menú lateral, entrá a la sección Clientes.',
          'Tocá el botón "Nuevo Cliente".',
          'Completá la razón social y el CUIT.',
          'Tocá "Crear Cliente" para guardar.',
        ],
      },
      {
        nombre: 'Editar un cliente',
        pasos: [
          'En la sección Clientes, elegí el cliente del listado.',
          'Tocá editar, modificá los datos y confirmá con "Guardar Cambios".',
        ],
      },
    ],
  },
  {
    seccion: 'Remitos',
    descripcion:
      'Pantalla de remitos de salida. Agrupa los movimientos por número de remito y permite exportarlos.',
    acciones: [
      {
        nombre: 'Ver un remito',
        pasos: [
          'En el menú lateral, entrá a la sección Remitos.',
          'Abrí el acordeón del remito que quieras consultar para ver su detalle.',
        ],
      },
      {
        nombre: 'Exportar remitos',
        pasos: [
          'En la sección Remitos, usá el menú de exportación para descargar PDF o XLSX.',
        ],
      },
    ],
  },
  {
    seccion: 'Historial',
    descripcion:
      'Pantalla con el historial de movimientos, filtrable por tipo, fecha, cliente, remito y toro.',
    acciones: [
      {
        nombre: 'Filtrar el historial',
        pasos: [
          'En el menú lateral, entrá a la sección Historial.',
          'Usá los filtros disponibles (tipo de movimiento, fecha, cliente, remito, toro).',
        ],
      },
      {
        nombre: 'Exportar el historial',
        pasos: [
          'En la sección Historial, usá el menú de exportación para descargar PDF o XLSX.',
        ],
      },
    ],
  },
];

export function obtenerManual(seccion?: string): ManualSeccion[] {
  if (!seccion || !seccion.trim()) {
    return MANUAL_DE_USO;
  }
  const termino = seccion.toLowerCase().trim();
  return MANUAL_DE_USO.filter(
    (s) =>
      s.seccion.toLowerCase().includes(termino) ||
      s.descripcion.toLowerCase().includes(termino) ||
      s.acciones.some((a) => a.nombre.toLowerCase().includes(termino)),
  );
}
