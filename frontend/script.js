const start_scr = document.getElementById("start-screen");
const quiz_btn = document.getElementById("quiz-btn");
const restart_btn = document.getElementById("restart-btn");
const quiz_scr = document.getElementById("quiz-screen");
const question_txt = document.getElementById("question-text");
const question_no = document.getElementById("current-qs");
const score = document.getElementById("score");
const final_score = document.getElementById("final-score");
const answers_div = document.getElementById("answers-container");
const bar = document.getElementById("bar-fill");
const result_scr = document.getElementById("result-screen");
const explain_btn = document.getElementById("explain-btn");
const exp_scr = document.getElementById("explain-screen");
const summary_area = document.getElementById("ai-summary");
const back_btn = document.getElementById("back-to-results");
let progress = 0;
// const QUIZ_SIZE = 5;
let choices = [];
function shuffleArray(array) {
  const shuffled = [...array]; // clone (important)
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

async function loadQuestions() {
    const res = await fetch('/questions');
    const data = await res.json();
    const questions = data.results;
    const shuffledQuestions = shuffleArray(questions).slice(0, 5);
    return shuffledQuestions;
}

async function getAiReport(qs_array){
    try{
        const getAi = await fetch('/ai',{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(qs_array)
            }
        );

        if (getAi.ok) {
            const ai_data = await getAi.json();
            return ai_data.summaries;
        }else{
            console.log("404")
            return ["Token limit reached"];
        }
    }catch(err){
        console.error("Invalid AI response");
        return ["Token limit reached"];
    }

}

function showCorrectOpt(crr){
     document.querySelectorAll(".answer").forEach((a)=>{
     if(a.innerText == crr){
         a.classList.remove("answer");
         a.classList.add("correct");
     }
 })   

}

function check_resp(qs, opt, correct, scr, q_num,ai, getAnswered, setAnswered){

    opt.addEventListener("click", ()=>{
        if (getAnswered()) return;   // 🚫 block ALL other options
        setAnswered(true);
        if (opt.innerText == correct){
            showCorrectOpt(correct);
            scr++;
            score.innerText = scr;
            
        }else{
            opt.classList.remove("answer");
            opt.classList.add("wrong");
            showCorrectOpt(correct);
        }

        progress += 20;
        document.getElementById("bar-fill").style.width = progress + "%";
        q_num++
        setTimeout(() => {
            nextQuestion(qs, scr, q_num,ai);
        },1800)
    })  
}

function showQuestions(qs, q, scr, num, ai){
    question_txt.innerText = q.question;
    choices = shuffleArray([...q.incorrect_answers, q.correct_answer]);

    choices.forEach((choice)=>{
        const opt = document.createElement("div");
        opt.classList.add("answer");
        opt.innerText = choice;

        answers_div.appendChild(opt);
    });

    let answered = false;
    document.querySelectorAll(".answer").forEach((opt_el)=>{
        check_resp(qs, opt_el, q.correct_answer, scr, num, ai, ()=>answered, v => answered = v)
    })

}

function showResults(ai_questions){
    quiz_scr.classList.remove("active");
    result_scr.classList.add("active");

    explain_btn.onclick = async ()=>{

        const ai_resp = await getAiReport(ai_questions);

        result_scr.classList.remove("active");
        exp_scr.classList.add("active");
        summary_area.innerText = '';

        ai_resp.forEach((summary, index) => {
            const p = document.createElement("p");
            p.innerText = `Q${index + 1}: ${summary}`;
            p.style.marginBottom = "12px";
            summary_area.appendChild(p);
        })

         // console.log("AI summaries:",ai);
     }
}

function nextQuestion(qs, scr, num, ai){
    answers_div.innerText = "";
    question_txt.innerText = "";
    choices = [];
    
    if (num<=qs.length){
        question_no.innerText = num;
        // score.innerText = scr;
        showQuestions(qs,qs[num-1],scr,num, ai);
    }else{
        final_score.innerText = scr
        // console.log("AI summaries:",ai);        
        showResults(ai)
    }
}

quiz_btn.addEventListener("click",async ()=>{
    start_scr.classList.remove("active");
    quiz_scr.classList.add("active");
    document.getElementById("bar-fill").style.width = "0%";

    let qs_asked = [];
    let qs_no = 1;
    let scr = 0;
    questions = await loadQuestions();

    questions.forEach((q)=>{
        qs_asked.push(q.question)
    });

    nextQuestion(questions, scr, qs_no, qs_asked);


});

restart_btn.addEventListener("click",async ()=>{
    result_scr.classList.remove("active");
    quiz_scr.classList.add("active");
    document.getElementById("bar-fill").style.width = "0%";
    progress = 0;
    score.innerText = 0;

    let qs_asked = [];
    let qs_no = 1;
    let scr = 0;
    questions = await loadQuestions();

    questions.forEach((q)=>{
        qs_asked.push(q.question)
    });

    nextQuestion(questions, scr, qs_no, qs_asked)

});

back_btn.addEventListener("click",async ()=>{
    exp_scr.classList.remove("active");
    quiz_scr.classList.add("active");
    document.getElementById("bar-fill").style.width = "0%";
    progress = 0;
    score.innerText = 0;

    let qs_asked = [];
    let qs_no = 1;
    let scr = 0;
    questions = await loadQuestions();

    questions.forEach((q)=>{
        qs_asked.push(q.question)
    });

    nextQuestion(questions, scr, qs_no, qs_asked)

})

