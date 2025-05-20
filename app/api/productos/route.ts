import { NextResponse } from "next/server"
import { getProductoModel } from "@/lib/models/producto"
import { uploadImage, uploadVideo } from "@/lib/storage"

// GET - Obtener todos los productos
export async function GET() {
  try {
    const ProductoModel = await getProductoModel()
    const productos = await ProductoModel.find({}).sort({ createdAt: -1 })

    return NextResponse.json(productos)
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}

// POST - Crear un nuevo producto
export async function POST(request: Request) {
  try {
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

    // Verificar si ya existe un producto con el mismo SKU
    const existingProducto = await ProductoModel.findOne({ sku })

    if (existingProducto) {
      return NextResponse.json({ error: "Ya existe un producto con ese SKU" }, { status: 409 })
    }

    // Subir imagen si existe
    let imagenUrl = ""
    if (imagen && imagen.size > 0) {
      imagenUrl = await uploadImage(imagen)
    }

    // Subir video si existe
    let videoUrl = ""
    if (video && video.size > 0) {
      videoUrl = await uploadVideo(video)
    }

    // Crear el nuevo producto
    const nuevoProducto = new ProductoModel({
      nombre,
      sku,
      precio,
      stock,
      categoria,
      descripcion,
      imagenUrl,
      videoUrl,
    })

    await nuevoProducto.save()

    return NextResponse.json(nuevoProducto, { status: 201 })
  } catch (error) {
    console.error("Error al crear producto:", error)
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
  }
}
