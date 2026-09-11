"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LynxHeader } from "@/components/LynxHeader";
import { Button } from "@/components/ui/button";

export function AdminPage() {
  const users = useQuery(api.users.listForAdmin);
  const setRole = useMutation(api.users.setRole);
  const [error, setError] = useState<string | null>(null);

  const handleSetRole = (externalId: string, role: "admin" | "user") => {
    setError(null);
    setRole({ externalId, role }).catch((e) => {
      setError(e instanceof Error ? e.message : "Failed to update role");
    });
  };

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 pointer-events-none opacity-30 base-pattern"
        aria-hidden
      />
      <LynxHeader subtitle="Admin" activePage="admin" />

      <div className="relative max-w-6xl mx-auto px-6 py-6">
        <h2 className="text-xl font-semibold text-foreground uppercase tracking-tight mb-4">
          Users
        </h2>

        {error && (
          <p className="mb-4 text-destructive font-medium" role="alert">
            {error}
          </p>
        )}
        {users === undefined ? (
          <p className="text-primary">Loading…</p>
        ) : (
          <div className="border-2 border-accent rounded-md overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-accent/20 border-b-2 border-accent">
                  <th className="px-4 py-3 font-semibold uppercase tracking-wide text-foreground">
                    User
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wide text-foreground">
                    Role
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase tracking-wide text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-accent/30 hover:bg-accent/5"
                  >
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">
                        {u.name ?? u.email ?? u.externalId}
                      </span>
                      {u.email && (
                        <span className="text-muted-foreground text-sm block">
                          {u.email}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          u.role === "admin"
                            ? "text-primary font-semibold"
                            : "text-muted-foreground"
                        }
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      {u.role === "user" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="uppercase font-semibold"
                          onClick={() =>
                            handleSetRole(u.externalId, "admin")
                          }
                        >
                          Elevate to admin
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="uppercase font-semibold"
                          onClick={() =>
                            handleSetRole(u.externalId, "user")
                          }
                        >
                          Demote to user
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
