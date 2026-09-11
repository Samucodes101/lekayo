"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPrice } from "@/lib/utils"

type Customer = { id: string; name: string | null; email: string | null; orderCount: number; totalSpent: number; createdAt: string | Date }
type Order = { id: string; orderNumber: string; email: string | null; phone: string | null; createdAt: string | Date; total: number; status: string }
type AuditLog = { id: string; createdAt: string | Date; user: { email: string | null } | null; userEmail: string | null; action: string; resourceType: string; ipAddress: string | null }

function queryMatch(values: unknown[], query: string) {
  const normalized = query.trim().toLowerCase()
  return !normalized || values.some((value) => String(value ?? "").toLowerCase().includes(normalized))
}

export function SearchableCustomers({ customers }: { customers: Customer[] }) {
  const [query, setQuery] = useState("")
  const rows = customers.filter((customer) => queryMatch([customer.name, customer.email], query))
  return <>
    <Input placeholder="Search customers..." value={query} onChange={(event) => setQuery(event.target.value)} className="w-full md:w-64" />
    <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Orders</TableHead><TableHead>Total Spent</TableHead><TableHead>Joined</TableHead><TableHead /></TableRow></TableHeader><TableBody>{rows.map((customer) => <TableRow key={customer.id}><TableCell>{customer.name || "N/A"}</TableCell><TableCell>{customer.email || "No email"}</TableCell><TableCell>{customer.orderCount}</TableCell><TableCell>{formatPrice(customer.totalSpent)}</TableCell><TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell><TableCell><Link href={`/admin/customers/${customer.id}`} className="text-blue-600 underline">View</Link></TableCell></TableRow>)}</TableBody></Table>
  </>
}

export function SearchableOrders({ orders }: { orders: Order[] }) {
  const [query, setQuery] = useState("")
  const rows = orders.filter((order) => queryMatch([order.orderNumber, order.email, order.phone, order.status], query))
  return <>
    <Input placeholder="Search order, customer, or status..." value={query} onChange={(event) => setQuery(event.target.value)} className="w-full md:w-72" />
    <Button variant="outline" type="button" onClick={() => setQuery("")}>Clear</Button>
    <Table><TableHeader><TableRow><TableHead>Order #</TableHead><TableHead>Customer</TableHead><TableHead>Date</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader><TableBody>{rows.map((order) => <TableRow key={order.id}><TableCell className="font-mono">{order.orderNumber}</TableCell><TableCell>{order.email || order.phone || "Walk-in customer"}</TableCell><TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell><TableCell>{formatPrice(order.total)}</TableCell><TableCell className="capitalize">{order.status}</TableCell><TableCell><Link href={`/admin/orders/${order.id}`} className="text-blue-600 underline">View</Link></TableCell></TableRow>)}</TableBody></Table>
  </>
}

export function SearchableAuditLogs({ logs }: { logs: AuditLog[] }) {
  const [query, setQuery] = useState("")
  const rows = logs.filter((log) => queryMatch([log.userEmail, log.user?.email, log.action, log.resourceType, log.ipAddress], query))
  return <>
    <Input placeholder="Search user, action, or resource..." value={query} onChange={(event) => setQuery(event.target.value)} className="w-full md:w-72" />
    <Table><TableHeader><TableRow><TableHead>Timestamp</TableHead><TableHead>User</TableHead><TableHead>Action</TableHead><TableHead>Resource</TableHead><TableHead>IP</TableHead></TableRow></TableHeader><TableBody>{rows.map((log) => <TableRow key={log.id}><TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell><TableCell>{log.userEmail || log.user?.email || "System"}</TableCell><TableCell className="font-medium">{log.action}</TableCell><TableCell>{log.resourceType}</TableCell><TableCell className="text-sm text-gray-500">{log.ipAddress || "-"}</TableCell></TableRow>)}</TableBody></Table>
  </>
}
