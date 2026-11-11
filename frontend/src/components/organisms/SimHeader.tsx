import { steps } from "@/data/simulator";

interface Props {
  step: number;
}

/* Title and guidance of the current simulator step */
export default function SimHeader({ step }: Props) {
  return (
  <header className="mb-30 [&_h3]:text-[3.4rem] [&_h3]:font-[320] [&_h3]:tracking-[-0.03em] [&_h3]:leading-[1.05] [&_h3]:mt-8 [&_h3]:mx-0 [&_h3]:mb-12 md:[&_h3]:text-[4.6rem]">
    <p className="text-blue text-[1.3rem] uppercase">
      Langkah {step + 1} dari {steps.length}
    </p>
    <h3>{steps[step].title}</h3>
    <p className="text-[1.7rem] leading-[1.5] max-w-720 md:text-[1.9rem]">{steps[step].guide}</p>
    {step < 3 && (
      <p className="text-[1.3rem] mt-10 opacity-[0.6] fine-hover:hidden">
        Di ponsel, ketuk kartu untuk menaruhnya.
      </p>
    )}
  </header>
  );
}
