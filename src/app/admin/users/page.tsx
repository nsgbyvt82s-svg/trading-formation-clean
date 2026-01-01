'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, RefreshCw, UserPlus, Pencil, Save, X, Shield, Clock, Trash2 } from 'lucide-react'

// Composant pour afficher le badge de statut utilisateur
function UserStatusBadge({ status }: { status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' }) {
  const statusMap = {
    ACTIVE: { label: 'Actif', variant: 'default' },
    INACTIVE: { label: 'Inactif', variant: 'outline' },
    SUSPENDED: { label: 'Suspendu', variant: 'destructive' }
  }

  return (
    <Badge variant={statusMap[status].variant as any}>
      {statusMap[status].label}
    </Badge>
  )
}

// Composant pour afficher le badge de rôle utilisateur
function UserRoleBadge({ role }: { role: 'USER' | 'ADMIN' | 'OWNER' }) {
  const roleMap = {
    USER: { label: 'Utilisateur', variant: 'outline' },
    ADMIN: { label: 'Administrateur', variant: 'default' },
    OWNER: { label: 'Propriétaire', variant: 'secondary' }
  }

  return (
    <Badge variant={roleMap[role].variant as any}>
      {roleMap[role].label}
    </Badge>
  )
}

type User = {
  id: string
  email: string
  name: string
  username: string
  role: 'USER' | 'ADMIN' | 'OWNER'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  createdAt: string
  updatedAt: string
}

// Composant pour afficher les logs d'authentification
function AuthLogs() {
  const [logs, setLogs] = useState<Array<{
    type: 'LOGIN' | 'SIGNUP' | 'LOGOUT';
    userId: string;
    email: string;
    provider?: string;
    ip?: string;
    userAgent?: string;
    timestamp: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  const fetchLogs = async () => {
    if (status !== 'authenticated') {
      setError('Veuillez vous connecter');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/auth-logs', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Important pour envoyer les cookies de session
      });

      if (response.status === 403) {
        setError('Accès refusé. Vous devez être administrateur.');
        return;
      }

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des logs');
      }

      const data = await response.json();
      setLogs(data);
      setError(null);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les logs. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Rafraîchir les logs toutes les 30 secondes
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const getEventType = (type: string) => {
    switch (type) {
      case 'LOGIN':
        return { label: 'Connexion', color: 'bg-blue-100 text-blue-800' };
      case 'SIGNUP':
        return { label: 'Inscription', color: 'bg-green-100 text-green-800' };
      case 'LOGOUT':
        return { label: 'Déconnexion', color: 'bg-gray-100 text-gray-800' };
      default:
        return { label: type, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Chargement des logs...</span>
      </div>
    );
  }

  if (status !== 'authenticated' || error) {
    return (
      <div className="p-4 text-red-500 text-center">
        {error || 'Veuillez vous connecter pour voir les logs'}
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date/Heure</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Fournisseur</TableHead>
            <TableHead>IP</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Aucun log d'authentification trouvé
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log, index) => {
              const eventType = getEventType(log.type);
              return (
                <TableRow key={index}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(log.timestamp)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={eventType.color}>
                      {eventType.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{log.email}</div>
                    <div className="text-sm text-muted-foreground">ID: {log.userId}</div>
                  </TableCell>
                  <TableCell>{log.provider || 'Email'}</TableCell>
                  <TableCell>{log.ip || 'N/A'}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [onlineAdmins, setOnlineAdmins] = useState<Set<string>>(new Set())
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [onlineFilter, setOnlineFilter] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<User>>({})

  // Debug de la session
  useEffect(() => {
    console.log('Session:', { 
      user: session?.user,
      status,
      isAdmin: session?.user?.role === 'ADMIN' || session?.user?.role === 'OWNER'
    });
  }, [session, status]);

  // Fonction pour récupérer les administrateurs en ligne
  const fetchOnlineAdmins = async () => {
    try {
      const response = await fetch('/api/admin/online');
      if (response.ok) {
        const admins = await response.json();
        console.log('Administrateurs en ligne:', admins);
        
        // Mettre à jour l'état des administrateurs en ligne
        setOnlineAdmins(new Set(admins.map((admin: any) => admin.id)));
        
        // Mettre à jour le statut en ligne des utilisateurs
        setUsers(prevUsers => 
          prevUsers.map(user => ({
            ...user,
            isOnline: admins.some((admin: any) => admin.id === user.id)
          }))
        );
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des administrateurs en ligne:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchUsers();
      await fetchOnlineAdmins(); // Charger les administrateurs en ligne au démarrage
    };
    
    loadData();
    
    // Mettre à jour périodiquement la liste des administrateurs en ligne
    const interval = setInterval(fetchOnlineAdmins, 10000); // Rafraîchir toutes les 10 secondes
    
    return () => clearInterval(interval);
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log('Fetching users from API...')
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      
      console.log('API Response:', { 
        status: response.status, 
        statusText: response.statusText,
        data 
      });
      
      if (response.ok) {
        // S'assurer que les rôles sont correctement typés
        const usersWithCorrectTypes = (Array.isArray(data) ? data : []).map((user: any) => ({
          ...user,
          role: (user.role || 'USER').toUpperCase(),
          status: (user.status || 'ACTIVE').toUpperCase(),
          createdAt: user.createdAt || new Date().toISOString(),
          updatedAt: user.updatedAt || new Date().toISOString()
        }));
        
        console.log('Users with types:', usersWithCorrectTypes);
        setUsers(usersWithCorrectTypes);
      } else {
        console.error('Failed to fetch users:', data.error);
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingId(user.id)
    setEditData({
      role: user.role,
      status: user.status
    })
  }

  const handleSave = async (userId: string) => {
    try {
      console.log('Saving user changes:', { userId, editData });
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      const responseData = await response.json().catch(() => ({}));
      
      console.log('Update response:', {
        status: response.status,
        statusText: response.statusText,
        responseData
      });

      if (response.ok) {
        await fetchUsers();
        setEditingId(null);
        setEditData({});
        console.log('User updated successfully');
      } else {
        const error = responseData.error || 'Erreur inconnue lors de la mise à jour';
        console.error('Failed to update user:', error);
        alert(`Erreur lors de la mise à jour: ${error}`);
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({})
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Mettre à jour la liste des utilisateurs après suppression
        await fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la suppression de l\'utilisateur');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Une erreur est survenue lors de la suppression');
    }
  }

  useEffect(() => {
    let result = [...users]
    
    // Apply search term filter
    if (searchTerm) {
      result = result.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(user => user.status === statusFilter)
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter)
    }
    
    // Apply online filter
    if (onlineFilter !== null) {
      result = result.filter(user => onlineAdmins.has(user.id) === onlineFilter)
    }
    
    setFilteredUsers(result)
  }, [users, searchTerm, statusFilter, roleFilter, onlineFilter, onlineAdmins])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default'
      case 'INACTIVE': return 'outline'
      case 'SUSPENDED': return 'destructive'
      default: return 'outline'
    }
  }

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'OWNER': return 'secondary'
      case 'ADMIN': return 'default'
      case 'USER': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">
            Gérez les utilisateurs et consultez les logs d'authentification
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={fetchUsers}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Logs d'authentification
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  className="pl-10 w-[250px]"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="ACTIVE">Actif</SelectItem>
                  <SelectItem value="INACTIVE">Inactif</SelectItem>
                  <SelectItem value="SUSPENDED">Suspendu</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="USER">Utilisateur</SelectItem>
                  <SelectItem value="ADMIN">Administrateur</SelectItem>
                  <SelectItem value="OWNER">Propriétaire</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={onlineFilter === null ? 'all' : onlineFilter ? 'online' : 'offline'}
                onValueChange={(value) => {
                  if (value === 'all') setOnlineFilter(null)
                  else setOnlineFilter(value === 'online')
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Statut de connexion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="online">En ligne</SelectItem>
                  <SelectItem value="offline">Hors ligne</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Nouvel utilisateur
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs</CardTitle>
              <CardDescription>
                Liste des utilisateurs enregistrés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Inscrit le</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex justify-center">
                            <RefreshCw className="h-6 w-6 animate-spin" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Aucun utilisateur trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {user.name || 'Sans nom'}
                                {session?.user?.email === user.email && (
                                  <span className="ml-2 text-xs text-muted-foreground">(Vous)</span>
                                )}
                              </span>
                              {onlineAdmins.has(user.id) && (
                                <Badge variant="default" className="text-xs">
                                  En ligne
                                </Badge>
                              )}
                            </div>
                                <div className="text-sm text-muted-foreground">@{user.username || 'sans-username'}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {editingId === user.id ? (
                              <Select
                                value={editData.role || ''}
                                onValueChange={(value) => setEditData({...editData, role: value as any})}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue placeholder="Sélectionner un rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="USER">Utilisateur</SelectItem>
                                  <SelectItem value="ADMIN">Administrateur</SelectItem>
                                  <SelectItem value="OWNER">Propriétaire</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant={getRoleVariant(user.role)}>
                                {user.role === 'OWNER' ? 'Propriétaire' : 
                                 user.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {editingId === user.id ? (
                              <Select
                                value={editData.status || ''}
                                onValueChange={(value) => setEditData({...editData, status: value as any})}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue placeholder="Sélectionner un statut" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ACTIVE">Actif</SelectItem>
                                  <SelectItem value="INACTIVE">Inactif</SelectItem>
                                  <SelectItem value="SUSPENDED">Suspendu</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant={getStatusVariant(user.status)}>
                                {user.status === 'ACTIVE' ? 'Actif' : 
                                 user.status === 'INACTIVE' ? 'Inactif' : 'Suspendu'}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            {editingId === user.id ? (
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSave(user.id)}
                                  disabled={!editData.role || !editData.status}
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Enregistrer
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleCancel}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-end space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(user)}
                                  disabled={user.role === 'OWNER' && session?.user?.id !== user.id}
                                  title={user.role === 'OWNER' && session?.user?.id !== user.id ? "Impossible de modifier un propriétaire" : "Modifier"}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(user.id)}
                                  disabled={user.role === 'OWNER' || (user.role === 'ADMIN' && session?.user?.role !== 'OWNER')}
                                  title={
                                    user.role === 'OWNER' 
                                      ? "Impossible de supprimer un propriétaire" 
                                      : user.role === 'ADMIN' && session?.user?.role !== 'OWNER'
                                        ? "Seul un propriétaire peut supprimer un administrateur"
                                        : "Supprimer"
                                  }
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs d'authentification</CardTitle>
              <CardDescription>
                Historique des connexions et inscriptions des utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthLogs />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
