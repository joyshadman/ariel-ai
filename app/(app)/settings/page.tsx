import { ApiKeysManager } from "./api-keys-manager";

export const metadata = {
  title: "Settings",
};

export const instant = false;

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Your keys are encrypted at rest and are only ever sent to the provider
        you choose.
      </p>
      <div className="mt-8">
        <ApiKeysManager />
      </div>
    </div>
  );
}