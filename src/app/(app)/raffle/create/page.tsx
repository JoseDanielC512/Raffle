import CreateRaffleForm from "@/components/raffle/create-raffle-form";

export default function CreateRafflePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Create a New Raffle</h1>
        <p className="text-muted-foreground">
          Describe your prize and let our AI help you with the details.
        </p>
      </div>
      <CreateRaffleForm />
    </div>
  );
}
