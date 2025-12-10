// ========================================
// CODEAGGIE - PART 3 (Compact Version)
// ========================================

$(document).ready(function() {
    
    // ========== JQUERY-UI WIDGETS ==========
    $("#tabs").tabs();
    $("#accordion").accordion({ collapsible: true, active: false });
    $("#success-dialog").dialog({ autoOpen: false, modal: true, buttons: { "OK": function() { $(this).dialog("close"); }}});
    
    // ========== SLICK CAROUSEL ==========
    if ($("#tips-slideshow").length) {
        $('<link>').appendTo('head').attr({rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css'});
        $('<link>').appendTo('head').attr({rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css'});
        $.getScript('https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js', function() {
            $("#tips-slideshow").slick({ dots: true, infinite: true, autoplay: true, autoplaySpeed: 3000, fade: true });
        });
    }
    
    // ========== AJAX WEATHER ==========
    if ($("#weather-display").length) {
        function fetchWeather() {
            $("#weather-display").html('<p>Loading...</p>');
            $.ajax({
                url: 'https://api.open-meteo.com/v1/forecast?latitude=36.0726&longitude=-79.7920&current_weather=true&temperature_unit=fahrenheit',
                success: function(data) {
                    const w = data.current_weather;
                    const emoji = w.weathercode === 0 ? "☀️" : w.weathercode <= 3 ? "☁️" : w.weathercode < 70 ? "🌧️" : "❄️";
                    $("#weather-display").html(`
                        <div class="weather-card">
                            <h4>${emoji} Greensboro, NC</h4>
                            <p class="temperature">${Math.round(w.temperature)}°F</p>
                            <p>Wind: ${Math.round(w.windspeed)} mph</p>
                            <button id="refresh-weather" class="btn">Refresh</button>
                        </div>
                    `);
                    $("#refresh-weather").on("click", fetchWeather);
                },
                error: function() { $("#weather-display").html('<p style="color:red;">Weather unavailable</p>'); }
            });
        }
        fetchWeather();
    }
    
    // ========== CALCULATOR ==========
    $("#calculate").on("click", function() {
        const n1 = parseFloat($("#num1").val()), n2 = parseFloat($("#num2").val());
        if (isNaN(n1) || isNaN(n2)) {
            $("#calc-error").show();
            $("#result-value").text("--");
        } else {
            $("#calc-error").hide();
            $("#result-value").text(n1 + n2);
        }
    });
    
    // ========== QUIZ DATA ==========
    const quizData = {
        variables: [
            {q: "Which keyword declares a reassignable variable?", o: ["const","let","var","function"], c: 1, e: "'let' declares reassignable variables"},
            {q: "How to declare a constant?", o: ["var PI=3.14","let PI=3.14","const PI=3.14","constant PI=3.14"], c: 2, e: "Use 'const' for constants"},
            {q: "Invalid variable name?", o: ["myVariable","_privateVar","2ndPlace","$price"], c: 2, e: "Names can't start with numbers"},
            {q: "Uninitialized variable value?", o: ["null","0","undefined","empty"], c: 2, e: "Uninitialized = undefined"},
            {q: "Assignment operator?", o: ["==","=","===",":"], c: 1, e: "Single = assigns values"}
        ],
        functions: [
            {q: "Declare a function?", o: ["function f(){}","func f(){}","def f(){}","function: f(){}"], c: 0, e: "Use 'function' keyword"},
            {q: "Default return value?", o: ["null","0","undefined","false"], c: 2, e: "No return = undefined"},
            {q: "Call a function?", o: ["call f()","f()","call function f","execute f()"], c: 1, e: "Use parentheses"},
            {q: "What are parameters?", o: ["Return values","Variables in definition","Function names","Code blocks"], c: 1, e: "Parameters receive values"},
            {q: "Can a function call itself?", o: ["No","Yes, recursion","Only in loops","Only with return"], c: 1, e: "Self-calling is recursion"}
        ],
        loops: [
            {q: "Loop guaranteed to run once?", o: ["for","while","do...while","forEach"], c: 2, e: "do...while checks after"},
            {q: "Exit loop keyword?", o: ["exit","stop","break","end"], c: 2, e: "'break' exits loops"},
            {q: "'continue' does what?", o: ["Exits loop","Skips to next","Restarts","Pauses"], c: 1, e: "Skips current iteration"},
            {q: "Best for arrays?", o: ["while","do...while","for","All"], c: 3, e: "All work, for is common"},
            {q: "Always-true condition?", o: ["Syntax error","Runs once","Infinite loop","Returns false"], c: 2, e: "Creates infinite loop"}
        ],
        arrays: [
            {q: "Create an array?", o: ["let a=[]","let a=()","let a={}","array a=[]"], c: 0, e: "Use square brackets"},
            {q: "First element?", o: ["a[1]","a[0]","a.first","a.get(0)"], c: 1, e: "Index starts at 0"},
            {q: "Add to end?", o: ["push()","add()","append()","insert()"], c: 0, e: "push() adds to end"},
            {q: "Length property returns?", o: ["Last element","Size","Element count","Last index"], c: 2, e: "Number of elements"},
            {q: "Remove last element?", o: ["remove()","delete()","pop()","shift()"], c: 2, e: "pop() removes last"}
        ]
    };
    
    // ========== QUIZ LOGIC ==========
    $("#loadQuiz").on("click", function() {
        const topic = $("#topic").val();
        if (!topic) { alert("Select a topic!"); return; }
        
        const quiz = quizData[topic];
        let html = '';
        quiz.forEach((q, i) => {
            html += `<div class="question"><h4>Question ${i+1}: ${q.q}</h4>`;
            q.o.forEach((opt, j) => html += `<label><input type="radio" name="q${i}" value="${j}">${opt}</label><br>`);
            html += '</div>';
        });
        $("#quizForm").html(html).data('quiz', quiz);
        $("#quiz-content").slideDown();
        $("#score-display, #explanations").hide();
    });
    
    $("#submitQuiz").on("click", function() {
        const quiz = $("#quizForm").data('quiz');
        if (!quiz) { alert("Load a quiz first!"); return; }
        
        let score = 0, answered = 0, expHTML = '';
        quiz.forEach((q, i) => {
            const sel = $(`input[name="q${i}"]:checked`).val();
            if (sel !== undefined) {
                answered++;
                const correct = parseInt(sel) === q.c;
                if (correct) score++;
                expHTML += `<h3>Q${i+1}</h3><div><p><strong>${q.q}</strong></p>
                    <p class="${correct?'correct':'incorrect'}">${correct?'✓ Correct':'✗ Incorrect'}</p>
                    <p><strong>Your:</strong> ${q.o[sel]}</p><p><strong>Correct:</strong> ${q.o[q.c]}</p>
                    <p>${q.e}</p></div>`;
            }
        });
        
        if (answered < quiz.length) { alert("Answer all questions!"); return; }
        
        $("#score").text(score);
        $("#total").text(quiz.length);
        const pct = (score/quiz.length)*100;
        $("#score-message").text(pct===100?"Perfect! 🎉":pct>=80?"Great job! 👏":pct>=60?"Good! 💪":"Keep practicing! 📚");
        $("#score-display").slideDown();
        
        $("#accordion").html(expHTML).accordion("destroy").accordion({ collapsible: true, active: false });
        $("#explanations").slideDown();
    });
    
    $("#resetQuiz").on("click", function() {
        $("#quiz-content, #score-display, #explanations").slideUp();
        $("#topic").val("");
    });
    
    // ========== CONTACT FORM ==========
    $("#contactForm").on("submit", function(e) {
        e.preventDefault();
        $(".error-message").text("");
        let valid = true;
        
        if ($("#name").val().trim().length < 2) { $("#nameError").text("Name too short"); valid = false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($("#email").val())) { $("#emailError").text("Invalid email"); valid = false; }
        if ($("#message").val().trim().length < 10) { $("#messageError").text("Message too short"); valid = false; }
        
        if (valid) {
            $("#success-dialog").dialog("open");
            this.reset();
        }
    });
});