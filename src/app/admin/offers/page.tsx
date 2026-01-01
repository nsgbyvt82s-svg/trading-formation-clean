'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FiPlus, FiEdit, FiTrash2, FiClock, FiCheck, FiX } from 'react-icons/fi';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Offer {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/admin/offers');
      const data = await response.json();
      setOffers(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des offres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      try {
        await fetch(`/api/admin/offers/${id}`, {
          method: 'DELETE',
        });
        setOffers(offers.filter(offer => offer.id !== id));
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'offre:', error);
      }
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/offers/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      
      setOffers(offers.map(offer => 
        offer.id === id ? { ...offer, isActive: !currentStatus } : offer
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd MMM yyyy', { locale: fr });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Gestion des offres
          </h1>
          <p className="text-muted-foreground">
            Gérez les offres disponibles sur la plateforme
          </p>
        </div>
        <Button 
          onClick={() => router.push('/admin/offers/new')}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Nouvelle offre
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des offres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Prix réduit</TableHead>
                  <TableHead>Date de début</TableHead>
                  <TableHead>Date de fin</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.length > 0 ? (
                  offers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell className="font-medium">{offer.title}</TableCell>
                      <TableCell>{offer.price} €</TableCell>
                      <TableCell>
                        {offer.discountPrice ? `${offer.discountPrice} €` : '-'}
                      </TableCell>
                      <TableCell>{formatDate(offer.startDate)}</TableCell>
                      <TableCell>{formatDate(offer.endDate)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {offer.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FiCheck className="mr-1 h-3 w-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <FiX className="mr-1 h-3 w-3" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStatus(offer.id, offer.isActive)}
                          >
                            {offer.isActive ? 'Désactiver' : 'Activer'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/offers/${offer.id}/edit`)}
                          >
                            <FiEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(offer.id)}
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucune offre disponible pour le moment.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
