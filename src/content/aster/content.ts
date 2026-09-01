import type {
  Doctor,
  GalleryItem,
  HeroCopy,
  NavLink,
  ServiceOffering,
  StatItem,
  Testimonial,
} from "@/types/content";

export const asterNav: NavLink[] = [
  { label: "Home", href: "/#home" },
  { label: "Services", href: "/#services" },
  { label: "Team", href: "/#team" },
  { label: "Clinic", href: "/#clinic" },
  { label: "Contact", href: "/#contact" },
];

export const asterHeroCopy: HeroCopy = {
  headlineLines: ["Dentistry that", "feels like"],
  emphasis: "you.",
  lede: "Aster is an independent dental studio built around unhurried care, honest conversations, and a room that doesn't feel like a hospital.",
  badge: "Open Tue–Sat",
};

export const asterMarqueeItems: string[] = [
  "Gentle cleanings",
  "Same-week appointments",
  "Kids welcome",
  "Nervous patients especially welcome",
];

export const asterIntroCopy =
  'Aster started because our founder, Dr. Nadia Farooqi, kept hearing the same thing from patients: "I put this off because I hate the dentist." So we made a place that doesn\'t feel like one — warm light, real conversations, and a team that explains things in plain language before they ever pick up a tool.';

export const asterServices: ServiceOffering[] = [
  {
    id: "checkups-cleanings",
    name: "Check-ups & cleanings",
    tag: "every 6 months",
    description:
      "A thorough look, a gentle clean, and honest notes on anything worth keeping an eye on.",
    accentWord: "fresh start",
    swatch: "accentSurface",
  },
  {
    id: "fillings-repairs",
    name: "Fillings & repairs",
    tag: "same-week slots",
    description: "Quick, comfortable fixes for chips, cavities, and everyday wear.",
    accentWord: "all better",
    swatch: "primary",
  },
  {
    id: "root-canal",
    name: "Root canal therapy",
    tag: "gentler than the reputation",
    description: "Modern technique and a calm hand — most patients say it wasn't so bad.",
    accentWord: "root canals",
    swatch: "secondary",
  },
  {
    id: "cosmetic-whitening",
    name: "Cosmetic & whitening",
    tag: "consult first, always",
    description: "From subtle brightening to a full smile plan, started with a real conversation.",
    accentWord: "new smile",
    swatch: "accent",
  },
  {
    id: "orthodontics-aligners",
    name: "Orthodontics & aligners",
    tag: "teens & adults",
    description: "Clear aligners and traditional options, mapped out before you commit to either.",
    accentWord: "grown-up teeth",
    swatch: "ink",
  },
  {
    id: "kids-dentistry",
    name: "Kids' dentistry",
    tag: "first visit by age 2",
    description: "A friendly first experience that keeps the next eighteen years of visits easy.",
    accentWord: "little smiles",
    swatch: "accentSurface",
  },
];

export const asterDoctors: Doctor[] = [
  {
    id: "nadia-farooqi",
    name: "Dr. Nadia Farooqi",
    role: "founder, general & cosmetic",
    bio: "Started Aster after ten years in a practice that felt nothing like this one. Makes terrible puns during cleanings.",
    initials: "NF",
    swatch: "primary",
  },
  {
    id: "rehan-khalid",
    name: "Dr. Rehan Khalid",
    role: "endodontics",
    bio: "The person people thank after a root canal, which still surprises him. Plays bass on weekends.",
    initials: "RK",
    swatch: "secondary",
  },
  {
    id: "sana-malik",
    name: "Dr. Sana Malik",
    role: "pediatric care",
    bio: "Has a waiting-room high-five streak going with most kids on the books. Undefeated at making first visits easy.",
    initials: "SM",
    swatch: "accent",
  },
];

export const asterGallery: GalleryItem[] = [
  { id: "waiting-room", label: "the waiting room", swatch: "accentSurface" },
  { id: "chair-2", label: "chair 2", swatch: "secondary" },
  { id: "morning-light", label: "morning light", swatch: "primary" },
  { id: "courtyard", label: "the courtyard", swatch: "accent" },
  { id: "sterilization", label: "sterilization", swatch: "ink" },
  { id: "front-desk", label: "front desk", swatch: "accentSurface" },
  { id: "consult-room", label: "consult room", swatch: "secondary" },
];

export const asterTestimonial: Testimonial = {
  quote:
    "I hadn't been to a dentist in six years. Aster is the first one that didn't make me feel bad about that.",
  attribution: "Zara H., patient since 2023",
};

export const asterStats: StatItem[] = [
  { value: "12k+", label: "visits since 2019" },
  { value: "4.9", label: "average patient rating" },
  { value: "15 min", label: "average wait, honestly" },
];
