import { Header } from '@/components/Header';
import { Users, Shield, Award, Globe } from 'lucide-react';

export default function About() {
  const stats = [
    { label: 'Partner Agencies', value: '50+' },
    { label: 'Vehicles Available', value: '500+' },
    { label: 'Happy Customers', value: '10,000+' },
    { label: 'Cities Covered', value: '25+' },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'All our partner agencies are vetted and verified to ensure you get the best service.',
    },
    {
      icon: Award,
      title: 'Quality Vehicles',
      description: 'We partner only with agencies that maintain their vehicles to the highest standards.',
    },
    {
      icon: Users,
      title: 'Customer First',
      description: 'Our support team is available 24/7 to help you with any questions or issues.',
    },
    {
      icon: Globe,
      title: 'Wide Coverage',
      description: 'From coast to coast, find the perfect rental car wherever your journey takes you.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary to-primary/80">
        <div className="container text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            About Car Rental Planner
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            We connect you with the best car rental agencies across the country, making it easy to find and book your perfect ride.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 -mt-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-card rounded-xl p-6 text-center shadow-card">
                <div className="text-3xl md:text-4xl font-bold text-accent mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl font-bold text-foreground mb-6">Our Story</h2>
            <p className="text-muted-foreground mb-4">
              Car Rental Planner was founded with a simple mission: to make car rental booking easier and more transparent. 
              We noticed that customers were struggling to compare options across different rental agencies, often missing 
              out on great deals or ending up with vehicles that didn't meet their needs.
            </p>
            <p className="text-muted-foreground">
              Today, we're proud to partner with dozens of trusted rental agencies nationwide, offering a seamless 
              platform where you can browse, compare, and book vehicles with confidence. Our visual availability 
              calendar makes it easy to see exactly when cars are available, while our secure payment system 
              ensures a smooth transaction every time.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-card rounded-xl p-6 shadow-card">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
