'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FiUsers, 
  FiDollarSign, 
  FiBarChart2, 
  FiClock, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiActivity, 
  FiUserPlus, 
  FiSettings,
  FiArrowUpRight,
  FiTrendingUp,
  FiPieChart,
  FiCalendar,
  FiCreditCard,
  FiUserCheck,
  FiRefreshCw
} from 'react-icons/fi';

// Données simulées pour les graphiques
const userActivityData = [
  { name: 'Lun', users: 400 },
  { name: 'Mar', users: 300 },
  { name: 'Mer', users: 600 },
  { name: 'Jeu', users: 200 },
  { name: 'Ven', users: 500 },
  { name: 'Sam', users: 800 },
  { name: 'Dim', users: 600 },
];

const roleDistribution = [
  { name: 'Utilisateurs', value: 65, color: '#3b82f6' },
  { name: 'Modérateurs', value: 15, color: '#10b981' },
  { name: 'Administrateurs', value: 10, color: '#f59e0b' },
  { name: 'Propriétaires', value: 5, color: '#ef4444' },
  { name: 'Autres', value: 5, color: '#8b5cf6' },
];

const recentActivity = [
  { id: 1, user: 'Utilisateur 1', action: 'A effectué un achat', time: '2 minutes', status: 'completed' as const },
  { id: 2, user: 'Utilisateur 2', action: 'A rejoint la plateforme', time: '10 minutes', status: 'completed' as const },
  { id: 3, user: 'Utilisateur 3', action: 'A mis à jour son profil', time: '25 minutes', status: 'completed' as const },
  { id: 4, user: 'Utilisateur 4', action: 'Paiement en attente', time: '1 heure', status: 'pending' as const },
  { id: 5, user: 'Utilisateur 5', action: 'Échec de paiement', time: '2 heures', status: 'failed' as const },
];

// Composant pour afficher une carte de statistique
interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  change?: number;
  color?: 'blue' | 'green' | 'purple' | 'amber';
  className?: string;
}

