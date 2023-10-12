import "next-auth";
import { DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface DefaultJWT extends Record<string, unknown> {
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    sub?: string;
    id?: string;
  }
}
