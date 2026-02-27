import { Users, Gauge, Fuel } from 'lucide-react';
import { Car } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CarCardProps {
  car: Car;
  onBook: (car: Car) => void;
}

export function CarCard({ car, onBook }: CarCardProps) {
  return (
    <Card className="group overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover">
      <div className="relative h-40 overflow-hidden">
        <img
          src={car.image}
          alt={car.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badge
          variant={car.available ? 'default' : 'secondary'}
          className="absolute right-3 top-3"
        >
          {car.available ? 'Available' : 'Unavailable'}
        </Badge>
      </div>
      <CardContent className="p-4">
        <div className="mb-2">
          <h4 className="font-display text-lg font-semibold text-foreground">
            {car.name}
          </h4>
          <p className="text-sm text-muted-foreground">{car.type}</p>
        </div>

        <div className="mb-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{car.seats} seats</span>
          </div>
          <div className="flex items-center gap-1">
            <Gauge className="h-4 w-4" />
            <span className="capitalize">{car.transmission}</span>
          </div>
          <div className="flex items-center gap-1">
            <Fuel className="h-4 w-4" />
            <span>{car.fuelType}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">${car.pricePerDay}</span>
            <span className="text-sm text-muted-foreground">/day</span>
          </div>
          <Button
            variant="accent"
            size="sm"
            disabled={!car.available}
            onClick={() => onBook(car)}
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
