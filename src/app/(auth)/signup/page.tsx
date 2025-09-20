import React from 'react';
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="w-full max-w-md px-4">
        <SignupForm />
      </div>
    </section>
  );
}
