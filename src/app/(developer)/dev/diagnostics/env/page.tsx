import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EnvironmentDiagnosticsPage() {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? "✓ Set" : "✗ Missing",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✓ Set" : "✗ Missing",
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? "✓ Set" : "✗ Missing",
    PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY ? "✓ Set" : "✗ Missing",
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY ? "✓ Set" : "✗ Missing",
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Environment Diagnostics</h1>
      <Card>
        <CardHeader><CardTitle>Environment Variables</CardTitle></CardHeader>
        <CardContent>
          <dl className="space-y-2">
            {Object.entries(env).map(([key, value]) => (
              <div key={key} className="flex justify-between border-b py-1">
                <dt className="font-mono">{key}</dt>
                <dd className={value.startsWith("✓") ? "text-green-600" : "text-red-600"}>{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}