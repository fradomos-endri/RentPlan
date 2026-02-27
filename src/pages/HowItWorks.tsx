import { Header } from '@/components/Header';
import { Search, Calendar, CreditCard, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: Search,
      title: 'Browse Agencies',
      description: 'Explore our network of trusted car rental partners. Each agency has been vetted to ensure quality service and well-maintained vehicles.',
    },
    {
      number: '02',
      icon: Calendar,
      title: 'Check Availability',
      description: 'View the real-time availability calendar for each vehicle. Red dates are already booked, so you can easily find open slots that work for your schedule.',
    },
    {
      number: '03',
      icon: CreditCard,
      title: 'Book & Pay',
      description: 'Select your dates, enter your details, and complete your booking with our secure payment system. You\'ll receive instant confirmation.',
    },
    {
      number: '04',
      icon: Car,
      title: 'Pick Up & Drive',
      description: 'Head to the rental agency at your scheduled time. Show your booking confirmation and hit the road!',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-primary to-primary/80">
        <div className="container text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            How It Works
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Booking your next rental car is simple. Here's how to get started.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div 
                key={step.number} 
                className={`flex flex-col md:flex-row gap-8 items-start ${index !== steps.length - 1 ? 'mb-16' : ''}`}
              >
                {/* Number */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <span className="font-display text-3xl font-bold text-accent">{step.number}</span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <step.icon className="h-6 w-6 text-accent" />
                    <h2 className="font-display text-2xl font-bold text-foreground">{step.title}</h2>
                  </div>
                  <p className="text-muted-foreground text-lg">{step.description}</p>
                </div>
                
                {/* Connector line (hidden on last item) */}
                {index !== steps.length - 1 && (
                  <div className="hidden md:block absolute left-[2.5rem] mt-20 w-0.5 h-16 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Browse our selection of rental agencies and find the perfect car for your next adventure.
          </p>
          <Button variant="accent" size="lg" asChild>
            <Link to="/agencies">Browse Agencies</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
