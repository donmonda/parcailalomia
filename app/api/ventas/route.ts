import { NextResponse } from "next/server"
import { getVentaModel } from "@/lib/models/venta"
import { getProductoModel } from "@/lib/models/producto"

// GET - Obtener todas las ventas
export async function GET() {
  try {
    const VentaModel = await getVentaModel()
    const ventas = await VentaModel.find({}).sort({ fecha: -1 }).populate("cliente").populate("items.producto")

    return NextResponse.json(ventas)
  } catch (error) {
    console.error("Error al obtener ventas:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

// POST - Crear una nueva venta
export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validar datos de entrada
    if (!data.cliente || !data.items || data.items.length === 0) {
      return NextResponse.json({ error: "Cliente e items son requeridos" }, { status: 400 })
    }

    const VentaModel = await getVentaModel()
    const ProductoModel = await getProductoModel()

    // Generar número de venta
    const count = await VentaModel.countDocuments()
    const numeroVenta = `F-${(count + 1).toString().padStart(4, "0")}`

    // Verificar stock y calcular totales
    let subtotal = 0
    const itemsVenta = []

    for (const item of data.items) {
      // Verificar si el producto existe y tiene stock suficiente
      const producto = await ProductoModel.findById(item.productoId)

      if (!producto) {
        return NextResponse.json({ error: `Producto con ID ${item.productoId} no encontrado` }, { status: 404 })
      }

      if (producto.stock < item.cantidad) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}` },
          { status: 400 },
        )
      }

      // Calcular subtotal del item
      const subtotalItem = producto.precio * item.cantidad
      subtotal += subtotalItem

      // Agregar item a la venta
      itemsVenta.push({
        producto: item.productoId,
        cantidad: item.cantidad,
        precio: producto.precio,
        subtotal: subtotalItem,
      })
    }

    // Calcular IVA y total
    const iva = subtotal * 0.16
    const total = subtotal + iva

    // Crear la nueva venta
    const nuevaVenta = new VentaModel({
      numero: numeroVenta,
      fecha: new Date(),
      cliente: data.cliente,
      items: itemsVenta,
      subtotal,
      iva,
      total,
      estado: "completada",
    })

    await nuevaVenta.save()

    // Actualizar stock de productos
    for (const item of data.items) {
      await ProductoModel.findByIdAndUpdate(item.productoId, { $inc: { stock: -item.cantidad } })
    }

    // Obtener la venta con los datos completos
    const ventaCompleta = await VentaModel.findById(nuevaVenta._id).populate("cliente").populate("items.producto")

    return NextResponse.json(ventaCompleta, { status: 201 })
  } catch (error) {
    console.error("Error al crear venta:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}
