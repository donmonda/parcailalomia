import { NextResponse } from "next/server"
import { getVentaModel } from "@/lib/models/venta"
import { getProductoModel } from "@/lib/models/producto"

// PUT - Procesar devolución de venta
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const VentaModel = await getVentaModel()
    const ProductoModel = await getProductoModel()

    // Verificar si la venta existe
    const venta = await VentaModel.findById(id)

    if (!venta) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 })
    }

    // Verificar si la venta ya fue devuelta
    if (venta.estado === "devuelta") {
      return NextResponse.json({ error: "Esta venta ya ha sido devuelta" }, { status: 400 })
    }

    // Actualizar estado de la venta
    const ventaActualizada = await VentaModel.findByIdAndUpdate(id, { estado: "devuelta" }, { new: true })
      .populate("cliente")
      .populate("items.producto")

    // Devolver stock de productos
    for (const item of venta.items) {
      await ProductoModel.findByIdAndUpdate(item.producto, { $inc: { stock: item.cantidad } })
    }

    return NextResponse.json(ventaActualizada)
  } catch (error) {
    console.error("Error al procesar devolución:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}
