"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Button } from "@/components/Button";
import { Icon, type IconName } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { fadeUp, staggerParent } from "@/components/anim";
import { useNavigation } from "@/components/navigation";
import { useMounted } from "@/components/use-mounted";

const trust: string[] = [
  "No card required",
  "Keys encrypted at rest",
  "Your data stays yours",
];

const models = ["OpenAI", "Anthropic", "Gemini", "Mistral"];

const features: {
  eyebrow: string;
  title: string;
  body: string;
  icon: IconName;
}[] = [
  {
    eyebrow: "Your key",
    title: "Bring your own key",
    body: "Paste a key once and Ariel talks straight to your provider. No markup, no middleman, no surprise invoice.",
    icon: "key",
  },
  {
    eyebrow: "Your choice",
    title: "Choose how Ariel thinks",
    body: "Switch between fast, balanced and deep models mid-conversation without losing the thread.",
    icon: "brain",
  },
];

export function Home() {
  const { navigate } = useNavigation();
  const mounted = useMounted();

  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-[1200px] px-5 pb-10 pt-10 min-[700px]:px-8 min-[700px]:pt-16">
        <div className="grid items-center gap-16 min-[900px]:grid-cols-[1.03fr_.97fr] min-[900px]:gap-10">
          <motion.div
            variants={staggerParent}
            initial="hidden"
            animate={mounted ? "visible" : "hidden"}
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[.18em] text-muted"
            >
              <Icon name="spark" size={14} className="text-coral" />
              Bring your own key
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="mt-6 max-w-[560px] font-display text-[46px] leading-[1.03] tracking-[-.03em] text-ink min-[700px]:text-[66px]"
            >
              Think <em className="italic text-coral">better</em> with every
              model you trust
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-[480px] text-[16px] leading-8 text-muted min-[700px]:text-[17px]"
            >
              Ariel gathers OpenAI, Anthropic, Gemini and Mistral under one calm
              interface. Add your own key, pick a model, and start thinking —
              nothing resold, nothing marked up.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Button kind="primary" onClick={() => navigate("chat")}>
                Start chatting
                <Icon name="arrow" size={16} />
              </Button>
              <Button kind="secondary" onClick={() => navigate("pricing")}>
                See pricing
              </Button>
            </motion.div>

            <motion.ul
              variants={fadeUp}
              className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3"
            >
              {trust.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-[13px] text-muted"
                >
                  <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-green text-green-ink">
                    <Icon name="check" size={11} />
                  </span>
                  {item}
                </li>
              ))}
            </motion.ul>
          </motion.div>

          <HeroVisual />
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 py-14 min-[700px]:px-8">
        <Reveal className="flex flex-col items-center gap-7 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-muted">
            One home for the models you trust
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {models.map((model) => (
              <span
                key={model}
                className="rounded-full border border-line bg-white px-6 py-3 text-[14px] font-medium text-ink"
              >
                {model}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 py-10 min-[700px]:px-8">
        <div className="grid gap-5 min-[900px]:grid-cols-[1.2fr_.8fr_.8fr]">
          <Reveal className="min-[900px]:col-span-1">
            <FeatureCard feature={features[0]}>
              <div className="mt-6 rounded-[15px] border border-line bg-panel-3 p-4">
                <div className="flex items-center gap-2 text-[12px] font-medium text-muted">
                  <Icon name="key" size={14} />
                  Provider key
                </div>
                <div className="mt-3 rounded-[11px] border border-line bg-white px-4 py-3 font-sans text-[14px] tracking-[.08em] text-ink">
                  sk-••••••••••••••d01a
                </div>
                <div className="mt-3 flex items-center gap-2 text-[12px] text-green-ink">
                  <span className="h-2 w-2 rounded-full bg-green-ink" />
                  Encrypted with AES-256-GCM
                </div>
              </div>
            </FeatureCard>
          </Reveal>

          <Reveal delay={0.08}>
            <FeatureCard feature={features[1]}>
              <div className="mt-6 flex items-center">
                {["bg-coral", "bg-lavender", "bg-green", "bg-panel-4"].map(
                  (tone, index) => (
                    <span
                      key={tone}
                      className={`grid h-12 w-12 place-items-center rounded-full border-2 border-white ${tone} ${
                        index === 0 ? "" : "-ml-3"
                      }`}
                    >
                      <Icon
                        name={index % 2 === 0 ? "brain" : "spark"}
                        size={18}
                        className="text-ink"
                      />
                    </span>
                  ),
                )}
              </div>
            </FeatureCard>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="flex h-full min-h-[340px] flex-col rounded-[22px] bg-ink p-8 text-white">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-coral">
                <Icon name="shield" size={24} />
              </span>
              <h3 className="mt-6 font-display text-[26px] leading-tight tracking-[-.02em]">
                Private from the start
              </h3>
              <p className="mt-3 text-[14px] leading-7 text-ink-soft">
                Your prompts travel only between you and the provider you picked.
                Ariel never sees your key in the clear and never trains on your
                conversations.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 py-14 min-[700px]:px-8">
        <Reveal>
          <div className="flex flex-col items-center gap-6 rounded-[28px] bg-coral-soft px-6 py-16 text-center min-[700px]:px-16">
            <h2 className="max-w-[560px] font-display text-[34px] leading-tight tracking-[-.025em] text-ink min-[700px]:text-[46px]">
              A calmer way to work with AI
            </h2>
            <p className="max-w-[460px] text-[16px] leading-8 text-muted">
              Keep the models you love, drop the tab-hoarding. Ariel gives every
              conversation a quiet, consistent home.
            </p>
            <Button kind="primary" onClick={() => navigate("chat")}>
              Open Ariel
              <Icon name="arrow" size={16} />
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function FeatureCard({
  feature,
  children,
}: {
  feature: { eyebrow: string; title: string; body: string; icon: IconName };
  children?: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-[340px] flex-col rounded-[22px] border border-line bg-white p-8 transition-shadow duration-300 hover:shadow-[0_25px_65px_rgba(63,48,43,.12)]">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-coral-soft text-coral-dark">
        <Icon name={feature.icon} size={24} />
      </span>
      <h3 className="mt-6 font-display text-[26px] leading-tight tracking-[-.02em] text-ink">
        {feature.title}
      </h3>
      <p className="mt-3 text-[14px] leading-7 text-muted">{feature.body}</p>
      {children}
    </div>
  );
}

function HeroVisual() {
  const mounted = useMounted();

  return (
    <div className="relative mx-auto grid aspect-square w-full max-w-[520px] grid-cols-1 place-items-center">
      <div className="absolute h-[88%] w-[88%] rounded-full border border-line" />
      <div className="absolute h-[62%] w-[62%] rounded-full border border-line" />
      <motion.div
        className="absolute h-[74%] w-[74%] rounded-full border border-dashed border-coral/50"
        initial={{ rotate: 0 }}
        animate={mounted ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />
      <span className="absolute left-1/2 top-[6%] h-3 w-3 -translate-x-1/2 rounded-full bg-coral" />
      <span className="absolute bottom-[13%] right-[16%] h-2.5 w-2.5 rounded-full bg-lavender" />

      <motion.div
        className="relative z-10 w-[300px] max-w-full -rotate-2 rounded-[24px] border border-line bg-white p-5 shadow-[0_25px_65px_rgba(63,48,43,.16)]"
        initial={{ y: 0 }}
        animate={mounted ? { y: [0, -12, 0] } : { y: 0 }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-coral text-white">
            <Icon name="spark" size={18} />
          </span>
          <div className="leading-tight">
            <p className="text-[14px] font-medium text-ink">Ariel</p>
            <p className="text-[12px] text-muted">GPT-4.1 · your key</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["Summarise this", "Write a tagline", "Explain simply"].map((chip) => (
            <span
              key={chip}
              className="rounded-full bg-panel-3 px-3 py-1.5 text-[12px] text-muted"
            >
              {chip}
            </span>
          ))}
        </div>

        <p className="mt-4 text-[13px] leading-6 text-ink">
          Here’s a calmer way to think it through — I’ll keep it short and
          useful.
        </p>

        <div className="mt-4 flex items-center gap-2 rounded-[13px] border border-line bg-panel-3 px-3 py-2.5">
          <span className="flex-1 text-[13px] text-muted">Ask anything…</span>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-white">
            <Icon name="send" size={15} />
          </span>
        </div>
      </motion.div>

      <motion.div
        className="absolute left-0 top-[16%] hidden items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-[12px] text-ink shadow-[0_18px_40px_rgba(63,48,43,.12)] min-[700px]:flex"
        initial={{ y: 0 }}
        animate={mounted ? { y: [0, -10, 0] } : { y: 0 }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.6,
        }}
      >
        <Icon name="shield" size={15} className="text-coral" />
        Key encrypted
      </motion.div>

      <motion.div
        className="absolute bottom-[14%] right-0 hidden items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-[12px] text-ink shadow-[0_18px_40px_rgba(63,48,43,.12)] min-[700px]:flex"
        initial={{ y: 0 }}
        animate={mounted ? { y: [0, -10, 0] } : { y: 0 }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.4,
        }}
      >
        <Icon name="brain" size={15} className="text-coral" />
        Deep think ready
      </motion.div>
    </div>
  );
}
