'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FiArrowLeft, FiSave } from 'react-icons/fi';

export default function EditOfferPage() {
  const params = useParams();
  const offerId = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    discountPrice: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!offerId) return;
    
    const fetchOffer = async () => {
      try {
        console.log('Tentative de chargement de l\'offre avec ID:', offerId);
        const response = await fetch(`/api/admin/offers/${offerId}`);
        
        console.log('Réponse du serveur:', response.status, response.statusText);
        const responseData = await response.json().catch(() => ({}));
        console.log('Données de la réponse:', responseData);
        
        if (response.ok) {
          console.log('Données de l\'offre chargées avec succès:', responseData);
          setFormData({
            title: responseData.title,
            description: responseData.description,
            price: responseData.price.toString(),
            discountPrice: responseData.discountPrice ? responseData.discountPrice.toString() : '',
            startDate: responseData.startDate.split('T')[0],
            endDate: responseData.endDate.split('T')[0],
            isActive: responseData.isActive,
          });
        } else {
          console.error('Erreur lors du chargement de l\'offre:', responseData.error || 'Erreur inconnue');
          setError(`Impossible de charger l'offre: ${responseData.error || 'Erreur inconnue'}`);
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [offerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'discountPrice' 
        ? value.replace(/[^0-9.]/g, '') 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Préparer les données pour l'API
      const updateData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        isActive: formData.isActive
      };

      console.log('Envoi des données:', updateData); // Debug log

if (!offerId) {
        throw new Error('ID de l\'offre manquant');
      }

      const response = await fetch(`/api/admin/offers/${offerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const responseData = await response.json();
      console.log('Réponse du serveur:', { status: response.status, data: responseData }); // Debug log

      if (response.ok) {
        router.push('/admin/offers');
        router.refresh(); // Rafraîchir les données de la page
      } else {
        throw new Error(responseData.error || 'Une erreur est survenue lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'offre:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la mise à jour de l\'offre');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Chargement de l'offre {offerId}...</p>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Modifier l'offre
          </h1>
          <p className="text-muted-foreground">
            Modifiez les détails de l'offre
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails de l'offre</CardTitle>
          <CardDescription>
            Modifiez les informations de l'offre
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de l'offre *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ex: Formation Premium"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Prix (€) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="text"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="99.99"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPrice">Prix réduit (€)</Label>
                <Input
                  id="discountPrice"
                  name="discountPrice"
                  type="text"
                  value={formData.discountPrice}
                  onChange={handleChange}
                  placeholder="79.99"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début *</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin *</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive">Statut</Label>
                <div className="flex items-center space-x-2">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      isActive: e.target.checked
                    }))}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <Label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Décrivez les détails de l'offre..."
                  rows={5}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/offers')}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  'Mise à jour...'
                ) : (
                  <>
                    <FiSave className="mr-2 h-4 w-4" />
                    Mettre à jour l'offre
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
