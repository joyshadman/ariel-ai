"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/Button";
import { Icon, type IconName } from "@/components/Icon";
import { Reveal } from "@/components/Reveal";
import { useNavigation } from "@/components/navigation";

const values: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "key",
    title: "Own your stack",
    body: "Your key, your provider, your bill. Ariel stays a thin, honest layer on top of tools you already chose.",
  },
  {
    icon: "brain",
    title: "Think in context",
    body: "Conversations keep their thread across models, so switching never means starting over.",
  },
  {
    icon: "shield",
    title: "Quiet by default",
    body: "No trackers, no training on your words, no growth loops. Just a calm place to think.",
  },
];

export function About() {
  const { navigate } = useNavigation();

  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-[1200px] px-5 pb-8 pt-16 text-center min-[700px]:px-8 min-[700px]:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[.18em] text-muted">
          <Icon name="spark" size={14} className="text-coral" />
          Our story
        </span>
        <h1 className="mx-auto mt-6 max-w-[760px] font-display text-[43px] leading-[1.05] tracking-[-.03em] text-ink min-[700px]:text-[60px]">
          We built the calm room for a very loud{" "}
          <em className="italic text-coral">conversation</em>
        </h1>
        <p className="mx-auto mt-6 max-w-[540px] text-[16px] leading-8 text-muted">
          Ariel started as a single question: what if chatting with AI felt less
          like juggling tabs and more like sitting down with a good notebook?
        </p>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 py-16 min-[700px]:px-8">
        <div className="grid items-center gap-14 min-[900px]:grid-cols-[1.05fr_.95fr]">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-muted">
              Manifesto
            </p>
            <h2 className="mt-4 max-w-[520px] font-display text-[34px] leading-tight tracking-[-.025em] text-ink min-[700px]:text-[46px]">
              Tools should recede. Thinking should stay.
            </h2>
            <div className="mt-6 flex max-w-[520px] flex-col gap-4 text-[15px] leading-8 text-muted">
              <p>
                Every AI product promises more — more models, more panels, more
                notifications. We think the best interface is the one you forget
                you are using.
              </p>
              <p>
                Ariel brings your providers together, keeps the thread, and then
                gets out of the way. No upsells buried in the reply, no inference
                marked up on top of the key you already pay for.
              </p>
              <p>
                It is a small, deliberate product for people who would rather own
                their tools than rent their attention.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative mx-auto grid aspect-square w-full max-w-[440px] place-items-center">
              <div className="absolute h-[92%] w-[92%] rounded-full border border-line" />
              <div className="absolute h-[72%] w-[72%] rounded-full border border-line" />
              <div className="absolute h-[52%] w-[52%] rounded-full border border-coral/30" />
              <motion.div
                className="absolute h-[84%] w-[40%] rounded-full border border-dashed border-coral/40"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute h-[60%] w-[86%] rotate-[24deg] rounded-full border border-lavender" />
              <div className="absolute h-[60%] w-[86%] -rotate-[24deg] rounded-full border border-lavender" />
              <span className="relative grid h-[34%] w-[34%] place-items-center rounded-full bg-coral text-white shadow-[0_25px_65px_rgba(237,116,94,.35)]">
                <Icon name="spark" size={38} />
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 py-12 min-[700px]:px-8">
        <div className="grid gap-5 min-[700px]:grid-cols-3">
          {values.map((value, index) => (
            <Reveal key={value.title} delay={index * 0.08}>
              <div className="flex h-full flex-col rounded-[22px] border border-line bg-white p-8 transition-shadow duration-300 hover:shadow-[0_25px_65px_rgba(63,48,43,.12)]">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-coral-soft text-coral-dark">
                  <Icon name={value.icon} size={24} />
                </span>
                <h3 className="mt-6 font-display text-[24px] tracking-[-.02em] text-ink">
                  {value.title}
                </h3>
                <p className="mt-3 text-[14px] leading-7 text-muted">
                  {value.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-5 py-14 min-[700px]:px-8">
        <Reveal>
          <div className="flex flex-col items-center gap-6 rounded-[28px] bg-ink px-6 py-16 text-center text-white min-[700px]:px-16">
            <h2 className="max-w-[560px] font-display text-[34px] leading-tight tracking-[-.025em] min-[700px]:text-[46px]">
              Come think with us
            </h2>
            <p className="max-w-[440px] text-[15px] leading-8 text-ink-mute">
              Bring a key, bring a question. Ariel is ready whenever you are.
            </p>
            <Button kind="primary" onClick={() => navigate("chat")}>
              Start chatting
              <Icon name="arrow" size={16} />
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
