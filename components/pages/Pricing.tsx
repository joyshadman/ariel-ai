"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { useNavigation } from "@/components/navigation";

type Billing = "monthly" | "yearly";

interface Plan {
  name: string;
  price: Record<Billing, number>;
  blurb: string;
  features: string[];
  featured?: boolean;
  cta: string;
}

const plans: Plan[] = [
  {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    blurb: "Everything you need to try Ariel with your own key.",
    features: [
      "Bring your own API key",
      "All four providers",
      "Unlimited conversations",
      "Local history",
    ],
    cta: "Start free",
  },
  {
    name: "Premium",
    price: { monthly: 18, yearly: 14 },
    blurb: "For people who live in a chat window all day.",
    features: [
      "Everything in Free",
      "Priority streaming",
      "Cloud-synced history",
      "Custom system prompts",
      "Early access models",
    ],
    featured: true,
    cta: "Go Premium",
  },
  {
    name: "Teams",
    price: { monthly: 32, yearly: 26 },
    blurb: "Shared keys, shared context, one calm workspace.",
    features: [
      "Everything in Premium",
      "Shared prompt library",
      "Role-based access",
      "Usage overview",
    ],
    cta: "Contact us",
  },
];

export function Pricing() {
  const { navigate } = useNavigation();
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-[1200px] px-5 pb-6 pt-16 text-center min-[700px]:px-8 min-[700px]:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[.18em] text-muted">
          <Icon name="card" size={14} className="text-coral" />
          Simple pricing
        </span>
        <h1 className="mx-auto mt-6 max-w-[620px] font-display text-[43px] leading-[1.05] tracking-[-.03em] text-ink min-[700px]:text-[56px]">
          Pay once for the workspace. Bring your own{" "}
          <em className="italic text-coral">intelligence</em>.
        </h1>
        <p className="mx-auto mt-5 max-w-[480px] text-[16px] leading-8 text-muted">
          Ariel never marks up inference. You pay your provider directly — the
          plan only covers the calm, considered surface around it.
        </p>

        <div className="mt-10 flex justify-center">
          <div
            role="group"
            aria-label="Billing period"
            className="relative flex rounded-full border border-line bg-panel-3 p-1"
          >
            {(["monthly", "yearly"] as Billing[]).map((option) => {
              const active = billing === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setBilling(option)}
                  className={`relative z-10 rounded-full px-6 py-2.5 text-[13px] font-medium capitalize transition-colors ${
                    active ? "text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {active ? (
                    <motion.span
                      layoutId="billing-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-white shadow-[0_10px_25px_rgba(63,48,43,.10)]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  {option}
                  {option === "yearly" ? (
                    <span className="ml-2 rounded-full bg-coral-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[.12em] text-coral-dark">
                      -20%
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 py-12 min-[700px]:px-8">
        <div className="grid items-start gap-5 min-[900px]:grid-cols-3">
          {plans.map((plan, index) => (
            <Reveal key={plan.name} delay={index * 0.08}>
              <PriceCard plan={plan} billing={billing} onSelect={navigate} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

function PriceCard({
  plan,
  billing,
  onSelect,
}: {
  plan: Plan;
  billing: Billing;
  onSelect: (page: "signup") => void;
}) {
  const price = plan.price[billing];

  return (
    <div
      className={`relative flex h-full flex-col rounded-[22px] bg-white p-8 transition-shadow duration-300 hover:shadow-[0_25px_65px_rgba(63,48,43,.12)] min-[900px]:-translate-y-3 ${
        plan.featured ? "border-2 border-coral" : "border border-line"
      }`}
    >
      {plan.featured ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-coral px-3 py-1 text-[10px] font-semibold uppercase tracking-[.14em] text-white">
          Most popular
        </span>
      ) : null}

      <h2 className="font-display text-[24px] tracking-[-.02em] text-ink">
        {plan.name}
      </h2>
      <p className="mt-2 min-h-[40px] text-[13px] leading-6 text-muted">
        {plan.blurb}
      </p>

      <div className="mt-6 flex items-end gap-1">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={`${plan.name}-${billing}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="font-display text-[52px] leading-none tracking-[-.03em] text-ink"
          >
            ${price}
          </motion.span>
        </AnimatePresence>
        <span className="pb-1.5 text-[13px] text-muted">
          {price === 0 ? "forever" : "/ month"}
        </span>
      </div>
      {billing === "yearly" && price > 0 ? (
        <p className="mt-1 text-[12px] text-muted">billed yearly</p>
      ) : (
        <p className="mt-1 text-[12px] text-transparent">billed monthly</p>
      )}

      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5 text-[13px] text-ink">
            <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-green text-green-ink">
              <Icon name="check" size={11} />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Button
          kind={plan.featured ? "primary" : "secondary"}
          onClick={() => onSelect("signup")}
          className="w-full"
        >
          {plan.cta}
        </Button>
      </div>
    </div>
  );
}
