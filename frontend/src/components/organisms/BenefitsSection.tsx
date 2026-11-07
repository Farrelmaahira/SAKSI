import BenefitCard from "@/components/molecules/BenefitCard";
import { benefits } from "@/data/home";

export default function BenefitsSection() {
  return (
    <section className="benefits" id="manfaat">
      <div className="container">
        <div className="benefits-head" data-reveal>
          <p className="label dark">Manfaat</p>
          <h2 className="display" data-split>Siapa yang terbantu.</h2>
        </div>
        <div className="benefit-grid">
          {benefits.map((benefit) => (
            <BenefitCard key={benefit.title} benefit={benefit} />
          ))}
        </div>
      </div>
    </section>
  );
}
