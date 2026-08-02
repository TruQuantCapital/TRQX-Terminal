import React from "react";
import MasteryDashboard from "../components/academy/MasteryDashboard";

export default function CandlestickMasteryPage() {
  return (
    <div className="academy-page" style={{ padding: "2rem" }}>
      <MasteryDashboard
        completedLessons={8}
        totalLessons={8}
        quizAverage={91}
        flashcardsReviewed={184}
        masteryScore={94}
        examPassed={false}
      />

      <div
        style={{
          marginTop: "2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: "20px",
        }}
      >
        <div className="academy-card">
          <h2>📚 Review Library</h2>
          <p>Review every candlestick lesson before taking the final exam.</p>
        </div>

        <div className="academy-card">
          <h2>🧠 Pattern Recognition Lab</h2>
          <p>Practice identifying patterns on real charts.</p>
        </div>

        <div className="academy-card">
          <h2>🏆 Final Practical Exam</h2>
          <p>Pass with 80% or higher to unlock certification.</p>
        </div>

        <div className="academy-card">
          <h2>🤖 AI Study Coach</h2>
          <p>Receive personalized recommendations based on your weakest areas.</p>
        </div>
      </div>
    </div>
  );
}