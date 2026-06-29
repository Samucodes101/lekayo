"use client"

import { Address } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import AddressForm from "@/components/forms/AddressForm"

interface AddressListProps {
  addresses: Address[]
}

export default function AddressList({ addresses }: AddressListProps) {
  const [showForm, setShowForm] = useState(false)

  const handleDelete = async (id: string) => {
    await fetch("/api/addresses", { method: "DELETE", body: JSON.stringify({ id }), headers: { "Content-Type": "application/json" } })
    window.location.reload()
  }

  return (
    <div>
      <Button onClick={() => setShowForm(true)} className="mb-4">Add New Address</Button>
      {showForm && <AddressForm onClose={() => setShowForm(false)} />}
      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((addr) => (
          <Card key={addr.id}>
            <CardHeader><CardTitle>{addr.firstName} {addr.lastName}</CardTitle></CardHeader>
            <CardContent>
              <p>{addr.addressLine1}</p>
              {addr.addressLine2 && <p>{addr.addressLine2}</p>}
              <p>{addr.city}, {addr.state} {addr.postalCode}</p>
              <p>{addr.country}</p>
              <p>Phone: {addr.phone}</p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="destructive" size="sm" onClick={() => handleDelete(addr.id)}>Delete</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}