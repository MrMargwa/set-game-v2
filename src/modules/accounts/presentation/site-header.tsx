import { getAuthenticatedUser } from "../application/get-authenticated-user";
import { SiteHeaderNav } from "./site-header-nav";

export async function SiteHeader() {
  const user = await getAuthenticatedUser();

  return <SiteHeaderNav username={user?.username ?? null} />;
}
