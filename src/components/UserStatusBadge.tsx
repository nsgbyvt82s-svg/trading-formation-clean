import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type UserStatusBadgeProps = {
  role: 'USER' | 'ADMIN' | 'OWNER' | 'SUPERADMIN'
  isOnline?: boolean
  className?: string
  showForAllUsers?: boolean
}

export function UserStatusBadge({ 
  role, 
  isOnline = false, 
  className, 
  showForAllUsers = false 
}: UserStatusBadgeProps) {
  const isAdmin = ['ADMIN', 'OWNER', 'SUPERADMIN'].includes(role)
  
  // Afficher le badge pour les admins ou si l'utilisateur est en ligne
  // ou si on force l'affichage avec showForAllUsers
  const shouldShow = isAdmin || isOnline || showForAllUsers
  
  if (!shouldShow) return null
  
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Badge de rôle (uniquement pour les admins) */}
      {isAdmin && (
        <Badge 
          variant={role === 'OWNER' ? 'default' : role === 'SUPERADMIN' ? 'destructive' : 'secondary'} 
          className="whitespace-nowrap flex-shrink-0"
        >
          {role === 'OWNER' ? 'Propriétaire' : role === 'SUPERADMIN' ? 'Super Admin' : 'Admin'}
        </Badge>
      )}
      
      {/* Badge de statut en ligne/hors ligne */}
      <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
        isOnline 
          ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' 
          : 'text-gray-500 bg-gray-50 dark:bg-gray-800 dark:text-gray-400'
      }`}>
        <span className={`h-2 w-2 rounded-full flex-shrink-0 ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`}></span>
        {isOnline ? 'En ligne' : 'Hors ligne'}
      </div>
    </div>
  )
}
