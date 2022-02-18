const BASE_URL = "https://mock-api.driven.com.br/api/v4/buzzquizz";
let porcentagemDeAcertos = 0;
let totalDeRespostas = 0;
let qtdDeAcertos = 0;

function disporQuizes() {
	mostrarLoading();

	const promessa = axios.get(`${BASE_URL}/quizzes`);
	promessa.then((resposta) => {
		removerLoading();
		const listaQuizes = resposta.data;
		const caixaQuizes = document.querySelector(".caixa-quizz");
		listaQuizes.map(
			(quiz) =>
				(caixaQuizes.innerHTML += `<div class="quizzes-de-outros" onclick='irPraTelaQuiz(${quiz.id})' data-identifier="quizz-card">
        <img src="${quiz.image}"/>
        <div class="sombra-imagem"></div>
        <span>${quiz.title}</span>
				</div>`)
				);
			});
			
	promessa.catch(erroAxios);
}

function irPraTelaQuiz(id) {
	const telaInicial = document.querySelector(".corpo-pagina-inicial");
	const quizz = axios.get(`${BASE_URL}/quizzes/${id}`);
	telaInicial.classList.add("hidden");
	quizz.then(telaDeQuizz);
	quizz.catch(erroAxios);
}
function telaDeQuizz(resposta) {
	const quizzAtual = resposta.data;
	const corpo = document.querySelector("body");
	let caixaDeRespostas = "";
	quizzAtual.questions.map(
		(item) =>
			(caixaDeRespostas += `<div class="container-pergunta-individual">
		<div class="container-titulo-pergunta-individual" style="background-color: ${
			item.color
		};">
		  <h2 style=" color: ${item.color >= "#7FFFFF" ? "black" : "white"}">${
				item.title
			}</h2>
		</div>
		<div class="container-respostas-pergunta-individual">
		  ${exibirRespostasQuizz(item.answers, quizzAtual.questions.length)}
		</div>        
	  </div>`)
	);

	corpo.innerHTML += `
	<div class="pagina-de-um-quizz">
	  <div class="container-foto-de-capa-quizz">
		  <img src="${quizzAtual.image}"/>
		  <span>${quizzAtual.title}</span>
	  </div>
	  ${caixaDeRespostas}
	  <div class="container-fim-do-quizz hidden">
		  <div class="container-resultado" data-identifier="quizz-result">
			  <h1 class="tituloFimQuizz" >${porcentagemDeAcertos}% de acerto: ${quizzAtual.levels[0].title}</h1>
		  </div>
		  <div class="imagem-e-descricao">
			  <img src=${quizzAtual.levels[0].image}"/>
			  <p class= "textoQuizz">${quizzAtual.levels[0].text}
			  </p>
		  </div>
		  <button class="reiniciar-quizz" onclick="reiniciarQuizz(${quizzAtual.id})">
			  Reiniciar Quizz
		  </button>
		  <button  id='fullReset' class="voltar-home"  onclick="voltarTela('.corpo-pagina-inicial', '.pagina-de-um-quizz')">
			  Voltar para home
		  </button>
	  </div>
	</div> 
	`;
}

function mostrarTelaDeCriacao() {
	const telaInicial = document.querySelector(".corpo-pagina-inicial");
	const telaCriacao = document.querySelector(".tela-infos-basicas");

	telaCriacao.classList.remove("hidden");
	telaInicial.classList.add("hidden");
}

function voltarHome() {
	document.location.reload(true);
}

function exibirRespostasQuizz(respostas, qtdDeCadaResposta) {
	let ARRAY_RESPOSTAS = [];

	respostas.forEach((item) => {
		ARRAY_RESPOSTAS.push(
			`<div class="container-resposta-indivual ${
				item.isCorrectAnswer === true ? "resposta-correta" : "resposta-errada"
			}     "onclick="selecionarResposta(this, ${qtdDeCadaResposta})" data-identifier="answer">
            <img src="${item.image}"/>
            <span>${item.text}</span>
     </div>`
		);
	});
	ARRAY_RESPOSTAS.sort(embaralharRespostas);
	return ARRAY_RESPOSTAS;
}

