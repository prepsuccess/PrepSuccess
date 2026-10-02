import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UsersTable, type AdminUserRow } from "./UsersTable";

// Sample rows for the table's behaviour; the real list comes from the admin API.
const makeUser = (i: number, overrides: Partial<AdminUserRow> = {}): AdminUserRow => ({
  id: `user-${i}`,
  first_name: `Student${String(i).padStart(2, "0")}`,
  last_name: null,
  email: `student${i}@college.edu`,
  role: "student",
  created_at: `2026-09-${String((i % 28) + 1).padStart(2, "0")}T00:00:00.000Z`,
  is_active: true,
  ...overrides,
});

const users = [
  makeUser(1, { first_name: "Zoya", last_name: "Khan", email: "zoya@college.edu", role: "admin" }),
  makeUser(2, {
    first_name: "Aarav",
    last_name: "Shah",
    email: "aarav@college.edu",
    is_active: false,
  }),
  ...Array.from({ length: 12 }, (_, i) => makeUser(i + 3)),
];

const bodyRows = () => within(screen.getAllByRole("rowgroup")[1]!).getAllByRole("row");

describe("UsersTable", () => {
  it("shows an honest empty state when there are no users", () => {
    render(<UsersTable users={[]} />);
    expect(screen.getByText(/No users to show yet/)).toBeInTheDocument();
    expect(screen.getByText("0 rows")).toBeInTheDocument();
  });

  it("paginates 10 rows per page", async () => {
    render(<UsersTable users={users} />);
    expect(bodyRows()).toHaveLength(10);
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(bodyRows()).toHaveLength(4);
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
  });

  it("searches across name and email", async () => {
    render(<UsersTable users={users} />);
    await userEvent.type(screen.getByRole("textbox", { name: /Search name or email/ }), "zoya");
    expect(bodyRows()).toHaveLength(1);
    expect(screen.getByText("1 row")).toBeInTheDocument();

    await userEvent.clear(screen.getByRole("textbox"));
    await userEvent.type(screen.getByRole("textbox"), "nobody-here");
    expect(screen.getByText("No results for “nobody-here”.")).toBeInTheDocument();
  });

  it("sorts by name and announces the order", async () => {
    render(<UsersTable users={users} />);
    const nameButton = screen.getByRole("button", { name: /^Name/ });

    await userEvent.click(nameButton);
    expect(within(bodyRows()[0]!).getByText("Aarav Shah")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );

    await userEvent.click(nameButton);
    expect(within(bodyRows()[0]!).getByText("Zoya Khan")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute(
      "aria-sort",
      "descending",
    );
  });

  it("shows role and status as words, not colour alone", () => {
    render(<UsersTable users={users.slice(0, 2)} />);
    expect(within(bodyRows()[0]!).getByText("admin")).toBeInTheDocument();
    expect(within(bodyRows()[1]!).getByText("Deactivated")).toBeInTheDocument();
  });

  it("copies a user's email from the row menu", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText");
    render(<UsersTable users={users.slice(0, 1)} />);

    await user.click(screen.getByRole("button", { name: "Actions for Zoya Khan" }));
    await user.click(await screen.findByRole("menuitem", { name: "Copy email" }));

    expect(writeText).toHaveBeenCalledWith("zoya@college.edu");
  });

  it("shows skeleton rows while loading", () => {
    render(<UsersTable users={[]} loading />);
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });
});
