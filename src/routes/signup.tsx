import { createFileRoute } from "@tanstack/react-router";
import { AuthLayout } from "./login";

export const Route = createFileRoute("/signup")({
  component: () => <AuthLayout title="Start your free trial" sub="No credit card required" cta="Create account" alt={["Already have an account?", "Sign in", "/login"]} />,
});