function selecionarResposta(respostaSelecionada,qtdDeRespostas){
	const divPai = respostaSelecionada.parentNode;
	const divIrmas = divPai.children;
	const divAvo = divPai.parentNode;
	const respostasErradas = divPai.querySelectorAll(".resposta-errada");
	const respostaCorreta = divPai.querySelector(".resposta-correta");
	
	Array.from(divIrmas).forEach( (item) => {
		item.classList.add("nao-selecionado");
		item.removeAttribute("onclick");
	});
	
	Array.from(respostasErradas).forEach( (item) => {
		item.classList.add("vermelho");
	})

	if(respostaSelecionada.classList.contains("resposta-correta")){
		qtdDeAcertos++;
	}
	
	respostaSelecionada.classList.remove("nao-selecionado");
	respostaCorreta.classList.add("verde");
	totalDeRespostas++;

	if(totalDeRespostas === qtdDeRespostas){
		const porcentagem = Math.round( (qtdDeAcertos/qtdDeRespostas) * 100);
		resultadoQuizz(porcentagem);
	}
	
	setTimeout(() => {
		const pergunta = document.querySelectorAll(".container-pergunta-individual");
		const fimDoQuizz = document.querySelector(".container-fim-do-quizz");
		let rolagem = false;
		let targetPergunta = 0;

		window.onscroll = () => {
			// handle the scroll event 
			rolagem = true;
		};

		Array.from(pergunta).forEach( (item,index) => {
			if(item === divAvo){
				targetPergunta = index;
			}
		})

		if( (targetPergunta + 1) < pergunta.length && !rolagem){
			pergunta[targetPergunta + 1].scrollIntoView();
		} 
		else if(!rolagem){
			fimDoQuizz.scrollIntoView();
		}
	}, 2000, divAvo);
}

function resultadoQuizz(porcentagem){
	const fimDoQuizz = document.querySelector(".container-fim-do-quizz");
	fimDoQuizz.classList.remove("hidden");

	const tituloFimQuizz = fimDoQuizz.querySelector(".tituloFimQuizz");
	tituloFimQuizz.innerHTML = `${porcentagem}% de acerto:`;
	const imagemFimQuizz = fimDoQuizz.querySelector("img");
	const textoResultadoDoQuizz = fimDoQuizz.querySelector(".textoQuizz");
}

function embaralharRespostas() {
	return Math.random() - 0.5;
}

function erroAxios() {
	alert(
		"Houve uma falha na comunicação com o servidor"
	);
	window.location.reload();
}

function mostrarLoading(){
	const telaLoading = document.querySelector(".tela-loading");
	telaLoading.innerHTML = Loading();
}

function removerLoading(){
	const telaLoading = document.querySelector(".tela-loading");
	telaLoading.innerHTML = '';
}

function Loading(){
	return `
    <div class="loading">
      <?xml version="1.0" encoding="utf-8"?>
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: block; shape-rendering: auto;" width="100px" height="100px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
        <g transform="rotate(0 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#ec362d">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.9166666666666666s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(30 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#ec362d">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.8333333333333334s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(60 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#ec362d">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.75s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(90 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#ec362d">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.6666666666666666s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(120 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#ec362d">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.5833333333333334s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(150 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#ec362d">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.5s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(180 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#ec362d">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.4166666666666667s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(210 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#ec362d">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.3333333333333333s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(240 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#ec362d">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.25s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(270 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#ec362d">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.16666666666666666s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(300 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#ec362d">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="-0.08333333333333333s" repeatCount="indefinite"></animate>
          </rect>
        </g><g transform="rotate(330 50 50)">
          <rect x="47" y="24" rx="3" ry="6" width="6" height="12" fill="#ec362d">
            <animate attributeName="opacity" values="1;0" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite"></animate>
          </rect>
        </g>
      </svg>
    
      <span>Carregando</span>
    </div>
  `;
}
