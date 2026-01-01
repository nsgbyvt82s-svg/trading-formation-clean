import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Choisissez Votre Formation - 1compris',
  description: 'Sélectionnez la formation qui correspond à vos objectifs de trading',
};

export default function PaiementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
