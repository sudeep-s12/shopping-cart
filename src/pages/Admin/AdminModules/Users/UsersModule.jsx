import React, { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

export function UsersModule() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading users:", error);
        return;
      }

      // Normalize missing values
      const cleaned = (data || []).map((u) => ({
        ...u,
        display_name:
          u.display_name ||
          (u.email ? u.email.split("@")[0] : "Unknown User"),
        joined_at: u.created_at ? new Date(u.created_at) : null,
        last_login: u.last_login_at ? new Date(u.last_login_at) : null,
      }));

      setUsers(cleaned);
    };

    fetchUsers();
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">Users</h3>
        <span className="text-[0.75rem] text-slate-400">
          Total: {users.length}
        </span>
      </div>

      {/* EMPTY */}
      {users.length === 0 ? (
        <p className="text-xs text-slate-500">No users found.</p>
      ) : (
        <div className="space-y-2 text-xs">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2"
            >
              {/* LEFT SECTION */}
              <div>
                <p className="font-semibold text-slate-100">{u.display_name}</p>
                <p className="text-[0.7rem] text-slate-400">{u.email}</p>

                <p className="text-[0.65rem] text-slate-500 mt-1">
                  Joined:{" "}
                  {u.joined_at
                    ? u.joined_at.toLocaleDateString()
                    : "Not available"}
                </p>

                <p className="text-[0.65rem] text-slate-500">
                  Last login:{" "}
                  {u.last_login
                    ? u.last_login.toLocaleString()
                    : "Never logged in"}
                </p>
              </div>

              {/* RIGHT SECTION */}
              <div className="flex flex-col items-end gap-1">
                <span className="rounded-full bg-emerald-500/20 text-emerald-200 px-2 py-0.5 text-[0.65rem]">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
