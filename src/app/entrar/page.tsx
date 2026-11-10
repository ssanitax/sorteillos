import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ codigo?: string }>;
};

/** Redirección legacy: la entrada anónima ya no existe. */
export default async function EntrarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const codigo = params.codigo?.trim().toUpperCase();
  if (codigo) {
    redirect(`/s/${codigo}`);
  }
  redirect("/unirse");
}
