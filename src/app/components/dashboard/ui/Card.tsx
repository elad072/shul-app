import clsx from "clsx";

type CardProps = {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export default function Card({
  title,
  icon,
  children,
  className,
}: CardProps) {
  return (
    <section
      className={clsx(
        "bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4",
        className
      )}
    >
      {title && (
        <header className="flex items-center gap-2 text-slate-800">
          {icon}
          <h2 className="text-lg font-bold">{title}</h2>
        </header>
      )}
      <div>{children}</div>
    </section>
  );
}
