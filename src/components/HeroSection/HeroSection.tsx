import { GlassBlock } from "@/components";
import { Badge } from "@studio_b04/ds/uikit";

export default function HeroSection() {
  return (
    <div className="relative">
      <GlassBlock as="section" className="inline-full mbs-5xl! shadow-[0_1rem_1rem_-1rem_rgba(0,0,0,0.35)] px-5xl! pbs-5xl! xl:pbs-x!">
        <div className="absolute -z-1 inset-none rounded-inherit bg-linear-135 from-(--ds-bg-brand-solid) to-(--ds-bg-alt-solid) opacity-10" />

        <div className="flex flex-col @xl/glass-block:flex-row gap-3xl items-center justify-around">
          <div className="flex flex-col gap-3xl items-center xl:items-start justify-around max-w-xl">
            <h1 tabIndex={-1} className="font-extrabold leading-[1.15] text-title-md text-center xl:text-start @3xl/glass-block:text-title-lg">
              <span className="block">
                <span className="font-extrabold text-secondary">StudioB04</span> est née d'une idée simple :
              </span>
              <span className="block">vous accompagner dans tous vos projets de communication.</span>
            </h1>
            <p className="text-xl text-tertiary text-center xl:text-start">
              Depuis 2009, l’agence s’est développée en aidant les PME et les ETI à se démarquer sur leur marché, en physique et en ligne avec une promesse : Un
              interlocuteur unique pour vous aider de A à Z dans toutes vos démarches.
            </p>

            <Badge variant="alt" size="lg" label="#NoBullshit" />
          </div>

          <img src="/images/moi.png" alt="" className="translate-y-lg g:shrink-0" />
        </div>
      </GlassBlock>

      <img className="absolute -z-1 inline-[20rem] inset-bs-[10rem] inset-s-[-15rem] -rotate-5 shadow-lg select-none" />
    </div>
  );
}
