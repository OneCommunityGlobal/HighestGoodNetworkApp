import { useEffect, useState } from "react";
import {
  getUnansweredFAQs,
  answerUnansweredFAQ,
  deleteUnansweredFAQ
} from "./api";
import { Button } from "reactstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

function AdminUnansweredFAQ() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [list, setList] = useState([]);
  const [answerText, setAnswerText] = useState("");

  useEffect(() => {
    loadUnanswered();
  }, []);

  const loadUnanswered = async () => {
    try {
      const res = await getUnansweredFAQs();
      setList(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAnswer = async (id) => {
    if (!answerText.trim()) {
      toast.warn("Please enter an answer");
      return;
    }

    try {
      await answerUnansweredFAQ(id, answerText);
      toast.success("FAQ answered and added!");

      setList(list.filter((q) => q._id !== id));
      setAnswerText("");
    } catch (e) {
      console.error(e);
      toast.error("Error answering FAQ");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUnansweredFAQ(id);
      setList(list.filter((q) => q._id !== id));
      toast.success("Deleted");
    } catch (e) {
      toast.error("Error deleting");
    }
  };

  return (
    <div className={darkMode ? "bg-dark text-light p-3" : "p-3"}>
      <h2 className={darkMode ? "text-light" : ""}>Unanswered Questions (Admin)</h2>

      {list.map((item) => (
        <div
          key={item._id}
          className={`p-3 mb-3 ${darkMode
              ? "bg-darkmode-liblack text-light border-secondary"
              : "border-bottom"
            }`}
          style={{ borderBottom: darkMode ? "1px solid #555" : "1px solid #ccc" }}
        >
          <p><strong>Q:</strong> {item.question}</p>

          <textarea
            rows={3}
            placeholder="Write answer here..."
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            className={`w-100 mb-2 p-2 ${darkMode ? "bg-dark text-light border-0" : ""
              }`}
          />

          <Button
            color="success"
            className={darkMode ? "bg-success text-light border-0" : ""}
            onClick={() => handleAnswer(item._id)}
          >
            Submit Answer
          </Button>{" "}

          <Button
            color="danger"
            className={darkMode ? "bg-danger text-light border-0" : ""}
            onClick={() => handleDelete(item._id)}
          >
            Delete
          </Button>
        </div>
      ))}
    </div>
  );
}

export default AdminUnansweredFAQ;
