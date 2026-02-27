import { Link } from 'react-router-dom';
import { MapPin, Star, Car } from 'lucide-react';
import { Agency } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AgencyCardProps {
  agency: Agency;
}

export function AgencyCard({ agency }: AgencyCardProps) {
  return (
    <Card className="group overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img
          src={agency.image}
          alt={agency.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
          <h3 className="font-display text-lg font-bold text-gray-900">
            {agency.name}
          </h3>
          <div className="flex items-center gap-1 text-gray-700">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{agency.location}</span>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
          {agency.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="font-semibold">{agency.rating}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Car className="h-4 w-4" />
              <span className="text-sm">{agency.totalCars} cars</span>
            </div>
          </div>
          <Link to={`/agency/${agency.id}`}>
            <Button variant="accent" size="sm">
              View Fleet
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
