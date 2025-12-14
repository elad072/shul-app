import clsx from "clsx";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "blue" | "green" | "orange" | "gray";
};

const variants = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-green-50 text-green-700",
  orange: "bg-orange-50 text-orange-700",
  gray: "bg-slate-100 text-slate-700",
};

export default function Badge({
  children,
  variant = "gray",
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "px-2 py-0.5 rounded-full text-xs font-bold",
        variants[variant]
      )}
    >
      {children}
    </span>
  );
}
