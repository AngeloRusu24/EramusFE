import type { Metadata } from 'next'
import 'bootstrap-italia/dist/css/bootstrap-italia.min.css'

export const metadata: Metadata = {
  title: 'ERAMUS - Sistema Gestionale',
  description: 'Gestionale ERAMUS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}