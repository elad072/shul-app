type HeroCardProps = {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
};

export default function HeroCard({
  title,
  subtitle,
  rightSlot,
}: HeroCardProps) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row justify-between gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          {title}
        </h1>
        {subtitle && (
          <p className="text-slate-500 mt-1 text-sm md:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {rightSlot && (
        <div className="shrink-0">
          {rightSlot}
        </div>
      )}
    </section>
  );
}
