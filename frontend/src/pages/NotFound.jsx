import { Compass } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function NotFound() {
  return (
    <div className="container-page py-24">
      <EmptyState icon={Compass} title="Page introuvable" description="La page que vous cherchez n'existe pas ou a été déplacée." actionLabel="Retour à l'accueil" actionTo="/" />
    </div>
  );
}
