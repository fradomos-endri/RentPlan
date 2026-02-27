import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowRight, Shield, Clock, Award, MapPin, Users, TrendingUp, Zap, CheckCircle, Sparkles, Gauge, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { SearchHero } from '@/components/SearchHero';
import { AgencyCard } from '@/components/AgencyCard';
import { mockAgencies } from '@/data/mockData';
import benefitsImage from '@/assets/archivio-automobile-gsNRBHH1Ij4-unsplash.jpg';
import rentplanLogo from '@/assets/rentplan.png';
import { getApiUrl, API_ENDPOINTS } from '@/config/api';

const features = [
  {
    icon: Shield,
    title: 'Trusted Partners',
    description: 'All agencies are verified and rated by real customers.',
    gradient: 'from-emerald-400/20 to-teal-400/20',
    color: 'text-emerald-600',
  },
  {
    icon: Clock,
    title: 'Easy Booking',
    description: 'Book your perfect car in minutes with our simple calendar system.',
    gradient: 'from-orange-400/20 to-red-400/20',
    color: 'text-orange-600',
  },
  {
    icon: Award,
    title: 'Best Prices',
    description: 'Compare prices across agencies to find the best deal.',
    gradient: 'from-purple-400/20 to-pink-400/20',
    color: 'text-purple-600',
  },
];

const benefits = [
  {
    icon: MapPin,
    title: 'Multiple Locations',
    description: 'Pick up and drop off at locations convenient for you',
  },
  {
    icon: Users,
    title: '24/7 Support',
    description: 'Our dedicated team is always ready to help you',
  },
  {
    icon: TrendingUp,
    title: 'Transparent Pricing',
    description: 'No hidden fees, all costs are displayed upfront',
  },
  {
    icon: Lock,
    title: 'Secure Payments',
    description: 'Your data is protected with enterprise-grade security',
  },
];

