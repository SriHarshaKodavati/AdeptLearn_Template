// App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const questions = [
  { id: 1, question: "What is 2 + 2?", answer: 4 },
  { id: 2, question: "What is 5 + 3?", answer: 8 },
  { id: 3, question: "What is 10 + 7?", answer: 17 },
  { id: 4, question: "What is 12 + 9?", answer: 21 },
  { id: 5, question: "What is 15 + 6?", answer: 21 },
];



function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [result, setResult] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState('');

  useEffect(() => {
    if (startTime && !quizCompleted) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, quizCompleted]);

  const handleStart = () => {
    setStartTime(Date.now());
  };

  const handleSubmitAnswer = () => {
    if (currentAnswer !== '') {
      setAnswers({ ...answers, [currentQuestion]: parseInt(currentAnswer) });
      setCurrentAnswer('');
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setQuizCompleted(true);
      }
    }
  };

  const handleSubmit = async () => {
    const score = Object.keys(answers).reduce((acc, key) => 
      answers[key] === questions[parseInt(key)].answer ? acc + 1 : acc, 0);
    
    const quizData = {
      time_taken: elapsedTime,
      score: score,
      avg_time_per_question: elapsedTime / questions.length,
      difficulty: 3, 
      attempts: 1 
    };

    try {
      const response = await axios.post('http://localhost:5000/classify_user', quizData);
      setResult(response.data);
    } catch (error) {
      console.error('Error submitting quiz data:', error);
    }
  };

  if (!startTime) {
    return <button onClick={handleStart}>Start Quiz</button>;
  }

  if (quizCompleted) {
    return (
      <div>
        <h2>Quiz Completed!</h2>
        <p>Time taken: {elapsedTime} seconds</p>
        <h3>Summary of Questions and Answers:</h3>
        {questions.map((q, index) => (
          <div key={q.id}>
            <p>Question {index + 1}: {q.question}</p>
            <p>Your answer: {answers[index]} (Correct answer: {q.answer})</p>
          </div>
        ))}
        <button onClick={handleSubmit}>Submit Results</button>
        {result && (
          <div>
            <h3>Your Classification: {result.classification}</h3>
            <p>Based on your performance, you may {result.can_skip ? '' : 'not'} skip the next module.</p>
          </div>
        )}
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div>
      <h2>Question {currentQuestion + 1}</h2>
      <p>{currentQ.question}</p>
      <input 
        type="number" 
        value={currentAnswer} 
        onChange={(e) => setCurrentAnswer(e.target.value)}
      />
      <button onClick={handleSubmitAnswer}>Submit Answer</button>
      <p>Time: {elapsedTime} seconds</p>
    </div>
  );
}

export default App;