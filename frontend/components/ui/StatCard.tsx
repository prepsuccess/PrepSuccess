import { LineIcon, type LineIconName } from "@/components/ui/LineIcon";

/** One headline number. Pass `value={null}` while there's no data yet. */
export function StatCard({
  label,
  value,
  icon,
  note,
}: {
  label: string;
  value: string | number | null;
  icon: LineIconName;
  note?: string;
}) {
  return (
    <div className="card flex flex-col gap-5 p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-heading text-[13px] font-medium">{label}</span>
        <LineIcon name={icon} className="text-text-dim h-4 w-4" />
      </div>
      <p className="text-heading text-[40px] leading-none font-semibold tracking-[-0.04em] tabular-nums">
        {value ?? <span className="text-text-dim">—</span>}
      </p>
      {note ? <p className="text-text-dim text-[12px]">{note}</p> : null}
    </div>
  );
}
