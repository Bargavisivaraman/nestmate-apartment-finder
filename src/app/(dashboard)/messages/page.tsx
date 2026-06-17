import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { MessagesView } from "@/components/messages-view";

export default async function MessagesPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-muted-foreground">
          Reach out to roommates and landlords. Replies are simulated for the demo.
        </p>
      </div>
      <Suspense fallback={null}>
        <MessagesView currentUserId={session!.user.id} />
      </Suspense>
    </div>
  );
}
