document.addEventListener("DOMContentLoaded", () => {
    //campos da pagina
    let wrapper = document.getElementById('home')
    let wrapperAbout = document.getElementById('about');
    let wrapperXp = document.getElementById('xp');
    let wrapperProjects = document.getElementById("projects");
    let wrapperSkills = document.getElementById('skills');
    //array dos campos
    let campos = [];
    campos.push(wrapper, wrapperAbout, wrapperSkills, wrapperXp, wrapperProjects);
    //menu
    let home = document.getElementById('homemenu');
    let about = document.getElementById('aboutmenu');
    let skills = document.getElementById('skillsmenu');
    let xp = document.getElementById('xpmenu');
    let projects = document.getElementById('projmenu');

    //menu-mobile
    let hamburguer_icon = document.querySelector(".hamburguer-menu");
    let hamburguer_menu_before = document.querySelector(".hamburguer-menu-before");
    let hamburguer_menu_after = document.querySelector(".hamburguer-menu-after");
    let menu_mobile = document.querySelector(".menu-mobile");
    let meat = document.querySelector(".meat");
    let portfolio = document.querySelector(".portfolio");

    let about_mobile = document.getElementById('aboutmenu-mobile');
    let skills_mobile = document.getElementById('skillsmenu-mobile');
    let xp_mobile = document.getElementById('xpmenu-mobile');
    let projects_mobile = document.getElementById('projmenu-mobile');

    //função para navegação
    function movePage(num) {
        campos[num].scrollIntoView({
            inline: "center",
            behavior: "smooth"
        })
    }

    //listeners
    home.addEventListener("click", function () {
        movePage(0);
    });
    about.addEventListener("click", function () {
        movePage(1);
    });
    skills.addEventListener("click", function () {
        movePage(2);
    });
    xp.addEventListener("click", function () {
        movePage(3);
    });
    projects.addEventListener("click", function () {
        movePage(4);
    });
   

    //listeners to mobile
    about_mobile.addEventListener("click", function () {
        movePage(1);
        toggleMenuMobile();
    });
    skills_mobile.addEventListener("click", function () {
        movePage(2);
        toggleMenuMobile();
    });
    xp_mobile.addEventListener("click", function () {
        movePage(3);
       toggleMenuMobile();
    });
    projects_mobile.addEventListener("click", function () {
        movePage(4);
        toggleMenuMobile();
    });
    
    // abre e fecha menu mobile
    let open_close_menu = false;
    hamburguer_icon.addEventListener("click",
         toggleMenuMobile)

    function toggleMenuClass(element, add, remove) {
        element.classList.add(add);
        element.classList.remove(remove);
    }
    
    function toggleMenuMobile(){
        open_close_menu = !open_close_menu;
        if (open_close_menu) {
            menu_mobile.style.display = "flex";
            document.body.style.overflow = "hidden";
            portfolio.style.pointerEvents = "none";
            toggleMenuClass(meat, "meat-open-menu", "meat");
            toggleMenuClass(hamburguer_menu_before, "hamburguer-menu-before-open-menu", "hamburguer-menu-before");
            toggleMenuClass(hamburguer_menu_after, "hamburguer-menu-after-open-menu", "hamburguer-menu-after");
        } else {
            menu_mobile.style.display = "none";
            document.body.style.overflow = "auto";
            portfolio.style.pointerEvents = "auto";
            toggleMenuClass(meat,"meat", "meat-open-menu");
            toggleMenuClass(hamburguer_menu_before, "hamburguer-menu-before", "hamburguer-menu-before-open-menu");
            toggleMenuClass(hamburguer_menu_after, "hamburguer-menu-after", "hamburguer-menu-after-open-menu");
        }
    }

    
})

//SCROLLREVEAL
window.reveal_ = ScrollReveal({ reset: true })
reveal_.reveal('.profile',
    {
        origin: 'left',
        duration: 2000,
        distance: '40px',
    })
reveal_.reveal('.profile p',
    {
        origin: 'left',
        duration: 2700,
        distance: '70px',
    })

reveal_.reveal('.image-profile',
    {
        origin: 'right',
        duration: 2000,
        distance: '40px',
    })

reveal_.reveal('#title',
    {
        duration: 2500,
        origin: 'right',
        distance: '40px',
        beforeReveal: function (el) {
            el.classList.remove('hidden');
            el.classList.add('revealed');
        },
        afterReset: function (el) {
            el.classList.remove('revealed');
            el.classList.add('hidden');
        }
    })
reveal_.reveal('.texto',
    {
        duration: 2600,
        origin: 'left',
        distance: '75px',
    }
)
reveal_.reveal('.skill-icons',
    {
        duration: 2000,
        origin: 'left',
        distance: '75px',
    }
)
reveal_.reveal('.wrapper-card-xp',
    {
        duration: 2000,
        origin: 'bottom',
        distance: '75px',
    }
)
reveal_.reveal('.wrapper-projects',
    {
        duration: 2000,
        origin: 'left',
        distance: '75px',
    }
)
 
