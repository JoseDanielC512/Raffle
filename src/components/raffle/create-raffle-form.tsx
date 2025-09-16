'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Bot, Loader2, Wand2 } from 'lucide-react';

import { generateDetailsAction, createRaffleAction } from '@/app/actions';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

function Submit({ text, loadingText, variant = "default" }: { text: string; loadingText: string, variant?: "default" | "secondary" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant={variant}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        text
      )}
    </Button>
  );
}

function GenerateButton() {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Bot className="mr-2 h-4 w-4" />
            Generate Details with AI
          </>
        )}
      </Button>
    );
  }

export default function CreateRaffleForm() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(generateDetailsAction, initialState);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <form action={dispatch}>
          <CardHeader>
            <CardTitle className="font-headline">1. Describe Your Prize</CardTitle>
            <CardDescription>
              Tell our AI what you're raffling off, and it will generate a
              name, description, and terms for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full gap-2">
              <Label htmlFor="prompt">Prize Prompt</Label>
              <Textarea
                id="prompt"
                name="prompt"
                placeholder="e.g., A brand new PS5 console with an extra controller and three games."
                rows={4}
                required
              />
              {state.errors?.prompt && (
                <p className="text-sm text-destructive">{state.errors.prompt}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <GenerateButton />
          </CardFooter>
        </form>
      </Card>

      <Card>
        <form action={createRaffleAction}>
          <CardHeader>
            <CardTitle className="font-headline">2. Review and Create</CardTitle>
            <CardDescription>
              Review the AI-generated details below or fill them in manually.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Raffle Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Ultimate Gamer's PS5 Bundle"
                defaultValue={state.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="A short, catchy description of your prize."
                defaultValue={state.description}
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                name="terms"
                placeholder="e.g., Winner must claim within 7 days. UK only."
                defaultValue={state.terms}
                rows={3}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
             <Submit text="Create Raffle" loadingText="Creating..." />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
