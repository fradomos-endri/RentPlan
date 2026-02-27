import { useState } from 'react';
import { CreditCard, Lock, Check, Wallet, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PaymentFormProps {
  total: number;
  onSubmit: () => void;
  onBack: () => void;
  isProcessing: boolean;
}

type PaymentMethod = 'card' | 'paypal' | 'apple' | 'google';

const AppleLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const paymentMethods = [
  { id: 'card' as PaymentMethod, name: 'Credit/Debit Card', Icon: CreditCard },
  { id: 'paypal' as PaymentMethod, name: 'PayPal', Icon: Wallet },
  { id: 'apple' as PaymentMethod, name: 'Apple Pay', Icon: AppleLogo },
  { id: 'google' as PaymentMethod, name: 'Google Pay', Icon: Chrome },
];

export function PaymentForm({ total, onSubmit, onBack, isProcessing }: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Lock className="h-4 w-4" />
        <span>Secure payment - Your data is encrypted</span>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Payment Method</Label>
        <div className="grid grid-cols-2 gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => setSelectedMethod(method.id)}
              className={`relative flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all ${
                selectedMethod === method.id
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-muted-foreground/50'
              }`}
            >
              <method.Icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">{method.name}</span>
              {selectedMethod === method.id && (
                <Check className="absolute right-2 top-2 h-4 w-4 text-accent" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Card Details - Only show for card payment */}
      {selectedMethod === 'card' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="cardName">Cardholder Name</Label>
            <Input
              id="cardName"
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="cardNumber"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                maxLength={5}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                placeholder="123"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                maxLength={3}
                required
              />
            </div>
          </div>
        </>
      )}

      {/* Alternative payment info */}
      {selectedMethod !== 'card' && (
        <div className="rounded-lg bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            You will be redirected to {paymentMethods.find(m => m.id === selectedMethod)?.name} to complete your payment securely.
          </p>
        </div>
      )}

      <div className="rounded-lg bg-muted p-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total to Pay</span>
          <span className="text-2xl font-bold text-accent">${total}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" variant="accent" className="flex-1" disabled={isProcessing}>
          {isProcessing ? 'Processing...' : `Pay $${total}`}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        By completing this purchase you agree to our terms of service
      </p>
    </form>
  );
}
