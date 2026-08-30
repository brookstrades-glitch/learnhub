import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getAllProfiles, getAdminStats } from "@/lib/queries";
import { setUserRole } from "@/actions/admin";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const me = await requireRole("admin");
  const [users, stats] = await Promise.all([getAllProfiles(), getAdminStats()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Admin</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          ["Users", stats.users],
          ["Courses", stats.courses],
          ["Enrollments", stats.enrollments],
        ].map(([label, n]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold">{n}</CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-semibold">Users</h2>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-3">{u.fullName ?? "—"}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  {u.id === me.id ? (
                    <span className="capitalize">{u.role} (you)</span>
                  ) : (
                    <form action={setUserRole.bind(null, u.id)} className="flex items-center gap-2">
                      <select
                        name="role"
                        defaultValue={u.role}
                        className="h-8 rounded-md border bg-background px-2 text-sm"
                        aria-label={`Role for ${u.email}`}
                      >
                        <option value="student">student</option>
                        <option value="instructor">instructor</option>
                        <option value="admin">admin</option>
                      </select>
                      <Button type="submit" size="xs" variant="outline">
                        Save
                      </Button>
                    </form>
                  )}
                </td>
                <td className="p-3 text-muted-foreground">{u.createdAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
