"use client";

import * as React from "react";
import { UserForm } from "../components/UserForm";

export default function CreateUserPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Add New User</h1>
        <p className="text-muted-foreground text-sm">Create a new user and assign them a system role.</p>
      </div>

      <UserForm />
    </div>
  );
}
