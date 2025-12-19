import React from "react";
import { render, fireEvent, screen, act } from "@testing-library/react";
import ActivityFeedbackModal from "./ActivityFeedbackForm";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

const mockStore = configureStore([]);

function renderWithStore(onClose = jest.fn(), darkMode = false) {
  const store = mockStore({
    theme: { darkMode }
  });

  return render(
    <Provider store={store}>
      <ActivityFeedbackModal onClose={onClose} />
    </Provider>
  );
}

jest.useFakeTimers();

describe("ActivityFeedbackModal", () => {
  test("renders modal heading", () => {
    renderWithStore();
    expect(screen.getByText("Activity Feedback")).toBeInTheDocument();
  });

  test("displays error when submitting without rating", () => {
    renderWithStore();

    fireEvent.click(screen.getByText("Submit Feedback"));
    expect(screen.getByText("Please select a rating.")).toBeInTheDocument();
  });

  test("selects a star rating", () => {
    renderWithStore();

    const stars = screen.getAllByRole("button");
    fireEvent.click(stars[2]); // 3 stars
    expect(stars[2]).toBeInTheDocument();
  });

  test("shows character warning after 250 characters", () => {
    renderWithStore();

    const textarea = screen.getByPlaceholderText("Optional: Add your feedback");
    fireEvent.change(textarea, { target: { value: "a".repeat(260) } });

    expect(screen.getByText("260/300")).toBeInTheDocument();
    expect(screen.getByText("260/300")).toHaveClass("charCountWarning");
  });

  test("toggles additional details section", () => {
    renderWithStore();

    fireEvent.click(screen.getByText("Add More Details"));
    expect(
      screen.getByPlaceholderText("Additional optional information...")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Hide Additional Details"));
    expect(
      screen.queryByPlaceholderText("Additional optional information...")
    ).not.toBeInTheDocument();
  });

  test("submits successfully when rating is selected", () => {
    const onClose = jest.fn();
    renderWithStore(onClose);

    const stars = screen.getAllByRole("button");
    fireEvent.click(stars[4]); // select 5 stars

    fireEvent.click(screen.getByText("Submit Feedback"));

    act(() => {
      jest.advanceTimersByTime(900);
    });

    expect(screen.getByText("Feedback submitted!")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    expect(onClose).toHaveBeenCalled();
  });

  test("close button triggers onClose", () => {
    const onClose = jest.fn();
    renderWithStore(onClose);

    fireEvent.click(screen.getByText("✕"));
    expect(onClose).toHaveBeenCalled();
  });

  test("overlay click closes modal", () => {
    const onClose = jest.fn();

    const { container } = renderWithStore(onClose);
    const overlay = container.querySelector(".overlay");

    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });
});
