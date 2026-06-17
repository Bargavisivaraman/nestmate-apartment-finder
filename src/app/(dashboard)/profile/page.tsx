import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile-form";
import { initials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function ProfilePage() {
  const session = await auth();
  const user = session!.user;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
            {initials(user.name, user.email)}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user.name || "Your profile"}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.role === "ADMIN" && (
              <Badge variant="warning" className="mt-1">
                Admin
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roommate profile</CardTitle>
          <CardDescription>
            This drives your compatibility scores and budget calculations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}
