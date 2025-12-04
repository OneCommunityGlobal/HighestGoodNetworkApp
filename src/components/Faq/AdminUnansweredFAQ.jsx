import { useEffect, useState } from "react";
import {
  getUnansweredFAQs,
  answerUnansweredFAQ,
  deleteUnansweredFAQ
} from "./api";
import { Button } from "reactstrap";
import { toast } from "react-toastify";

function AdminUnansweredFAQ() {
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
    <div>
      <h2>Unanswered Questions (Admin)</h2>

      {list.map((item) => (
        <div key={item._id} style={{ marginBottom: 20, borderBottom: "1px solid #ccc" }}>
          <p><strong>Q:</strong> {item.question}</p>

          <textarea
            rows={3}
            placeholder="Write answer here..."
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          />

          <Button color="success" onClick={() => handleAnswer(item._id)}>
            Submit Answer
          </Button>{" "}

          <Button color="danger" onClick={() => handleDelete(item._id)}>
            Delete
          </Button>
        </div>
      ))}
    </div>
  );
}

export default AdminUnansweredFAQ;
