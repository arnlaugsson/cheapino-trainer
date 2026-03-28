import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Key } from "./Key";

describe("Key", () => {
  it("renders a key with its label", () => {
    render(
      <svg>
        <Key label="A" x={0} y={0} width={50} height={50} state="idle" />
      </svg>,
    );
    expect(screen.getByText("A")).toBeDefined();
  });

  it("applies highlighted state class", () => {
    const { container } = render(
      <svg>
        <Key label="A" x={0} y={0} width={50} height={50} state="highlighted" />
      </svg>,
    );
    const rect = container.querySelector("rect");
    expect(rect?.getAttribute("class")).toContain("highlighted");
  });

  it("applies dimmed state class", () => {
    const { container } = render(
      <svg>
        <Key label="A" x={0} y={0} width={50} height={50} state="dimmed" />
      </svg>,
    );
    const rect = container.querySelector("rect");
    expect(rect?.getAttribute("class")).toContain("dimmed");
  });

  it("applies active (pressed) state class", () => {
    const { container } = render(
      <svg>
        <Key label="A" x={0} y={0} width={50} height={50} state="active" />
      </svg>,
    );
    const rect = container.querySelector("rect");
    expect(rect?.getAttribute("class")).toContain("active");
  });

  it("does not render blank keys", () => {
    const { container } = render(
      <svg>
        <Key label="" x={0} y={0} width={50} height={50} state="idle" blank />
      </svg>,
    );
    expect(container.querySelectorAll("rect")).toHaveLength(0);
  });
});