const StatCard = ({ title, value, icon: Icon, change, color = 'blue', className = '' }: StatCardProps) => {
  const colorClasses = {
    blue: 'bg-primary/10 text-primary',
    green: 'bg-green-500/10 text-green-500',
    purple: 'bg-purple-500/10 text-purple-500',
    amber: 'bg-amber-500/10 text-amber-500'
  };

  return (
    <Card className={`p-6 ${className} hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <p className={`text-sm flex items-center mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <FiTrendingUp className={`mr-1 ${change < 0 ? 'transform rotate-180' : ''}`} />
              {Math.abs(change)}% {change >= 0 ? 'de plus' : 'de moins'} que le mois dernier
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
};

// Composant pour afficher une activité récente
const ActivityItem = ({ activity }: { activity: { id: number; user: string; action: string; time: string; status: 'completed' | 'pending' | 'failed' } }) => {
  const statusIcons = {
    completed: <FiCheckCircle className="h-5 w-5 text-green-500" />,
    pending: <FiClock className="h-5 w-5 text-yellow-500" />,
    failed: <FiAlertTriangle className="h-5 w-5 text-red-500" />
  };
  
  const statusColors = {
    completed: 'bg-green-50 text-green-700',
    pending: 'bg-yellow-50 text-yellow-700',
    failed: 'bg-red-50 text-red-700'
  };
  
  return (
    <div className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0 group hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors">
      <div className={`p-2 rounded-full mr-3 ${statusColors[activity.status]}`}>
        {statusIcons[activity.status]}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">
          <span className="text-gray-900">{activity.user}</span>{' '}
          <span className="text-gray-600 font-normal">{activity.action}</span>
        </p>
        <p className="text-xs text-gray-400">Il y a {activity.time}</p>
      </div>
      <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity">
        <FiArrowUpRight className="h-4 w-4" />
      </button>
    </div>
  );
};

// Composant pour afficher un graphique en courbes
const LineChartComponent = ({ data }: { data: Array<{name: string; users: number}> }) => {
  return (
    <div className="h-64">
      <div className="h-full w-full">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">Utilisateurs actifs</span>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
            <span className="text-xs text-gray-500">7 derniers jours</span>
          </div>
        </div>
        <div className="h-48">
          <svg viewBox="0 0 560 150" className="w-full h-full">
            <line 
              x1="0" y1="130" 
              x2="560" y2="130" 
              stroke="#e5e7eb" 
              strokeWidth="1"
            />
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              points="40,90 80,120 120,100 160,130 200,80 240,50 280,100 320,70 360,90 400,60 440,110 480,90 520,120"
            />
            {data.map((item, index) => (
              <g key={`point-${index}`}>
                <circle
                  cx={index * 80 + 40}
                  cy={130 - (item.users / 10)}
                  r="4"
                  fill="#3b82f6"
                  className="cursor-pointer hover:r-6 transition-all"
                />
                <text
                  x={index * 80 + 40}
                  y="145"
                  textAnchor="middle"
                  className="text-xs fill-gray-500"
                >
                  {item.name}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
};

// Composant pour afficher un graphique circulaire
const PieChartWithCustomizedLabel = ({ data }: { data: Array<{name: string; value: number; color: string}> }) => {
  return (
    <div className="h-64">
      <div className="h-full w-full">
        <div className="flex flex-wrap justify-center gap-4">
          {data.map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-gray-600">
                {entry.name} ({entry.value}%)
              </span>
            </div>
          ))}
        </div>
        <div className="h-48 mt-4">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {data.map((entry, index) => {
              const startAngle = index === 0 ? 0 : 
                data.slice(0, index).reduce((sum, item) => sum + (item.value * 3.6), 0);
              const length = entry.value * 3.6;
              
              return (
                <circle
                  key={`circle-${index}`}
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke={entry.color}
                  strokeWidth="40"
                  strokeDasharray={`${length} ${360 - length}`}
                  strokeDashoffset={-startAngle}
                  transform="rotate(-90 100 100)"
                />
              );
            })}
            <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" className="text-lg font-bold">
              {data.reduce((sum, item) => sum + item.value, 0)}%
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};

// Rôles autorisés pour l'administration
const adminRoles = ['ADMIN', 'OWNER', 'SUPERADMIN'];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Vérifier si l'utilisateur est admin
  const isAdmin = session?.user?.role && adminRoles.includes(session.user.role);
  
  // Rediriger si l'utilisateur n'est pas admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?callbackUrl=/admin/dashboard');
    } else if (status === 'authenticated' && !isAdmin) {
      router.replace('/');
    }
  }, [status, isAdmin, router]);
  
  // Données simulées
  const [stats] = useState({
    totalUsers: 1242,
    activeUsers: 856,
    monthlyRevenue: 12450,
    pendingPayments: 5,
    totalRevenue: 124500,
    userGrowth: 12.5,
    revenueGrowth: 8.3,
    newUsers: 42,
    recentActivity: recentActivity
  });

  if (status === 'loading' || (status === 'authenticated' && !isAdmin)) {
    // Afficher un indicateur de chargement pendant la vérification
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-card rounded-lg shadow-sm p-6 border">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Tableau de bord administrateur
            </h1>
            <p className="text-muted-foreground mt-1">Bienvenue dans votre espace d'administration</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-accent text-foreground transition-colors duration-200 text-sm font-medium shadow-sm"
            >
              <FiRefreshCw className="h-4 w-4" />
              <span>Actualiser</span>
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow hover:shadow-md transition-all duration-200 text-sm font-medium"
            >
              <FiUserPlus className="h-4 w-4" />
              <span>Nouvel utilisateur</span>
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border hover:bg-accent text-foreground transition-colors duration-200 text-sm font-medium shadow-sm"
            >
              <FiSettings className="h-4 w-4" />
              <span>Paramètres</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Utilisateurs totaux" 
          value={stats.totalUsers.toLocaleString()} 
          icon={FiUsers}
          change={stats.userGrowth}
          color="blue"
        />
        <StatCard 
          title="Utilisateurs actifs" 
          value={stats.activeUsers.toLocaleString()} 
          icon={FiUserCheck}
          change={5.2}
          color="green"
        />
        <StatCard 
          title="Revenu mensuel" 
          value={`${stats.monthlyRevenue.toLocaleString()} €`} 
          icon={FiDollarSign}
          change={stats.revenueGrowth}
          color="purple"
        />
        <StatCard 
          title="Nouveaux utilisateurs" 
          value={`+${stats.newUsers}`} 
          icon={FiUserPlus}
          change={8.7}
          color="amber"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card rounded-lg shadow-sm p-6 border">
          <h3 className="font-semibold text-foreground mb-4">Activité des utilisateurs (7 jours)</h3>
          <LineChartComponent data={userActivityData} />
        </div>
        <div className="bg-card rounded-lg shadow-sm p-6 border">
          <h3 className="font-semibold text-foreground mb-4">Répartition des rôles</h3>
          <PieChartWithCustomizedLabel data={roleDistribution} />
        </div>
      </div>

      {/* Activités récentes */}
      <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Activité récente</h3>
            <button className="text-primary hover:text-primary/80 text-sm font-medium hover:bg-accent px-3 py-1.5 rounded-md transition-colors">
              Voir tout
            </button>
          </div>
        </div>
        <div className="divide-y">
          {recentActivity.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
}