export default function Index() {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        setLoading(true);
        const response = await fetch(getApiUrl(API_ENDPOINTS.BUSINESSES));
        
        if (!response.ok) {
          console.error('Failed to fetch businesses:', response.status);
          setAgencies(mockAgencies);
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          const transformedAgencies = await Promise.all(
            data.slice(0, 4).map(async (business) => {
              // Fetch cover image for each business
              let coverImageUrl = 'https://images.unsplash.com/photo-1549399542-7e3f8b83ad8e?w=400';
              
              try {
                const imageResponse = await fetch(
                  getApiUrl(`${API_ENDPOINTS.BUSINESSES}/${business.business_id || business.id}/cover-image`)
                );
                
                if (imageResponse.ok) {
                  const blob = await imageResponse.blob();
                  coverImageUrl = URL.createObjectURL(blob);
                }
              } catch (error) {
                console.error('Error fetching cover image for business:', business.business_id, error);
              }

              return {
                id: business.business_id || business.id,
                name: business.business_name,
                image: coverImageUrl,
                rating: business.rating || 4.5,
                reviewCount: business.review_count || 0,
                location: business.location || 'City Location',
                carCount: business.car_count || 0,
              };
            })
          );
          
          setAgencies(transformedAgencies);
        } else {
          setAgencies(mockAgencies);
        }
      } catch (err) {
        console.error('Error fetching agencies:', err);
        setAgencies(mockAgencies);
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
  }, []);

  const displayAgencies = agencies.length > 0 ? agencies : mockAgencies;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <SearchHero />

      {/* Featured Agencies - Enhanced */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-400/10 to-transparent rounded-full blur-3xl -ml-48 -mb-48" />
        
        <div className="container relative z-10">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Featured Partners</span>
            </div>
            <h2 className="font-bold text-4xl md:text-5xl text-foreground mb-4">
              Top-Rated Rental Agencies
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from our carefully selected network of premium car rental partners with exceptional ratings and service
            </p>
          </div>

          {loading && (
            <div className="flex justify-center items-center h-48">
              <div className="text-muted-foreground">Loading agencies...</div>
            </div>
          )}

          {!loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
              {displayAgencies.map((agency, index) => (
                <div
                  key={agency.id}
                  className="animate-fade-in transform transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <AgencyCard agency={agency} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link to="/agencies">
              <Button size="lg" variant="outline" className="group">
                Explore All Agencies
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Enhanced Grid */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="absolute top-20 right-1/3 w-80 h-80 bg-gradient-to-br from-blue-300/5 to-cyan-300/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-tr from-cyan-300/5 to-blue-300/5 rounded-full blur-3xl" />
        
        <div className="container relative z-10">
          <div className="mb-16 text-center">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Why Choose Us</span>
            <h2 className="font-bold text-4xl md:text-5xl text-foreground mt-4 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience premium car rentals with industry-leading features and benefits
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative h-full rounded-2xl border border-gray-200/50 bg-white/80 backdrop-blur p-8 hover:border-blue-300/50 hover:bg-white transition-all duration-300">
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} transition-all duration-300 group-hover:scale-110`}>
                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <h3 className="font-bold text-xl text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - Redesigned */}
      <section 
        className="relative py-20 md:py-28 overflow-hidden bg-cover bg-fixed bg-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.93) 50%, rgba(255,255,255,0.8)), url(${benefitsImage})`
        }}
      >
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `linear-gradient(135deg, transparent 0%, transparent 45%, rgba(59, 130, 246, 0.1) 50%, transparent 55%, transparent 100%)`,
          backgroundSize: '100% 100%'
        }} />
        
        <div className="container relative z-10">
          <div className="mb-16 text-center">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Benefits</span>
            <h2 className="font-bold text-4xl md:text-5xl text-foreground mt-4 mb-4">
              Built for Your Convenience
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Seamless experience from search to drive
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              const colors = ['from-blue-400 to-cyan-400', 'from-purple-400 to-pink-400', 'from-emerald-400 to-teal-400', 'from-orange-400 to-red-400'];
              return (
                <div
                  key={index}
                  className="group relative animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative rounded-2xl p-6 bg-white border border-gray-200/50 hover:border-blue-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${colors[index % 4]} text-white`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-foreground text-base">{benefit.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works - Redesigned */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-white">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-5xl">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
            <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
          </div>
        </div>
        
        <div className="container relative z-10">
          <div className="mb-16 text-center">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Process</span>
            <h2 className="font-bold text-4xl md:text-5xl text-foreground mt-4 mb-4">
              Three Simple Steps
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From search to drive in minutes
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Search & Select',
                description: 'Enter your dates and location to discover available vehicles from all partner agencies',
                icon: Gauge,
              },
              {
                step: '02',
                title: 'Compare & Book',
                description: 'Review prices, features, and ratings to choose the perfect car for your journey',
                icon: CheckCircle,
              },
              {
                step: '03',
                title: 'Pick Up & Drive',
                description: 'Collect your car and hit the road with confidence and full support',
                icon: Zap,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group relative flex flex-col animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold text-lg shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                  {item.step}
                </div>
                <h3 className="font-bold text-xl text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed flex-grow">
                  {item.description}
                </p>
                {index < 2 && (
                  <div className="absolute top-8 -right-4 hidden h-0.5 w-8 bg-gradient-to-r from-blue-400 to-cyan-400 md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { number: '50+', label: 'Partner Agencies' },
              { number: '2,000+', label: 'Available Vehicles' },
              { number: '10,000+', label: 'Happy Customers' },
              { number: '99.8%', label: 'Satisfaction Rate' },
            ].map((stat, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 right-1/4 w-96 h-96 bg-gradient-to-bl from-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-gradient-to-tr from-cyan-400/20 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10">
          <div className="rounded-3xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 border border-blue-300/20 backdrop-blur-xl p-12 md:p-16 text-center">
            <h2 className="font-bold text-4xl md:text-5xl text-foreground mb-4">
              Ready to Find Your Perfect Car?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Join thousands of satisfied customers. Browse our extensive inventory, compare prices, and book instantly with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/cars">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg">
                  Explore Vehicles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="border-blue-300 hover:bg-blue-50">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Improved */}
      <footer className="relative border-t bg-slate-900 text-white py-16 md:py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/10 rounded-full blur-3xl -mr-48 -mt-48" />
        
        <div className="container relative z-10">
          <div className="grid gap-10 md:grid-cols-5 mb-12">
            <div className="md:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                <img src={rentplanLogo} alt="RentPlan" className="h-12 w-auto" />
                <div className="flex items-baseline gap-0">
                  <span className="font-black text-xl tracking-tight">Rent</span>
                  <span className="font-black text-xl text-blue-400">Plan</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">Premium car rentals made simple. Your trusted partner for affordable, reliable vehicle rentals from verified local agencies.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Browse</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link to="/cars" className="hover:text-white transition">Browse Cars</Link></li>
                <li><Link to="/agencies" className="hover:text-white transition">Find Agencies</Link></li>
                <li><Link to="/how-it-works" className="hover:text-white transition">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
                <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
                <a href="#" className="hover:text-white transition">Help Center</a>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-400">© 2024 RentPlan. All rights reserved. Your trusted partner in car rentals.</p>
              <div className="flex gap-6 text-sm text-slate-400">
                <a href="#" className="hover:text-white transition">Privacy Policy</a>
                <a href="#" className="hover:text-white transition">Terms of Service</a>
                <a href="#" className="hover:text-white transition">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
