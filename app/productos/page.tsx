import { getProductos } from "@/lib/data-utils"
import ProductosClient from "@/components/productos/productos-client"

export const dynamic = "force-dynamic"

export default async function ProductosPage() {
  // Obtener productos de la base de datos
  const productos = await getProductos()

  return <ProductosClient initialProductos={productos} />
}
