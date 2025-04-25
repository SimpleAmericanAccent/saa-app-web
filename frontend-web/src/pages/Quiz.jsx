const quizData = [
  {
    question: "What is the capital of France?",
    a: "Paris",
    b: "Berlin",
    c: "Madrid",
    d: "Rome",
    correct: "a",
  },
  {
    question: "What is the capital of Germany?",
    a: "Paris",
    b: "Berlin",
    c: "Madrid",
    d: "Rome",
    correct: "b",
  },
];

function QuizContainer(props) {
  console.log(props);
  return (
    <div
      style={{
        width: "500px",
        height: "600px",
        border: "1px solid black",
        margin: "auto",
        // display: "flex",
        // justifyContent: "center",
        // alignItems: "center",
      }}
    >
      {props.children}
    </div>
  );
}

function ProgressBar(props) {
  console.log(props);
  return (
    <div
      style={{
        width: "100%",
        height: "50px",
        border: "1px solid black",
      }}
    >
      Progress here, score here
    </div>
  );
}

function Question() {
  return (
    <div
      style={{
        width: "100%",
        height: "200px",
        border: "1px solid black",
      }}
    >
      Question here
    </div>
  );
}

function Result() {
  return (
    <div
      style={{
        width: "100%",
        height: "50px",
        border: "1px solid black",
      }}
    >
      Result here
    </div>
  );
}

function Answers() {
  return (
    <div
      style={{
        width: "100%",
        height: "300px",
        border: "1px solid black",
      }}
    >
      Answer 1<br />
      Answer 2<br />
      Answer 3<br />
      Answer 4<br />
    </div>
  );
}

function Quiz(props) {
  //   console.log(props);
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        // display: "flex",
        // justifyContent: "center",
        // alignItems: "center",
        border: "1px solid black",
      }}
    >
      <QuizContainer>
        <ProgressBar {...quizData} />
        <Question {...quizData} />
        <Result {...quizData} />
        <Answers {...quizData} />
      </QuizContainer>
    </div>
  );
}

export default Quiz;
