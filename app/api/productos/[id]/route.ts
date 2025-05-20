import { NextResponse } from "next/server"
import { getProductoModel } from "@/lib/models/producto"
import { uploadImage, uploadVideo } from "@/lib/storage"

// GET - Obtener un producto por ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const ProductoModel = await getProductoModel()
    const producto = await ProductoModel.findById(id)

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json(producto)
  } catch (error) {
    console.error("Error al obtener producto:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

// PUT - Actualizar un producto
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Procesar el FormData
    const formData = await request.formData()

    // Extraer datos del producto
    const nombre = formData.get("nombre") as string
    const sku = formData.get("sku") as string
    const precio = Number.parseFloat(formData.get("precio") as string)
    const stock = Number.parseInt(formData.get("stock") as string)
    const categoria = formData.get("categoria") as string
    const descripcion = (formData.get("descripcion") as string) || ""

    // Extraer archivos
    const imagen = formData.get("imagen") as File | null
    const video = formData.get("video") as File | null

    // Validar datos de entrada
    if (!nombre || !sku || isNaN(precio) || isNaN(stock) || !categoria) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    const ProductoModel = await getProductoModel()

    // Verificar si el producto existe
    const productoExistente = await ProductoModel.findById(id)

    if (!productoExistente) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Verificar si el SKU ya está en uso por otro producto
    const skuExistente = await ProductoModel.findOne({ sku, _id: { $ne: id } })

    if (skuExistente) {
      return NextResponse.json({ error: "Ya existe otro producto con ese SKU" }, { status: 409 })
    }

    // Preparar datos actualizados
    const datosActualizados: any = {
      nombre,
      sku,
      precio,
      stock,
      categoria,
      descripcion,
    }

    // Subir imagen si existe
    if (imagen && imagen.size > 0) {
      datosActualizados.imagenUrl = await uploadImage(imagen)
    }

    // Subir video si existe
    if (video && video.size > 0) {
      datosActualizados.videoUrl = await uploadVideo(video)
    }

    // Actualizar el producto
    const productoActualizado = await ProductoModel.findByIdAndUpdate(id, datosActualizados, { new: true })

    return NextResponse.json(productoActualizado)
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

// DELETE - Eliminar un producto
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const ProductoModel = await getProductoModel()

    // Verificar si el producto existe
    const producto = await ProductoModel.findById(id)

    if (!producto) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Eliminar el producto
    await ProductoModel.findByIdAndDelete(id)

    return NextResponse.json({ message: "Producto eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}
