import Link from "next/link"

interface QuickActionCardProps {
  title: string
  description: string
  href: string
  icon: string
}

export function QuickActionCard({ title, description, href, icon }: QuickActionCardProps) {
  return (
    <Link href={href}>
      <div className="bg-white border border-muted rounded-lg p-6 shadow-sm hover:shadow-md transition-all hover:border-primary cursor-pointer">
        <div className="text-3xl mb-3">{icon}</div>
        <h3 className="font-semibold text-secondary text-lg mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 text-primary font-semibold text-sm">Get Started →</div>
      </div>
    </Link>
  )
}
