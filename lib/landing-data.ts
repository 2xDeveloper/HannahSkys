import { MEMBERSHIP_PLANS } from "@/lib/memberships";
import { HIDE_OTHER_MODELS } from "@/lib/public-creators";

/** Displayed plans come from the Stripe-authoritative membership list. */
export const membershipPlans = MEMBERSHIP_PLANS;

export const navLinks = [
  { label: "Home", href: "#top" },
  { label: "Photos", href: "#photos" },
  { label: "Premade Videos", href: "/videos" },
  { label: "Categories", href: "/videos" },
  { label: "Membership", href: "#membership" },
  ...(!HIDE_OTHER_MODELS ? [{ label: "Models", href: "#models" }] : []),
  { label: "Contact", href: "#contact" },
];

export const trustBadges = [
  { icon: "lock", label: "Exclusive Content" },
  { icon: "shield", label: "Secure & Private" },
  { icon: "diamond", label: "Premium Quality" },
  { icon: "heart", label: "Made with Love" },
];
