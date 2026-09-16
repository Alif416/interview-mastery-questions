import { Link } from 'react-router-dom';

const GITHUB_URL = 'https://github.com/Alif416/interview-mastery-questions';

export default function Home() {
  return (
    <div className="home">
      <h1>
        Interview Mastery
        <span className="home-subtitle">Coding interview notes, organized</span>
      </h1>

      <p className="home-tagline">
        A structured path through LeetCode patterns and JavaScript fundamentals — built for
        focused review, not endless scrolling.
      </p>

      <div className="home-actions">
        <Link className="primary" to="/leetcode/array-hashing">
          Get Started
        </Link>
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          View on GitHub
        </a>
      </div>

      <div className="home-features">
        <div className="home-feature">
          <div className="icon">🧩</div>
          <h3>14 Patterns</h3>
          <p>Recurring problem-solving patterns that cover the majority of technical interview questions.</p>
        </div>
        <div className="home-feature">
          <div className="icon">⚡</div>
          <h3>Focused Review</h3>
          <p>Each note distills the core idea and the signals that point to it — not just solutions to memorize.</p>
        </div>
        <div className="home-feature">
          <div className="icon">💻</div>
          <h3>JS Fundamentals</h3>
          <p>Core language concepts explained in interview-question form, from hoisting to closures.</p>
        </div>
      </div>
    </div>
  );
}
