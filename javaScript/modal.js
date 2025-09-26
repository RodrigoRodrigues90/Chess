document.addEventListener("DOMContentLoaded", () => {
    //para escurecer o fundo quando o modal está ativo
    projects = document.getElementById('main');

    //campos do modal
    modal = document.querySelector('.modal');
    modaltitle = document.getElementById('modal-title');
    modaldescription = document.getElementById('modal-description');
    repomodal = document.getElementById('github-modal-button');
    projectmodal = document.getElementById('project-modal-button');
    modalclose = document.getElementById('close-modal');
    modalclose_icon = document.querySelector('.close');

    //cards de projetos
    madro = document.getElementById('madro');
    versa = document.getElementById('versa');
    chess = document.getElementById('chess');
    mymoney = document.getElementById('mymoney');

    function showModal() {
        modal.classList.add('showed');
        projects.classList.add('blured');
        document.body.style.overflow = "hidden";
    }
    function closeModal() {
        modal.classList.remove('showed');
        projects.classList.remove('blured');
        document.body.style.overflow = "auto";
    }
    function changeModal(title, description, repo, project) {
        modaltitle.innerHTML = title;
        modaldescription.innerHTML = description;
        repomodal.innerText = 'Ver repositório';
        projectmodal.innerText = 'Ver projeto';
        repomodal.href = repo;
        projectmodal.href = project;

        //estilização dinamica enquanto existir projetos indisponíveis para vizualização  
        ///////////////////////////////////
        projectmodal.style.pointerEvents = 'auto';
        projectmodal.style.opacity = '1';
        ///////////////////////////////////
    }

    //descrições
    let madro_description = "E-commerce em desenvolvimento, utilizando ReactJs para construção de componentes, Redux para armazenamento de estado, o framework Express.js para requisições à API dos Correios para cálculo de fretes, e Api do Bing ERP para gerenciamento de estoque. Ainda será implementado o Back-end com banco de dados de clientes e gerenciamento de login e sessão"
    let prime_description = "Site de uma empresa fictícia de consultoria financeira empresarial, com design de interface inspirado em sites de empresas do setor. O projeto está em desenvolvimento com ReactJs na criação de componentes reutilizáveis, faltando implementar apenas algumas seções do site."
    let chess_description = "Jogo de xadrez desenvolvido em JavaScript e HTML, a Inteligencia Artificial está sendo o grande desafio nesse projeto, e algumas regras de xeque e xeque-mate estão sendo implementadas, mas ja é possivel brincar com o jogo :)"
    let money_description = "Aplicativo mobile de gestão financeira pessoal desenvolvido com Flutter. Utilizando o padrão de arquitetura MVC, a aplicação ja está bem estruturada, integrando com um Back-end configurado em Nest.js. Uma Demo do projeto estará disponível em breve."
    // ADD EVENTS
    modalclose.addEventListener("click", closeModal);
    modalclose_icon.addEventListener("click", closeModal);

    madro.addEventListener("click", () => {
        changeModal('Madro Store',
            madro_description,
            'https://github.com/RodriGo-0990/Madro-Store',
            'https://rodrigo-0990.github.io/Madro-Store/')
        showModal();
    })
    versa.addEventListener("click", () => {
        changeModal('Prime Finance',
            prime_description,
            'https://github.com/RodriGo-0990/Prime-finance',
            'https://rodrigo-0990.github.io/Prime-finance/'
        )
        showModal();
    })
    chess.addEventListener("click", () => {
        changeModal('MiChess',
            chess_description,
            'https://github.com/RodriGo-0990/MiChess',
            'https://rodrigo-0990.github.io/MiChess/',
        )
        showModal();
    })
    mymoney.addEventListener("click", () => {
        changeModal('MyMoney',
            money_description ,
            'https://github.com/RodriGo-0990/MyMoney',
            '',
        )
        // temporariamente indisponivel
        projectmodal.innerText = 'Indisponível';
        projectmodal.style.pointerEvents = 'none';
        projectmodal.style.opacity = '0.5';
        showModal();
    })

})