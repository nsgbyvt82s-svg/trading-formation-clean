'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Save, RefreshCw, AlertCircle } from 'lucide-react';

type SiteSettings = {
  siteName: string;
  siteUrl: string;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  defaultUserRole: 'USER' | 'ADMIN' | 'MODERATOR';
};

type EmailSettings = {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
};

type ApiSettings = {
  apiKey: string;
  rateLimit: number;
  enableCors: boolean;
  allowedOrigins: string;
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // État pour chaque onglet
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'DiamondTrade',
    siteUrl: 'https://diamondtrade.com',
    maintenanceMode: false,
    allowRegistrations: true,
    defaultUserRole: 'USER',
  });

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@diamondtrade.com',
    fromName: 'DiamondTrade',
  });

  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    apiKey: '••••••••••••••••••••••••••••••••',
    rateLimit: 1000,
    enableCors: true,
    allowedOrigins: '*',
  });

  // Charger les paramètres
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Ici, vous feriez un appel API pour charger les paramètres
        // const response = await fetch('/api/admin/settings');
        // const data = await response.json();
        
        // Simulation de chargement
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les paramètres. Veuillez réessayer.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  // Sauvegarder les paramètres
  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Ici, vous feriez un appel API pour sauvegarder les paramètres
      // const response = await fetch('/api/admin/settings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     site: siteSettings,
      //     email: emailSettings,
      //     api: apiSettings,
      //   }),
      // });
      
      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Paramètres enregistrés',
        description: 'Vos modifications ont été enregistrées avec succès.',
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la sauvegarde des paramètres.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Gérer les changements des champs
  const handleSiteSettingChange = (field: keyof SiteSettings, value: any) => {
    setSiteSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEmailSettingChange = (field: keyof EmailSettings, value: string) => {
    setEmailSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApiSettingChange = (field: keyof ApiSettings, value: any) => {
    setApiSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Rendu du formulaire de paramètres généraux
  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="siteName">Nom du site</Label>
          <Input
            id="siteName"
            value={siteSettings.siteName}
            onChange={(e) => handleSiteSettingChange('siteName', e.target.value)}
            placeholder="Nom du site"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="siteUrl">URL du site</Label>
          <Input
            id="siteUrl"
            value={siteSettings.siteUrl}
            onChange={(e) => handleSiteSettingChange('siteUrl', e.target.value)}
            placeholder="https://votresite.com"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="maintenanceMode">Mode maintenance</Label>
            <p className="text-sm text-muted-foreground">
              Activez cette option pour mettre le site en mode maintenance.
            </p>
          </div>
          <Switch
            id="maintenanceMode"
            checked={siteSettings.maintenanceMode}
            onCheckedChange={(checked) => handleSiteSettingChange('maintenanceMode', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="allowRegistrations">Autoriser les inscriptions</Label>
            <p className="text-sm text-muted-foreground">
              Autoriser les nouveaux utilisateurs à s'inscrire.
            </p>
          </div>
          <Switch
            id="allowRegistrations"
            checked={siteSettings.allowRegistrations}
            onCheckedChange={(checked) => handleSiteSettingChange('allowRegistrations', checked)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="defaultUserRole">Rôle utilisateur par défaut</Label>
        <select
          id="defaultUserRole"
          value={siteSettings.defaultUserRole}
          onChange={(e) => handleSiteSettingChange('defaultUserRole', e.target.value as any)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="USER">Utilisateur</option>
          <option value="MODERATOR">Modérateur</option>
          <option value="ADMIN">Administrateur</option>
        </select>
      </div>
    </div>
  );

  // Rendu du formulaire des paramètres d'email
  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="smtpHost">Serveur SMTP</Label>
          <Input
            id="smtpHost"
            value={emailSettings.smtpHost}
            onChange={(e) => handleEmailSettingChange('smtpHost', e.target.value)}
            placeholder="smtp.example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="smtpPort">Port SMTP</Label>
          <Input
            id="smtpPort"
            type="number"
            value={emailSettings.smtpPort}
            onChange={(e) => handleEmailSettingChange('smtpPort', e.target.value)}
            placeholder="587"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="smtpUser">Nom d'utilisateur SMTP</Label>
          <Input
            id="smtpUser"
            value={emailSettings.smtpUser}
            onChange={(e) => handleEmailSettingChange('smtpUser', e.target.value)}
            placeholder="votre@email.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="smtpPassword">Mot de passe SMTP</Label>
          <Input
            id="smtpPassword"
            type="password"
            value={emailSettings.smtpPassword}
            onChange={(e) => handleEmailSettingChange('smtpPassword', e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fromEmail">Email de l'expéditeur</Label>
          <Input
            id="fromEmail"
            type="email"
            value={emailSettings.fromEmail}
            onChange={(e) => handleEmailSettingChange('fromEmail', e.target.value)}
            placeholder="noreply@votredomaine.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fromName">Nom de l'expéditeur</Label>
          <Input
            id="fromName"
            value={emailSettings.fromName}
            onChange={(e) => handleEmailSettingChange('fromName', e.target.value)}
            placeholder="Votre entreprise"
          />
        </div>
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Testez vos paramètres SMTP</p>
            <p className="mt-1">
              Utilisez le bouton ci-dessous pour envoyer un email de test et vérifier que votre configuration est correcte.
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              Envoyer un email de test
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Rendu du formulaire des paramètres API
  const renderApiSettings = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="apiKey">Clé API</Label>
        <div className="flex space-x-2">
          <Input
            id="apiKey"
            value={apiSettings.apiKey}
            readOnly
            className="font-mono"
          />
          <Button variant="outline" size="sm">
            Régénérer
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Cette clé est utilisée pour authentifier les requêtes API. Gardez-la secrète.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rateLimit">Limite de débit (requêtes/heure)</Label>
          <Input
            id="rateLimit"
            type="number"
            value={apiSettings.rateLimit}
            onChange={(e) => handleApiSettingChange('rateLimit', parseInt(e.target.value) || 0)}
          />
          <p className="text-sm text-muted-foreground">
            Nombre maximum de requêtes autorisées par heure et par adresse IP.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <Label htmlFor="enableCors">Activer CORS</Label>
            <p className="text-sm text-muted-foreground">
              Autoriser les requêtes cross-origin (nécessaire pour les applications frontend séparées).
            </p>
          </div>
          <Switch
            id="enableCors"
            checked={apiSettings.enableCors}
            onCheckedChange={(checked) => handleApiSettingChange('enableCors', checked)}
          />
        </div>

        {apiSettings.enableCors && (
          <div className="space-y-2">
            <Label htmlFor="allowedOrigins">Origines autorisées</Label>
            <Input
              id="allowedOrigins"
              value={apiSettings.allowedOrigins}
              onChange={(e) => handleApiSettingChange('allowedOrigins', e.target.value)}
              placeholder="https://votresite.com, https://api.votresite.com"
            />
            <p className="text-sm text-muted-foreground">
              Séparer les URLs par des virgules. Utilisez * pour autoriser toutes les origines (déconseillé en production).
            </p>
          </div>
        )}
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Documentation de l'API</p>
            <p className="mt-1">
              Consultez la documentation complète de l'API pour plus d'informations sur l'utilisation des points de terminaison.
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              Voir la documentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Paramètres</h2>
          <p className="text-muted-foreground">
            Gérez les paramètres de votre application et configurez les préférences.
          </p>
        </div>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer les modifications
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres généraux</CardTitle>
                <CardDescription>
                  Configurez les paramètres généraux de votre application.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderGeneralSettings()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres d'email</CardTitle>
                <CardDescription>
                  Configurez les paramètres SMTP pour l'envoi d'emails.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderEmailSettings()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres API</CardTitle>
                <CardDescription>
                  Gérez les paramètres de l'API et les clés d'accès.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderApiSettings()}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
