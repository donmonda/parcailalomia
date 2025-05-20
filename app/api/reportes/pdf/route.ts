import { NextResponse } from "next/server"
import { connectToAtlas } from "@/lib/db"
import PDFDocument from "pdfkit"

export async function POST(request: Request) {
  try {
    const { tipo, fechaInicio, fechaFin } = await request.json()

    // Validar datos de entrada
    if (!tipo || !fechaInicio || !fechaFin) {
      return NextResponse.json({ error: "Tipo de reporte y rango de fechas son requeridos" }, { status: 400 })
    }

    // Crear un nuevo documento PDF
    const doc = new PDFDocument({ margin: 50 })

    // Configurar el documento según el tipo de reporte
    let titulo

    switch (tipo) {
      case "ventas":
        titulo = "Reporte de Ventas"
        await generarReporteVentas(doc, fechaInicio, fechaFin)
        break
      case "productos":
        titulo = "Reporte de Productos"
        await generarReporteProductos(doc, fechaInicio, fechaFin)
        break
      case "clientes":
        titulo = "Reporte de Clientes"
        await generarReporteClientes(doc, fechaInicio, fechaFin)
        break
      default:
        return NextResponse.json({ error: "Tipo de reporte no válido" }, { status: 400 })
    }

    // Finalizar el documento
    doc.end()

    // Recopilar chunks
    const chunks: Buffer[] = []
    doc.on("data", (chunk) => chunks.push(chunk))

    // Devolver el PDF cuando esté completo
    return new Promise<NextResponse>((resolve, reject) => {
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks)
        resolve(
          new NextResponse(pdfBuffer, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="${titulo}.pdf"`,
            },
          }),
        )
      })

      doc.on("error", (err) => {
        reject(NextResponse.json({ error: "Error al generar PDF" }, { status: 500 }))
      })
    })
  } catch (error) {
    console.error("Error al generar reporte PDF:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

// Funciones auxiliares para generar reportes
async function generarReporteVentas(doc: PDFKit.PDFDocument, fechaInicio: string, fechaFin: string) {
  const conn = await connectToAtlas()
  const VentaModel = conn.model("Venta")

  const ventas = await VentaModel.find({
    fecha: {
      $gte: new Date(fechaInicio),
      $lte: new Date(fechaFin),
    },
  }).sort({ fecha: -1 })

  // Título
  doc.fontSize(20).text("Reporte de Ventas", { align: "center" })
  doc.moveDown()

  // Período
  doc
    .fontSize(12)
    .text(`Período: ${new Date(fechaInicio).toLocaleDateString()} - ${new Date(fechaFin).toLocaleDateString()}`, {
      align: "center",
    })
  doc.moveDown(2)

  // Tabla de ventas
  const tableTop = doc.y
  const tableLeft = 50
  const colWidths = [80, 80, 150, 80, 80]

  // Cabecera de la tabla
  doc.font("Helvetica-Bold")
  doc.text("Número", tableLeft, tableTop)
  doc.text("Fecha", tableLeft + colWidths[0], tableTop)
  doc.text("Cliente", tableLeft + colWidths[0] + colWidths[1], tableTop)
  doc.text("Estado", tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop)
  doc.text("Total", tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop)

  // Línea después de la cabecera
  doc
    .moveTo(tableLeft, tableTop + 20)
    .lineTo(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], tableTop + 20)
    .stroke()

  // Datos de la tabla
  doc.font("Helvetica")
  let y = tableTop + 30

  ventas.forEach((venta: any) => {
    doc.text(venta.numero, tableLeft, y)
    doc.text(venta.fecha.toLocaleDateString(), tableLeft + colWidths[0], y)
    doc.text(venta.nombreCliente, tableLeft + colWidths[0] + colWidths[1], y)
    doc.text(venta.estado, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], y)
    doc.text(`$${venta.total.toFixed(2)}`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], y)

    y += 20

    // Nueva página si es necesario
    if (y > doc.page.height - 50) {
      doc.addPage()
      y = 50
    }
  })

  // Resumen
  doc.moveDown(2)
  const totalVentas = ventas.reduce((sum: number, venta: any) => sum + venta.total, 0)
  doc.font("Helvetica-Bold").text(`Total de ventas: $${totalVentas.toFixed(2)}`, { align: "right" })
}

async function generarReporteProductos(doc: PDFKit.PDFDocument, fechaInicio: string, fechaFin: string) {
  const conn = await connectToAtlas()
  const ProductoModel = conn.model("Producto")

  const productos = await ProductoModel.find({}).sort({ nombre: 1 })

  // Título
  doc.fontSize(20).text("Reporte de Productos", { align: "center" })
  doc.moveDown()

  // Período
  doc.fontSize(12).text(`Fecha: ${new Date().toLocaleDateString()}`, { align: "center" })
  doc.moveDown(2)

  // Tabla de productos
  const tableTop = doc.y
  const tableLeft = 50
  const colWidths = [80, 150, 100, 80, 60]

  // Cabecera de la tabla
  doc.font("Helvetica-Bold")
  doc.text("SKU", tableLeft, tableTop)
  doc.text("Nombre", tableLeft + colWidths[0], tableTop)
  doc.text("Categoría", tableLeft + colWidths[0] + colWidths[1], tableTop)
  doc.text("Precio", tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop)
  doc.text("Stock", tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop)

  // Línea después de la cabecera
  doc
    .moveTo(tableLeft, tableTop + 20)
    .lineTo(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], tableTop + 20)
    .stroke()

  // Datos de la tabla
  doc.font("Helvetica")
  let y = tableTop + 30

  productos.forEach((producto: any) => {
    doc.text(producto.sku, tableLeft, y)
    doc.text(producto.nombre, tableLeft + colWidths[0], y)
    doc.text(producto.categoria, tableLeft + colWidths[0] + colWidths[1], y)
    doc.text(`$${producto.precio.toFixed(2)}`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], y)
    doc.text(producto.stock.toString(), tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], y)

    y += 20

    // Nueva página si es necesario
    if (y > doc.page.height - 50) {
      doc.addPage()
      y = 50
    }
  })

  // Resumen
  doc.moveDown(2)
  doc.font("Helvetica-Bold").text(`Total de productos: ${productos.length}`, { align: "right" })
}

async function generarReporteClientes(doc: PDFKit.PDFDocument, fechaInicio: string, fechaFin: string) {
  const conn = await connectToAtlas()
  const ClienteModel = conn.model("Cliente")
  const VentaModel = conn.model("Venta")

  const clientes = await ClienteModel.find({}).sort({ nombre: 1 })

  // Título
  doc.fontSize(20).text("Reporte de Clientes", { align: "center" })
  doc.moveDown()

  // Período
  doc
    .fontSize(12)
    .text(`Período: ${new Date(fechaInicio).toLocaleDateString()} - ${new Date(fechaFin).toLocaleDateString()}`, {
      align: "center",
    })
  doc.moveDown(2)

  // Tabla de clientes
  const tableTop = doc.y
  const tableLeft = 50
  const colWidths = [150, 150, 80, 80, 80]

  // Cabecera de la tabla
  doc.font("Helvetica-Bold")
  doc.text("Nombre", tableLeft, tableTop)
  doc.text("Email", tableLeft + colWidths[0], tableTop)
  doc.text("Teléfono", tableLeft + colWidths[0] + colWidths[1], tableTop)
  doc.text("RFC", tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop)
  doc.text("Total Compras", tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop)

  // Línea después de la cabecera
  doc
    .moveTo(tableLeft, tableTop + 20)
    .lineTo(tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], tableTop + 20)
    .stroke()

  // Datos de la tabla
  doc.font("Helvetica")
  let y = tableTop + 30

  for (const cliente of clientes) {
    const ventas = await VentaModel.find({
      cliente: cliente._id,
      fecha: {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin),
      },
    })

    const totalCompras = ventas.reduce((sum: number, venta: any) => sum + venta.total, 0)

    doc.text(cliente.nombre, tableLeft, y)
    doc.text(cliente.email, tableLeft + colWidths[0], y)
    doc.text(cliente.telefono, tableLeft + colWidths[0] + colWidths[1], y)
    doc.text(cliente.rfc, tableLeft + colWidths[0] + colWidths[1] + colWidths[2], y)
    doc.text(`$${totalCompras.toFixed(2)}`, tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], y)

    y += 20

    // Nueva página si es necesario
    if (y > doc.page.height - 50) {
      doc.addPage()
      y = 50
    }
  }

  // Resumen
  doc.moveDown(2)
  doc.font("Helvetica-Bold").text(`Total de clientes: ${clientes.length}`, { align: "right" })
}
