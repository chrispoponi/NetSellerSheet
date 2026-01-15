import Stripe from 'stripe';

// @ts-ignore
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_build', {
    apiVersion: '2024-12-18.acacia' as any,
    typescript: true,
});

// Price Configuration
export const PRICES = {
    BASIC_UNLOCK: {
        amount: 499, // $4.99
        name: 'Advanced Mode Unlock',
        id: 'price_1Spn690ONIDdV6FnpknT5l1f' // Advanced Mode Unlock
    },
    PRO_BUNDLE: {
        amount: 999, // $9.99
        name: 'Seller Toolkit Bundle',
        id: 'price_1Spn9v0ONIDdV6Fn7oRy9kiF' // Seller Toolkit ($9.99)
    }
};
