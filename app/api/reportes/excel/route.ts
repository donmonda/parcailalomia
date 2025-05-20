import { NextResponse } from "next/server"
import { connectToAtlas } from "@/lib/db"
import ExcelJS from "exceljs"

export async function POST(request: Request) {
  try {
    const { tipo, fechaInicio, fechaFin } = await request.json()

    // Validar datos de entrada
    if (!tipo || !fechaInicio || !fechaFin) {
      return NextResponse.json({ error: "Tipo de reporte y rango de fechas son requeridos" }, { status: 400 })
    }

    // Crear un nuevo libro de Excel
    const workbook = new ExcelJS.Workbook()
    workbook.creator = "Sistema de Inventario"
    workbook.lastModifiedBy = "API"
    workbook.created = new Date()
    workbook.modified = new Date()

    // Obtener datos según el tipo de reporte
    let datos
    let nombreHoja

    switch (tipo) {
      case "ventas":
        datos = await obtenerDatosVentas(fechaInicio, fechaFin)
        nombreHoja = "Reporte de Ventas"
        break
      case "productos":
        datos = await obtenerDatosProductos(fechaInicio, fechaFin)
        nombreHoja = "Reporte de Productos"
        break
      case "clientes":
        datos = await obtenerDatosClientes(fechaInicio, fechaFin)
        nombreHoja = "Reporte de Clientes"
        break
      default:
        return NextResponse.json({ error: "Tipo de reporte no válido" }, { status: 400 })
    }

    // Crear hoja de cálculo
    const sheet = workbook.addWorksheet(nombreHoja)

    // Configurar columnas según el tipo de reporte
    if (tipo === "ventas") {
      sheet.columns = [
        { header: "Número", key: "numero", width: 15 },
        { header: "Fecha", key: "fecha", width: 15 },
        { header: "Cliente", key: "cliente", width: 30 },
        { header: "Estado", key: "estado", width: 15 },
        { header: "Total", key: "total", width: 15 },
      ]
    } else if (tipo === "productos") {
      sheet.columns = [
        { header: "SKU", key: "sku", width: 15 },
        { header: "Nombre", key: "nombre", width: 30 },
        { header: "Categoría", key: "categoria", width: 20 },
        { header: "Precio", key: "precio", width: 15 },
        { header: "Stock", key: "stock", width: 15 },
      ]
    } else if (tipo === "clientes") {
      sheet.columns = [
        { header: "Nombre", key: "nombre", width: 30 },
        { header: "Email", key: "email", width: 30 },
        { header: "Teléfono", key: "telefono", width: 15 },
        { header: "RFC", key: "rfc", width: 20 },
        { header: "Total Compras", key: "totalCompras", width: 15 },
      ]
    }

    // Agregar datos a la hoja
    sheet.addRows(datos)

    // Estilo para la cabecera
    sheet.getRow(1).font = { bold: true }
    sheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" },
    }

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Devolver el archivo Excel como respuesta
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${nombreHoja}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Error al generar reporte Excel:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

// Funciones auxiliares para obtener datos
async function obtenerDatosVentas(fechaInicio: string, fechaFin: string) {
  const conn = await connectToAtlas()
  const VentaModel = conn.model("Venta")

  const ventas = await VentaModel.find({
    fecha: {
      $gte: new Date(fechaInicio),
      $lte: new Date(fechaFin),
    },
  }).sort({ fecha: -1 })

  return ventas.map((venta: any) => ({
    numero: venta.numero,
    fecha: venta.fecha.toLocaleDateString(),
    cliente: venta.nombreCliente,
    estado: venta.estado,
    total: venta.total.toFixed(2),
  }))
}

async function obtenerDatosProductos(fechaInicio: string, fechaFin: string) {
  const conn = await connectToAtlas()
  const ProductoModel = conn.model("Producto")

  const productos = await ProductoModel.find({}).sort({ nombre: 1 })

  return productos.map((producto: any) => ({
    sku: producto.sku,
    nombre: producto.nombre,
    categoria: producto.categoria,
    precio: producto.precio.toFixed(2),
    stock: producto.stock,
  }))
}

async function obtenerDatosClientes(fechaInicio: string, fechaFin: string) {
  const conn = await connectToAtlas()
  const ClienteModel = conn.model("Cliente")
  const VentaModel = conn.model("Venta")

  const clientes = await ClienteModel.find({}).sort({ nombre: 1 })

  // Para cada cliente, calcular el total de compras en el período
  const clientesConCompras = await Promise.all(
    clientes.map(async (cliente: any) => {
      const ventas = await VentaModel.find({
        cliente: cliente._id,
        fecha: {
          $gte: new Date(fechaInicio),
          $lte: new Date(fechaFin),
        },
      })

      const totalCompras = ventas.reduce((sum: number, venta: any) => sum + venta.total, 0)

      return {
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono,
        rfc: cliente.rfc,
        totalCompras: totalCompras.toFixed(2),
      }
    }),
  )

  return clientesConCompras
}
