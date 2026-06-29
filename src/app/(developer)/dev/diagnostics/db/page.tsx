import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DatabaseDiagnosticsPage() {
  const tables = await prisma.$queryRaw`
    SELECT table_name, table_schema 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
  ` as any[]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Database Diagnostics</h1>
      <Card>
        <CardHeader><CardTitle>Tables</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {tables.map((t: any) => (
              <li key={t.table_name} className="text-sm">{t.table_name}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}