import { Header } from '@/components/Header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function FAQ() {
  const faqs = [
    {
      question: 'How do I book a car?',
      answer: 'Browse our partner agencies, select a vehicle you like, check the availability calendar to find open dates, then complete the booking form with your details and payment information. You\'ll receive instant confirmation.',
    },
    {
      question: 'What does the calendar show?',
      answer: 'The availability calendar displays real-time booking status for each vehicle. Days marked in red are already booked by other customers. Available days are shown in gray/white, and you can select your desired date range by clicking on the start and end dates.',
    },
    {
      question: 'Can I modify or cancel my booking?',
      answer: 'Yes, you can modify or cancel your booking up to 24 hours before your scheduled pickup time. Contact our support team or reach out directly to the rental agency to make changes.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit and debit cards including Visa, Mastercard, American Express, and Discover. Payment is processed securely through our platform.',
    },
    {
      question: 'Is insurance included in the rental price?',
      answer: 'Basic insurance coverage varies by agency. We recommend reviewing the specific terms of each rental agency before booking. Additional coverage options may be available at pickup.',
    },
    {
      question: 'What documents do I need to rent a car?',
      answer: 'You\'ll typically need a valid driver\'s license, a credit card in your name, and proof of insurance (if required by the agency). International renters may need an International Driving Permit.',
    },
    {
      question: 'How do I become a partner agency?',
      answer: 'We\'re always looking for quality rental partners! Visit our admin dashboard or contact us directly to learn about partnership opportunities and requirements.',
    },
    {
      question: 'What if the car isn\'t as described?',
      answer: 'All our partner agencies are vetted for quality, but if you experience any issues, contact our support team immediately. We\'ll work with the agency to resolve the problem or help you find an alternative vehicle.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="py-24 bg-gradient-to-br from-primary to-primary/80">
        <div className="container text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Find answers to common questions about booking and renting cars through our platform.
          </p>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card rounded-xl px-6 shadow-card border-none"
              >
                <AccordionTrigger className="text-left font-display font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Still have questions */}
      <section className="py-16 bg-muted/30">
        <div className="container text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            Still have questions?
          </h2>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? Our support team is happy to help.
          </p>
          <Button variant="accent" asChild>
            <Link to="/contact">Contact Support</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
