import '../landing.css';
import './pricing.css';
import PricingView from './PricingView';

export const metadata = {
  title: 'Pricing · NETZ',
  description: 'NETZ is free to learn with. Pro removes ads and adds unlimited cloud notes, more public links and clean exports.',
};

/** The Pricing page (NETZ_LAUNCH_PLAN.md 5.4 step 2; board artboards 14 and 15). */
export default function PricingPage() {
  return <PricingView />;
}
