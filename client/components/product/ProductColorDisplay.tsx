type ProductColorDisplayProps = {
  label: string;
};

export function ProductColorDisplay({ label }: ProductColorDisplayProps) {
  return (
    <div className="mt-5">
      <p className="text-body text-neutral-500">Colour</p>
      <div className="text-ui mt-2 inline-flex min-h-10 min-w-24 items-center justify-center border border-ink bg-paper px-5 py-2 uppercase tracking-[0.08em] text-ink">
        {label}
      </div>
    </div>
  );
}
