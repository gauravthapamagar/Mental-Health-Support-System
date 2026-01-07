// lib/blog-data.ts

export interface Author {
  name: string;
  avatar: string;
  role?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  coverImage: string;
  date: string;
  author: Author;
  category?: string;
  isApproved?: boolean;
  approverName?: string;
}

// --- STATIC DATA ---

export const heroPost: BlogPost = {
  id: "hero-1",
  title: "Unlocking Mental Health Efficiency with AI-Driven SaaS Solutions",
  coverImage:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301&auto=format&fit=crop", // Modern office/tech vibe
  date: "10 April 2025",
  category: "Wellness Tech",
  author: {
    name: "Jennifer Taylor",
    avatar: "https://i.pravatar.cc/150?img=32", // Placeholder avatar
  },
  isApproved: true,
  approverName: "Dr. John Doe, Therapist",
};

export const sidebarPosts: BlogPost[] = [
  {
    id: "side-1",
    title: "Revolutionizing Therapy Intake through Smart Forms",
    coverImage:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop", // Data/charts
    date: "08 April 2025",
    author: { name: "Sarah Jenkins", avatar: "" },
    isApproved: true,
    approverName: "Dr. John Doe, Therapist",
  },
  {
    id: "side-2",
    title: "The Role of UX in Engaging Digital Therapeutics (DTx)",
    coverImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2370&auto=format&fit=crop", // UX/Screen analysis
    date: "05 April 2025",
    author: { name: "Mike Chen", avatar: "" },
    isApproved: true,
    approverName: "Dr. John Doe, Therapist",
  },
  {
    id: "side-3",
    title: "Data Privacy in Mental Health Tech: Navigating HIPAA",
    coverImage:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1470&auto=format&fit=crop", // Secure/Tech
    date: "02 April 2025",
    author: { name: "Legal Team", avatar: "" },
    isApproved: true,
    approverName: "Dr. John Doe, Therapist",
  },
  {
    id: "side-4",
    title: "AI Chatbots vs. Human Therapists: Finding the Balance",
    coverImage:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1470&auto=format&fit=crop", // People discussing
    date: "28 March 2025",
    author: { name: "Emily Stone", avatar: "" },
    isApproved: true,
    approverName: "Dr. John Doe, Therapist",
  },
];

export const recentPosts: BlogPost[] = [
  {
    id: "recent-1",
    title: "Understanding Your Clinician Dashboard: A Practical Guide",
    excerpt:
      "Dive into the world of our new user interfaces with expert guides on tracking patient progress efficiently.",
    coverImage:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1470&auto=format&fit=crop", // Person at laptop
    date: "20 March 2025",
    author: { name: "Alex Morgan", avatar: "https://i.pravatar.cc/150?img=11" },
    isApproved: true,
    approverName: "Dr. John Doe, Therapist",
  },
  {
    id: "recent-2",
    title: "Crafting Seamless Patient Journeys in Telehealth",
    excerpt:
      "Explore principles and techniques that drive user-centric design, ensuring a seamless connection between patient and provider.",
    coverImage:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1470&auto=format&fit=crop", // Professionals at whiteboard
    date: "18 March 2025",
    author: { name: "Lisa Wong", avatar: "https://i.pravatar.cc/150?img=5" },
    isApproved: true,
    approverName: "Dr. John Doe, Therapist",
  },
  {
    id: "recent-3",
    title: "Beyond Aesthetics: Building Trust through Empathetic UI",
    excerpt:
      "Delve into emotional design and discover how incorporating empathy makes digital mental health tools more effective.",
    coverImage:
      "https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=1664&auto=format&fit=crop", // Minimalist desk/calm
    date: "15 March 2025",
    author: { name: "Ryan A.", avatar: "https://i.pravatar.cc/150?img=60" },
    isApproved: true,
    approverName: "Ryan A.",
  },
];
