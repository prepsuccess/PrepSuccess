import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryState, type QueryLike } from "./QueryState";

const loading: QueryLike<string[]> = { isLoading: true, isError: false };

function renderState(query: QueryLike<string[]>) {
  return render(
    <QueryState
      query={query}
      skeleton={<div data-testid="skeleton" />}
      empty={<p>Nothing yet</p>}
      isEmpty={(items) => items.length === 0}
    >
      {(items) => (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </QueryState>,
  );
}

describe("QueryState", () => {
  afterEach(() => vi.useRealTimers());

  it("waits briefly before showing the skeleton, so fast loads don't flash", () => {
    vi.useFakeTimers();
    renderState(loading);

    // Announced to screen readers straight away…
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    // …but the skeleton only appears after the delay.
    expect(screen.queryByTestId("skeleton")).toBeNull();
    act(() => vi.advanceTimersByTime(200));
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });

  it("renders the data", () => {
    renderState({ isLoading: false, isError: false, data: ["HTML", "CSS"] });
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(["HTML", "CSS"]);
  });

  it("renders the empty state", () => {
    renderState({ isLoading: false, isError: false, data: [] });
    expect(screen.getByText("Nothing yet")).toBeInTheDocument();
  });

  it("shows the error with its code and retries", async () => {
    const refetch = vi.fn();
    renderState({
      isLoading: false,
      isError: true,
      error: { status: 503, code: "AI_UNAVAILABLE", message: "The AI is busy.", details: [] },
      refetch,
    });

    expect(screen.getByRole("alert")).toHaveTextContent("The AI is busy.");
    expect(screen.getByText("AI_UNAVAILABLE")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refetch).toHaveBeenCalled();
  });
});
