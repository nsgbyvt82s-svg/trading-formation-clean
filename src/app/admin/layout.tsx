import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options"
import { redirect } from "next/navigation"
import AdminSidebar from "@/components/admin/AdminSidebar"

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    console.log('Début du chargement de la session...');
    const session = await getServerSession(authOptions)
    
    console.log('Session dans le layout admin:', {
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        role: (session.user as any)?.role,
        username: (session.user as any)?.username
      } : 'Aucune session'
    });
    
    // Vérifier si l'utilisateur est connecté
    if (!session?.user) {
      console.log('Aucun utilisateur connecté, redirection vers /login');
      const loginUrl = new URL('/login', process.env.NEXTAUTH_URL || 'http://localhost:3000');
      loginUrl.searchParams.set('callbackUrl', '/admin');
      redirect(loginUrl.toString());
    }
    
    // Vérifier si l'utilisateur a un rôle valide
    const userRole = (session.user as any)?.role;
    const allowedRoles = ['ADMIN', 'OWNER', 'SUPERADMIN'];
    const hasValidRole = userRole && allowedRoles.includes(userRole);
    
    console.log('Vérification des rôles:', {
      userRole,
      allowedRoles,
      hasValidRole
    });
    
    // Rediriger si l'utilisateur n'a pas le bon rôle
    if (!hasValidRole) {
      console.log('Accès refusé - Rôle non autorisé:', userRole);
      redirect('/');
    }

    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-foreground flex">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-full mx-auto py-3 px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    Tableau de bord Admin
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Connecté en tant que <span className="font-medium text-gray-900 dark:text-white">{session.user.name || session.user.email}</span>
                  </span>
                  <span className="px-3 py-1 bg-primary/10 text-primary dark:text-primary-300 text-xs font-medium rounded-full border border-border dark:border-gray-600 shadow-sm">
                    {userRole}
                  </span>
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Erreur dans le layout admin:', error);
    // En cas d'erreur, rediriger vers la page d'accueil
    redirect('/');
  }
}
