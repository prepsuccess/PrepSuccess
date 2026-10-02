import { LineIcon } from "@/components/ui/LineIcon";
import { marksheet } from "@/lib/content";
import { cn } from "@/lib/utils/cn";

/**
 * The hero's sample readiness report, set like an Indian university
 * marksheet: the format every student already knows how to read. Clearly
 * labelled as a sample — the numbers are illustrative, not a real student.
 */
export function Marksheet({ className }: { className?: string }) {
  const { student, subjects, passMark, next } = marksheet;
  const revise = subjects.filter((subject) => subject.marks < passMark);
  const readiness = Math.round(subjects.reduce((sum, s) => sum + s.marks, 0) / subjects.length);

  return (
    <figure className={cn("relative", className)}>
      {/* Double rule, like a printed certificate: outer frame + inner hairline. */}
      <div className="border-heading/70 shadow-window rounded-[4px] border bg-white p-1.5 lg:rotate-[0.6deg]">
        <div className="border-heading/20 rounded-[2px] border px-5 py-6 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-heading text-[15px] font-semibold tracking-[-0.01em]">
                PrepSuccess
              </p>
              <p className="text-text mt-0.5 font-mono text-[12px] tracking-[0.08em] uppercase">
                Readiness marksheet
              </p>
            </div>
            <span className="border-border-strong text-text rounded-full border px-2.5 py-1 text-[12px]">
              Sample report
            </span>
          </div>

          <dl className="border-border mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-y py-4 text-[13px] sm:grid-cols-3">
            <div>
              <dt className="text-text">Name</dt>
              <dd className="text-heading mt-0.5 font-medium">{student.name}</dd>
            </div>
            <div>
              <dt className="text-text">Course</dt>
              <dd className="text-heading mt-0.5 font-medium">{student.course}</dd>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <dt className="text-text">Target role</dt>
              <dd className="text-heading mt-0.5 font-medium">{student.target}</dd>
            </div>
          </dl>

          <table className="mt-4 w-full text-[14px]">
            <caption className="sr-only">
              Sample skill check results, marks out of 100, pass mark {passMark}
            </caption>
            <thead>
              <tr className="text-text text-left text-[12px]">
                <th scope="col" className="pb-2 font-normal">
                  Subject
                </th>
                <th scope="col" className="pb-2 text-right font-normal">
                  Marks <span className="sr-only">out of 100</span>
                </th>
                <th scope="col" className="pb-2 pl-6 text-right font-normal">
                  Result
                </th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, i) => {
                const passed = subject.marks >= passMark;
                return (
                  <tr key={subject.name} className="border-border border-t border-dashed">
                    <th scope="row" className="text-heading py-2.5 text-left font-normal">
                      {subject.name}
                    </th>
                    <td className="text-heading py-2.5 text-right font-mono tabular-nums">
                      {subject.marks}
                    </td>
                    <td className="py-2.5 pl-6 text-right">
                      {passed ? (
                        <span className="text-text inline-flex items-center gap-1.5 text-[13px]">
                          <LineIcon name="check" className="text-success h-3.5 w-3.5" />
                          Pass
                        </span>
                      ) : (
                        <span
                          className="border-danger text-danger animate-stamp inline-block rounded-[3px] border-[1.5px] px-2 py-0.5 font-mono text-[12px] font-semibold tracking-[0.1em] uppercase [--stamp-rotate:-8deg] motion-reduce:-rotate-[8deg] motion-reduce:animate-none"
                          style={{ animationDelay: `${0.9 + i * 0.05}s` }}
                        >
                          Revise
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="border-heading/70 mt-4 flex items-end justify-between gap-4 border-t pt-4">
            <p className="text-text text-[12px]">
              Pass mark {passMark}
              <br />
              Marks out of 100
            </p>
            <p className="text-right">
              <span className="text-text block text-[12px]">Readiness</span>
              <span className="text-heading font-mono text-[28px] leading-none font-semibold tabular-nums">
                {readiness}
              </span>
              <span className="text-text font-mono text-[14px]"> / 100</span>
            </p>
          </div>

          <p className="bg-surface-3 text-heading mt-5 flex items-start gap-2 rounded-[6px] px-3 py-2.5 text-[13px]">
            <LineIcon name="send" className="text-brand-ink mt-0.5 h-4 w-4 flex-none" />
            <span>
              <span className="text-text">Study next: </span>
              {next}
            </span>
          </p>
        </div>
      </div>
      <figcaption className="sr-only">
        A sample PrepSuccess readiness marksheet for an illustrative student, with readiness{" "}
        {readiness} out of 100.{" "}
        {revise
          .map(
            (subject) =>
              `${subject.name} scored ${subject.marks}, below the pass mark of ${passMark}, so it is marked for revision.`,
          )
          .join(" ")}
      </figcaption>
    </figure>
  );
}
