import { createFileRoute } from "@tanstack/react-router";
import { AuthLayout } from "./login";

export const Route = createFileRoute("/signup")({
  component: () => <AuthLayout mode="signup" />,
});
