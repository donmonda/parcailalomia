import { getClientes } from "@/lib/data-utils"
import ClientesClient from "@/components/clientes/clientes-client"

export const dynamic = "force-dynamic"

export default async function ClientesPage() {
  // Obtener clientes de la base de datos
  const clientes = await getClientes()

  return <ClientesClient initialClientes={clientes} />
}
