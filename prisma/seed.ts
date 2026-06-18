import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { LA_LISTINGS } from "./la-listings";

const prisma = new PrismaClient();

const SAMPLE_LEASE = `RESIDENTIAL LEASE AGREEMENT. Term: 12 months beginning on the move-in date. Monthly rent is due on the 1st of each month. A late fee of $75 applies after the 5th. Security deposit equal to one month's rent is required and is refundable less damages. Tenant is responsible for electricity and internet; water and trash are included. No subletting without written landlord approval. This lease will automatically renew month-to-month unless either party gives 60 days written notice. Pets allowed with a non-refundable $300 pet fee.`;

async function main() {
  console.log("Seeding database with Los Angeles listings...");

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

  // Roommate users, all LA-based.
  const roommateSeeds = [
    { email: "jordan@nestmate.app", name: "Jordan Lee", city: "Silver Lake", sleep: "NIGHT_OWL", interests: "music, cooking, gaming, hiking", bio: "Grad student at USC who loves cooking and live music. Tidy but laid-back. Looking on the Eastside." },
    { email: "sam@nestmate.app", name: "Sam Rivera", city: "Santa Monica", sleep: "EARLY_BIRD", interests: "running, coffee, reading, surfing", bio: "Early riser and marathoner, big on beach mornings. Looking for a clean place on the Westside." },
    { email: "casey@nestmate.app", name: "Casey Morgan", city: "Echo Park", sleep: "FLEXIBLE", interests: "art, cooking, movies, dogs", bio: "Dog parent and weekend hiker. Easygoing and social. Open to anywhere near the 101." },
    { email: "riley@nestmate.app", name: "Riley Chen", city: "Culver City", sleep: "NIGHT_OWL", interests: "gaming, coffee, music, photography", bio: "Software dev in Silicon Beach, night owl, quiet during the week. Coffee snob." },
    { email: "taylor@nestmate.app", name: "Taylor Brooks", city: "Pasadena", sleep: "EARLY_BIRD", interests: "yoga, cooking, reading, art", bio: "Yoga teacher near Old Town, very tidy, calm home environment preferred." },
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
        budgetMin: 1400 + i * 150,
        budgetMax: 2800 + i * 300,
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
      budgetMin: 1800,
      budgetMax: 3200,
      cleanliness: 4,
      sleepSchedule: "FLEXIBLE",
      social: 4,
      smoking: false,
      pets: true,
      city: "Los Angeles",
      bio: "New to LA and looking for a friendly, clean roommate on the Eastside or Westside. Love cooking, hiking Griffith Park, and beach days.",
      interests: "cooking, hiking, music, dogs",
    },
  });

  // Apartments from the curated LA dataset.
  const owners = [admin, demo, ...roommates];
  const apartments = [];
  for (let i = 0; i < LA_LISTINGS.length; i++) {
    const l = LA_LISTINGS[i];
    const apt = await prisma.apartment.create({
      data: {
        title: l.title,
        address: l.address,
        city: l.city,
        state: l.state,
        neighborhood: l.neighborhood,
        rent: l.rent,
        bedrooms: l.bedrooms,
        bathrooms: l.bathrooms,
        sqft: l.sqft,
        description: l.description,
        imageUrl: `https://picsum.photos/seed/nestmate-la-${i}/800/500`,
        amenities: l.amenities,
        petFriendly: l.petFriendly,
        furnished: l.furnished,
        leaseText: SAMPLE_LEASE,
        commuteNotes: l.commuteNotes,
        latitude: l.latitude,
        longitude: l.longitude,
        createdById: owners[i % owners.length].id,
      },
    });
    apartments.push(apt);
  }

  // Demo favorites + shortlist (a mix of Eastside and Westside picks).
  for (let i = 0; i < 6; i++) {
    await prisma.favorite.create({
      data: {
        userId: demo.id,
        apartmentId: apartments[i].id,
        shortlisted: i < 3,
      },
    });
  }

  // Seed a conversation between demo and Jordan.
  const jordan = roommates[0];
  await prisma.message.create({
    data: { senderId: demo.id, receiverId: jordan.id, content: "Hi Jordan! Saw we matched — are you still looking for a place on the Eastside?" },
  });
  await prisma.message.create({
    data: { senderId: jordan.id, receiverId: demo.id, content: "Hey! Yes I am. Your profile looks like a great fit. Want to tour a few Silver Lake and Echo Park listings together?" },
  });
  await prisma.message.create({
    data: { senderId: demo.id, receiverId: jordan.id, content: "Definitely. I shortlisted a couple near the reservoir. Let's compare budgets this week." },
  });

  console.log(`Seeded ${owners.length} users and ${apartments.length} LA apartments.`);
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
