import { Suspense } from "react"
import NuevaVentaClient from "@/components/ventas/nueva-venta-client"
import { getProductos, getClientes } from "@/lib/data-utils"
import { Skeleton } from "@/components/ui/skeleton"

export default async function NuevaVentaPage() {
  const [productos, clientes] = await Promise.all([getProductos(), getClientes()])

  return (
    <div className="space-y-6">
      <Suspense fallback={<Skeleton className="w-full h-[500px]" />}>
        <NuevaVentaClient productos={productos} clientes={clientes} />
      </Suspense>
    </div>
  )
}
