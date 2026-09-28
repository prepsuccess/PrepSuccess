import { Bar, Chip, Line, MiniWindow } from "@/components/ui/MiniUI";

function SignUp() {
  return (
    <MiniWindow title="Create your account" meta="Step 1" className="h-full">
      <div className="flex flex-col gap-2.5">
        <span className="border-border-strong bg-surface text-heading rounded-[6px] border py-2 text-center text-[12px] font-medium">
          Continue with Google
        </span>
        <span className="text-text-dim text-center text-[12px]">or</span>
        {["Name", "Email", "Password"].map((field) => (
          <span
            key={field}
            className="border-border bg-surface text-text-dim rounded-[6px] border px-3 py-2 text-[12px]"
          >
            {field}
          </span>
        ))}
        <span className="bg-heading rounded-[6px] py-2 text-center text-[12px] font-medium text-white">
          Create account
        </span>
      </div>
    </MiniWindow>
  );
}

function Onboard() {
  return (
    <MiniWindow title="Your profile" meta="From chat" className="h-full">
      <dl className="flex flex-col gap-2 text-[12px]">
        {[
          ["Education", "BCA · final year"],
          ["Target role", "Software engineer"],
          ["Claimed skills", "JS · SQL · HTML/CSS"],
          ["Goal", "Campus placement"],
        ].map(([key, value]) => (
          <div
            key={key}
            className="border-border bg-surface flex justify-between gap-3 rounded-[6px] border px-3 py-2"
          >
            <dt className="text-text-dim">{key}</dt>
            <dd className="text-heading text-right">{value}</dd>
          </div>
        ))}
      </dl>
    </MiniWindow>
  );
}

function Assess() {
  return (
    <MiniWindow title="JavaScript results" meta="Pass mark 40" className="h-full">
      <div className="flex flex-col gap-3">
        <Bar label="Closures" value={82} />
        <Bar label="Promises & async" value={64} />
        <Bar label="Event loop" value={31} />
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Chip status="mastered">Closures</Chip>
          <Chip status="mastered">Async</Chip>
          <Chip status="revision">Event loop</Chip>
        </div>
      </div>
    </MiniWindow>
  );
}

function Improve() {
  return (
    <MiniWindow title="Next steps" meta="Ranked" className="h-full">
      <ol className="flex flex-col gap-2">
        {["Revise the event loop", "Check async JavaScript again", "Start the SQL joins check"].map(
          (step, i) => (
            <li
              key={step}
              className="border-border bg-surface text-heading flex items-center gap-2.5 rounded-[6px] border px-3 py-2 text-[12px]"
            >
              <span
                className={`grid h-5 w-5 flex-none place-items-center rounded-[4px] text-[12px] tabular-nums ${i === 0 ? "bg-heading text-white" : "bg-surface-3 text-text"}`}
              >
                {i + 1}
              </span>
              {step}
            </li>
          ),
        )}
      </ol>
      <div className="mt-3 flex flex-col gap-1.5">
        <Line width="80%" />
        <Line width="50%" />
      </div>
    </MiniWindow>
  );
}

const visuals = [SignUp, Onboard, Assess, Improve];

export function LoopVisual({ index }: { index: number }) {
  const Visual = visuals[index] ?? SignUp;
  return <Visual />;
}
