declare namespace JSX {
  interface IntrinsicElements {
    'stripe-buy-button': {
      buyButtonId: string;
      publishableKey: string;
    }
    "stripe-buy-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
} 