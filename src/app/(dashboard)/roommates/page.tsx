import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RoommateMatches } from "@/components/roommate-matches";
import { Button } from "@/components/ui/button";

export default async function RoommatesPage() {
  const session = await auth();
  const profile = await prisma.roommateProfile.findUnique({
    where: { userId: session!.user.id },
  });

  const incomplete = !profile || (!profile.bio && !profile.interests && !profile.city);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roommate matches</h1>
          <p className="text-muted-foreground">
            Ranked by compatibility with your lifestyle and budget.
          </p>
        </div>
        <Link href="/profile">
          <Button variant="outline">Edit my profile</Button>
        </Link>
      </div>

      {incomplete && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          Your roommate profile looks sparse. Fill it out on the{" "}
          <Link href="/profile" className="font-medium text-primary hover:underline">
            profile page
          </Link>{" "}
          for sharper matches.
        </div>
      )}

      <RoommateMatches />
    </div>
  );
}
