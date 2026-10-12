import Link from "next/link";
import { linkAccent, pageLead, pageTitle } from "@/shared/presentation/ui/styles";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-3 px-4 py-16">
      <h1 className={pageTitle}>Pagina niet gevonden.</h1>
      <p className={pageLead}>Deze pagina bestaat niet of is verplaatst.</p>
      <Link href="/" className={linkAccent}>
        Naar de startpagina
      </Link>
    </div>
  );
}
