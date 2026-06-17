import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CITIES = [
  { city: "Austin", state: "TX", neighborhoods: ["East Side", "South Congress", "Mueller", "Hyde Park"] },
  { city: "Denver", state: "CO", neighborhoods: ["RiNo", "Capitol Hill", "Highlands", "Wash Park"] },
  { city: "Seattle", state: "WA", neighborhoods: ["Capitol Hill", "Ballard", "Fremont", "Queen Anne"] },
  { city: "Chicago", state: "IL", neighborhoods: ["Wicker Park", "Lincoln Park", "Logan Square", "Pilsen"] },
];

const AMENITIES = [
  "In-unit laundry",
  "Parking",
  "Gym",
  "Pool",
  "Dishwasher",
  "Balcony",
  "Rooftop",
  "Central AC",
  "Hardwood floors",
  "Walk-in closet",
];

const SAMPLE_LEASE = `RESIDENTIAL LEASE AGREEMENT. Term: 12 months beginning on the move-in date. Monthly rent is due on the 1st of each month. A late fee of $75 applies after the 5th. Security deposit equal to one month's rent is required and is refundable less damages. Tenant is responsible for electricity and internet; water and trash are included. No subletting without written landlord approval. This lease will automatically renew month-to-month unless either party gives 60 days written notice. Pets allowed with a non-refundable $300 pet fee.`;

function pick<T>(arr: T[], n: number, seed: number): T[] {
  const out: T[] = [];
  const used = new Set<number>();
  let s = seed;
  while (out.length < n && used.size < arr.length) {
    s = (s * 1103515245 + 12345) % 2147483647;
    const i = s % arr.length;
    if (!used.has(i)) {
      used.add(i);
      out.push(arr[i]);
    }
  }
  return out;
}

const TITLES = [
  "Sunny corner unit with skyline views",
  "Modern loft steps from the park",
  "Cozy garden apartment with patio",
  "Renovated 2BR in walkable district",
  "Bright studio with rooftop access",
  "Spacious townhome near transit",
  "Chic flat with in-unit laundry",
  "Quiet retreat on a tree-lined street",
  "Industrial loft with exposed brick",
  "Updated unit close to nightlife",
  "Charming brownstone apartment",
  "Penthouse with floor-to-ceiling windows",
];

