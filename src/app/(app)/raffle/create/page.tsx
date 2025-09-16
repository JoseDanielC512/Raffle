import CreateRaffleForm from "@/components/raffle/create-raffle-form";

export default function CreateRafflePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Crear una Nueva Rifa</h1>
        <p className="text-muted-foreground">
          Describe tu premio y deja que nuestra IA te ayude con los detalles.
        </p>
      </div>
      <CreateRaffleForm />
    </div>
  );
}
