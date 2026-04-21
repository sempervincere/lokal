import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LOKAL — Simulate Before You Operate',
  description: "Indonesia's F&B Hyperlocal Market Intelligence Platform on Solana. Validate your F&B concept with verified, street-level local data.",
  keywords: ['F&B', 'market intelligence', 'Indonesia', 'Solana', 'hyperlocal'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`${jakarta.variable} ${mono.variable}`}>
      <body className={`${jakarta.className} antialiased bg-cream-50 text-warmgray-900`}>
        {children}
      </body>
    </html>
  )
}