async function main() {
  console.log("Seeding database...");

  // Clean slate (order matters for FKs).
  await prisma.message.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.roommateProfile.deleteMany();
  await prisma.apartment.deleteMany();
  await prisma.user.deleteMany();

  const adminPw = await bcrypt.hash("admin123", 10);
  const demoPw = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: { email: "admin@nestmate.app", name: "Avery Admin", password: adminPw, role: "ADMIN" },
  });
  const demo = await prisma.user.create({
    data: { email: "demo@nestmate.app", name: "Demo Renter", password: demoPw, role: "USER" },
  });

  const roommateSeeds = [
    { email: "jordan@nestmate.app", name: "Jordan Lee", city: "Austin", sleep: "NIGHT_OWL", interests: "music, cooking, gaming, hiking", bio: "Grad student who loves cooking and live music. Tidy but laid-back." },
    { email: "sam@nestmate.app", name: "Sam Rivera", city: "Austin", sleep: "EARLY_BIRD", interests: "running, coffee, reading, hiking", bio: "Early riser, marathoner, big on weekend hikes. Looking for a clean space." },
    { email: "casey@nestmate.app", name: "Casey Morgan", city: "Denver", sleep: "FLEXIBLE", interests: "skiing, cooking, movies, dogs", bio: "Dog parent and ski bum. Easygoing and social on weekends." },
    { email: "riley@nestmate.app", name: "Riley Chen", city: "Seattle", sleep: "NIGHT_OWL", interests: "gaming, coffee, music, photography", bio: "Software dev, night owl, quiet during the week. Coffee snob." },
    { email: "taylor@nestmate.app", name: "Taylor Brooks", city: "Chicago", sleep: "EARLY_BIRD", interests: "yoga, cooking, reading, art", bio: "Yoga teacher, very tidy, calm home environment preferred." },
  ];

  const roommates = [];
  for (let i = 0; i < roommateSeeds.length; i++) {
    const r = roommateSeeds[i];
    const pw = await bcrypt.hash("password123", 10);
    const u = await prisma.user.create({
      data: { email: r.email, name: r.name, password: pw, role: "USER" },
    });
    await prisma.roommateProfile.create({
      data: {
        userId: u.id,
        budgetMin: 700 + i * 100,
        budgetMax: 1800 + i * 150,
        cleanliness: ((i + 2) % 5) + 1,
        sleepSchedule: r.sleep,
        social: ((i + 1) % 5) + 1,
        smoking: false,
        pets: i % 2 === 0,
        city: r.city,
        bio: r.bio,
        interests: r.interests,
      },
    });
    roommates.push(u);
  }

  // Demo user's own roommate profile.
  await prisma.roommateProfile.create({
    data: {
      userId: demo.id,
      budgetMin: 800,
      budgetMax: 2000,
      cleanliness: 4,
      sleepSchedule: "FLEXIBLE",
      social: 4,
      smoking: false,
      pets: true,
      city: "Austin",
      bio: "Looking for a friendly, clean roommate near downtown. Love cooking and hiking on weekends.",
      interests: "cooking, hiking, music, dogs",
    },
  });

  // Apartments.
  const owners = [admin, demo, ...roommates];
  const apartments = [];
  for (let i = 0; i < 16; i++) {
    const loc = CITIES[i % CITIES.length];
    const neighborhood = loc.neighborhoods[i % loc.neighborhoods.length];
    const bedrooms = (i % 3) + 1;
    const rent = 900 + ((i * 173) % 2600);
    const apt = await prisma.apartment.create({
      data: {
        title: TITLES[i % TITLES.length],
        address: `${100 + i * 7} ${["Maple", "Oak", "Pine", "Cedar", "Elm"][i % 5]} St`,
        city: loc.city,
        state: loc.state,
        neighborhood,
        rent,
        bedrooms,
        bathrooms: bedrooms === 1 ? 1 : bedrooms - 0.5,
        sqft: 480 + bedrooms * 280 + (i % 4) * 60,
        description:
          "A thoughtfully updated home with great natural light, modern finishes, and a layout that works for both relaxing and hosting. Close to transit, cafes, and parks.",
        imageUrl: `https://picsum.photos/seed/nestmate${i}/800/500`,
        amenities: pick(AMENITIES, 4, i + 3).join(", "),
        petFriendly: i % 3 !== 0,
        furnished: i % 4 === 0,
        leaseText: SAMPLE_LEASE,
        commuteNotes:
          i % 2 === 0
            ? "About 15 min to downtown by bus, 25 min by bike. Grocery within 2 blocks."
            : "10 min walk to the light rail; easy highway access for drivers.",
        createdById: owners[i % owners.length].id,
      },
    });
    apartments.push(apt);
  }

  // Demo favorites + shortlist.
  for (let i = 0; i < 5; i++) {
    await prisma.favorite.create({
      data: {
        userId: demo.id,
        apartmentId: apartments[i].id,
        shortlisted: i < 2,
      },
    });
  }

  // Seed a conversation between demo and Jordan.
  const jordan = roommates[0];
  await prisma.message.create({
    data: { senderId: demo.id, receiverId: jordan.id, content: "Hi Jordan! Saw we matched — are you still looking for a place near downtown?" },
  });
  await prisma.message.create({
    data: { senderId: jordan.id, receiverId: demo.id, content: "Hey! Yes I am. Your profile looks like a great fit. Want to check out a few listings together?" },
  });
  await prisma.message.create({
    data: { senderId: demo.id, receiverId: jordan.id, content: "Definitely. I shortlisted a couple in East Side. Let's compare budgets this week." },
  });

  console.log(`Seeded ${owners.length} users, ${apartments.length} apartments.`);
  console.log("Accounts:");
  console.log("  demo@nestmate.app / password123 (user)");
  console.log("  admin@nestmate.app / admin123 (admin)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
