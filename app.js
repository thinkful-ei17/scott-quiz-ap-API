'use strict';
/* global $ */

const TOP_LEVEL_COMPONENTS = [
  'js-intro', 'js-question', 'js-question-feedback', 'js-outro', 'js-quiz-status'
];

const QUESTIONS = [
  // {
  //   text: 'Capital of England?',
  //   answers: ['London', 'Paris', 'Rome', 'Washington DC'],
  //   correctAnswer: 'London'
  // },
  // {
  //   text: 'How many kilometers in one mile?',
  //   answers: ['0.6', '1.2', '1.6', '1.8'],
  //   correctAnswer: '1.6'
  // }
];

const getInitialStore = function() {
  return {
    page: 'intro',
    currentQuestionIndex: null,
    userAnswers: [],
    feedback: null
  };
};

let store = getInitialStore();

// Make API Call Functions
//=========================

let SESSION_TOKEN;

function getSessionToken(){
  // {response_code: 0, response_message: "Token Generated Successfully!", token: "16f0d44d6d4be14927278b2700b7e75261ef6c22cb0741488415656ec1ba886b"}
  $.getJSON('https://opentdb.com/api_token.php?command=request', function(data){
    SESSION_TOKEN = data.token;
    return SESSION_TOKEN;
  });
}

getSessionToken();

function getQuestion(amt){
  $.getJSON(`https://opentdb.com/api.php?amount=${amt}&type=multiple&${SESSION_TOKEN}`, questionArray);
}

const questionArray = function(data){
  console.log('question array ran', data.results);
  data.results.forEach(function(result){
    let questionData = result;
    let answersArray = [...questionData.incorrect_answers];
    const randomIndex = Math.floor(Math.random() * (questionData.incorrect_answers.length + 1));
    answersArray.splice(randomIndex, 0, questionData.correct_answer);
    const question = {
      text: questionData.question,
      difficulty: questionData.difficulty,
      wrongAnswers: questionData.incorrect_answers,
      correctAnswer: questionData.correct_answer,
      answers: answersArray
    };
    console.log('the answers are', question.answers);
    console.log('the question parts are', question);
    QUESTIONS.push(question);
  });
};

getQuestion(5);


// // Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
//   // Math.floor(Math.random())
//   // category: questionData.category,
//   ```const createQuestion = function(question) {
//     // Copy incorrect_answers array into new all answers array
//     const answers = [ ...question.incorrect_answers ];
    
//     // Pick random index from total answers length (incorrect_answers length + 1 correct_answer)
//     const randomIndex = Math.floor(Math.random() * (question.incorrect_answers.length + 1));
    
//     // Insert correct answer at random place
//     answers.splice(randomIndex, 0, question.correct_answer);
    
//     return {
//       text: question.question,
//       correctAnswer: question.correct_answer,
//       answers
//     };
//   };```
// };
 
// let answerArray = function (wrongAnswers, correctAnswer){
//   const randomIndex = Math.floor(Math.random() * (questionData.incorrect_answers.length + 1));
//   const answers =  answers.splice(randomIndex, 0, question.correct_answer);
// };
// category:"Mythology"
// correct_answer:"Nidhogg"
// difficulty:"hard"
// incorrect_answers:Array(3)
//                    0:"Bragi"
//                    1:"Odin"
//                    2:"Ymir"
//                    length:3
// question:"In Norse mythology, what is the name of the serpent which eats the roots of the ash tree Yggdrasil?"
// type:"multiple"


  
// }


function turnQuestionIntoQuestionForm(){}

// Helper functions

// ===============
const hideAll = function() {
  TOP_LEVEL_COMPONENTS.forEach(component => $(`.${component}`).hide());
};

const getScore = function() {
  return store.userAnswers.reduce((accumulator, userAnswer, index) => {
    const question = getQuestion(index);

    if (question.correctAnswer === userAnswer) {
      return accumulator + 1;
    } else {
      return accumulator;
    }
  }, 0);
};

const getProgress = function() {
  return {
    current: store.currentQuestionIndex + 1,
    total: QUESTIONS.length
  };
};

const getCurrentQuestion = function() {
  return QUESTIONS[store.currentQuestionIndex];
};

// const getQuestion = function(index) {
//   return QUESTIONS[index];
// };

// HTML generator functions
// ========================
const generateAnswerItemHtml = function(answer) {
  return `
    <li class="answer-item">
      <input type="radio" name="answers" value="${answer}" />
      <span class="answer-text">${answer}</span>
    </li>
  `;
};

const generateQuestionHtml = function(question) {
  const answers = question.answers
    .map((answer, index) => generateAnswerItemHtml(answer, index))
    .join('');

  return `
    <form>
      <fieldset>
        <legend class="question-text">${question.text}</legend>
          ${answers}
          <button type="submit">Submit</button>
      </fieldset>
    </form>
  `;
};

const generateFeedbackHtml = function(feedback) {
  return `
    <p>${feedback}</p>
    <button class="continue js-continue">Continue</button>
  `;
};

// Render function - uses `store` object to construct entire page every time it's run
// ===============
const render = function() {
  let html;
  hideAll();

  const question = getCurrentQuestion();
  const { feedback } = store;
  const { current, total } = getProgress();

  $('.js-score').html(`<span>Score: ${getScore()}</span>`);
  $('.js-progress').html(`<span>Question ${current} of ${total}`);

  switch (store.page) {
  case 'intro':
    $('.js-intro').show();
    break;

  case 'question':
    html = generateQuestionHtml(question);
    $('.js-question').html(html);
    $('.js-question').show();
    $('.quiz-status').show();
    break;

  case 'answer':
    html = generateFeedbackHtml(feedback);
    $('.js-question-feedback').html(html);
    $('.js-question-feedback').show();
    $('.quiz-status').show();
    break;

  case 'outro':
    $('.js-outro').show();
    $('.quiz-status').show();
    break;

  default:
    return;
  }
};

// Event handler functions
// =======================
const handleStartQuiz = function() {
  store = getInitialStore();
  store.page = 'question';
  store.currentQuestionIndex = 0;
  render();
};

const handleSubmitAnswer = function(e) {
  e.preventDefault();
  const question = getCurrentQuestion();
  const selected = $('input:checked').val();
  store.userAnswers.push(selected);

  if (selected === question.correctAnswer) {
    store.feedback = 'You got it!';
  } else {
    store.feedback = `Too bad! The correct answer was: ${question.correctAnswer}`;
  }

  store.page = 'answer';
  render();
};

const handleNextQuestion = function() {
  if (store.currentQuestionIndex === QUESTIONS.length - 1) {
    store.page = 'outro';
    render();
    return;
  }

  store.currentQuestionIndex++;
  store.page = 'question';
  render();
};

// On DOM Ready, run render() and add event listeners
$(() => {
  render();

  $('.js-intro, .js-outro').on('click', '.js-start', handleStartQuiz);
  $('.js-question').on('submit', handleSubmitAnswer);
  $('.js-question-feedback').on('click', '.js-continue', handleNextQuestion);
});
