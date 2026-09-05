import { MEMBERSHIP_PLANS } from "@/lib/memberships";

/** Displayed plans come from the Stripe-authoritative membership list. */
export const membershipPlans = MEMBERSHIP_PLANS;

export const navLinks = [
  { label: "Home", href: "#top" },
  { label: "Photos", href: "#photos" },
  { label: "Videos", href: "#videos" },
  { label: "Membership", href: "#membership" },
  { label: "Models", href: "#models" },
  { label: "Contact", href: "#contact" },
];

export const trustBadges = [
  { icon: "lock", label: "Exclusive Content" },
  { icon: "shield", label: "Secure & Private" },
  { icon: "diamond", label: "Premium Quality" },
  { icon: "heart", label: "Made with Love" },
];
