import { getVentas } from "@/lib/data-utils"
import VentasClient from "@/components/ventas/ventas-client"

export const dynamic = "force-dynamic"

export default async function VentasPage() {
  // Obtener ventas de la base de datos
  const ventas = await getVentas()

  return <VentasClient initialVentas={ventas} />
}
