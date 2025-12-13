import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import ActivityFeedbackModal from "./ActivityFeedbackModal";

const mockStore = configureStore([]);

function renderWithStore(ui, storeState = { theme: { darkMode: false } }) {
  const store = mockStore(storeState);
  return render(<Provider store={store}>{ui}</Provider>);
}

describe("ActivityFeedbackModal", () => {
  test("renders modal with title", () => {
    renderWithStore(<ActivityFeedbackModal onClose={() => { }} />);
    expect(screen.getByText("Activity Feedback")).toBeInTheDocument();
  });

  test("shows validation error if submitting without rating", () => {
    renderWithStore(<ActivityFeedbackModal onClose={() => { }} />);

    fireEvent.click(screen.getByText("Submit Feedback"));
    expect(screen.getByText("Please select a rating.")).toBeInTheDocument();
  });

  test("selects a star rating when clicked", () => {
    renderWithStore(<ActivityFeedbackModal onClose={() => { }} />);

    const stars = screen.getAllByRole("img");
    fireEvent.click(stars[2]);
    expect(screen.queryByText("Please select a rating.")).not.toBeInTheDocument();
  });

  test("shows success message after submit", () => {
    jest.useFakeTimers();

    renderWithStore(<ActivityFeedbackModal onClose={() => { }} />);

    const stars = screen.getAllByRole("img");
    fireEvent.click(stars[4]);

    fireEvent.click(screen.getByText("Submit Feedback"));

    jest.advanceTimersByTime(900);

    expect(screen.getByText("Feedback submitted!")).toBeInTheDocument();
  });

  test("calls onClose when clicking overlay", () => {
    const onCloseMock = jest.fn();

    renderWithStore(<ActivityFeedbackModal onClose={onCloseMock} />);

    const overlay = screen.getByTestId("overlay-test");
    fireEvent.click(overlay);

    expect(onCloseMock).toHaveBeenCalled();
  });
});
