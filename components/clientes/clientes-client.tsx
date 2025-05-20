"use client"

import type React from "react"
import type { Cliente } from "@/lib/types"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Search, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface ClientesClientProps {
  initialClientes: Cliente[]
}

export default function ClientesClient({ initialClientes }: ClientesClientProps) {
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes)
  const [busqueda, setBusqueda] = useState("")
  const [clienteActual, setClienteActual] = useState<Partial<Cliente> | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.rfc.toLowerCase().includes(busqueda.toLowerCase()),
  )

  const handleNuevoCliente = () => {
    setClienteActual({
      nombre: "",
      email: "",
      telefono: "",
      direccion: "",
      rfc: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditarCliente = (cliente: Cliente) => {
    setClienteActual({ ...cliente })
    setIsDialogOpen(true)
  }

  const handleEliminarCliente = (cliente: Cliente) => {
    setClienteActual(cliente)
    setIsDeleteDialogOpen(true)
  }

  const handleGuardarCliente = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clienteActual) return

    setIsLoading(true)

    try {
      let response

      if (!clienteActual.id) {
        // Crear nuevo cliente
        response = await fetch("/api/clientes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(clienteActual),
        })
      } else {
        // Actualizar cliente existente
        response = await fetch(`/api/clientes/${clienteActual.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(clienteActual),
        })
      }

      if (!response.ok) {
        throw new Error("Error al guardar el cliente")
      }

      const clienteGuardado = await response.json()

      if (!clienteActual.id) {
        // Nuevo cliente
        setClientes([...clientes, clienteGuardado])
        toast({
          title: "Cliente creado",
          description: `El cliente ${clienteGuardado.nombre} ha sido creado exitosamente.`,
        })
      } else {
        // Actualizar cliente existente
        setClientes(clientes.map((c) => (c.id === clienteActual.id ? clienteGuardado : c)))
        toast({
          title: "Cliente actualizado",
          description: `El cliente ${clienteGuardado.nombre} ha sido actualizado exitosamente.`,
        })
      }

      setIsDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error al guardar cliente:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al guardar el cliente. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const confirmarEliminarCliente = async () => {
    if (!clienteActual?.id) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/clientes/${clienteActual.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el cliente")
      }

      setClientes(clientes.filter((c) => c.id !== clienteActual.id))
      toast({
        title: "Cliente eliminado",
        description: `El cliente ${clienteActual.nombre} ha sido eliminado exitosamente.`,
        variant: "destructive",
      })
      setIsDeleteDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error al eliminar cliente:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el cliente. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
        <Button onClick={handleNuevoCliente}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar clientes..."
            className="pl-8"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>RFC</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientesFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No se encontraron clientes
                </TableCell>
              </TableRow>
            ) : (
              clientesFiltrados.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.nombre}</TableCell>
                  <TableCell>{cliente.email}</TableCell>
                  <TableCell>{cliente.telefono}</TableCell>
                  <TableCell>{cliente.rfc}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditarCliente(cliente)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500"
                        onClick={() => handleEliminarCliente(cliente)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo para crear/editar cliente */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{clienteActual?.id ? "Editar Cliente" : "Crear Cliente"}</DialogTitle>
            <DialogDescription>Complete los detalles del cliente y guarde los cambios.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGuardarCliente}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={clienteActual?.nombre || ""}
                  onChange={(e) => setClienteActual({ ...clienteActual, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={clienteActual?.email || ""}
                  onChange={(e) => setClienteActual({ ...clienteActual, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={clienteActual?.telefono || ""}
                  onChange={(e) => setClienteActual({ ...clienteActual, telefono: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={clienteActual?.direccion || ""}
                  onChange={(e) => setClienteActual({ ...clienteActual, direccion: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rfc">RFC</Label>
                <Input
                  id="rfc"
                  value={clienteActual?.rfc || ""}
                  onChange={(e) => setClienteActual({ ...clienteActual, rfc: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar el cliente "{clienteActual?.nombre}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarEliminarCliente} disabled={isLoading}>
              {isLoading ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
