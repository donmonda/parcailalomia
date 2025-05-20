import { NextResponse } from "next/server"
import { getVentaModel } from "@/lib/models/venta"
import { getProductoModel } from "@/lib/models/producto"

// GET - Obtener una venta por ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const VentaModel = await getVentaModel()
    const venta = await VentaModel.findById(id).populate("cliente").populate("items.producto")

    if (!venta) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 })
    }

    return NextResponse.json(venta)
  } catch (error) {
    console.error("Error al obtener venta:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

// DELETE - Eliminar una venta
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const VentaModel = await getVentaModel()
    const ProductoModel = await getProductoModel()

    // Verificar si la venta existe
    const venta = await VentaModel.findById(id)

    if (!venta) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 })
    }

    // Si la venta está en estado "completada", devolver el stock de los productos
    if (venta.estado === "completada") {
      for (const item of venta.items) {
        await ProductoModel.findByIdAndUpdate(item.producto, { $inc: { stock: item.cantidad } })
      }
    }

    // Eliminar la venta
    await VentaModel.findByIdAndDelete(id)

    return NextResponse.json({ message: "Venta eliminada correctamente" })
  } catch (error) {
    console.error("Error al eliminar venta:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}
