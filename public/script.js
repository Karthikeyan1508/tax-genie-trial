'use strict';



/**
 * NAVBAR TOGGLE FOR MOBILE
 */

const navbar = document.querySelector("[data-navbar]");
const navToggler = document.querySelector("[data-nav-toggler]");

navToggler.addEventListener("click", function () {
  navbar.classList.toggle("active");
  this.classList.toggle("active");
});

function toggle(){
  document.body.classList.toggle('dark');
  const icon = document.getElementById('toggle-icon');
  if (document.body.classList.contains('dark')) {
    icon.setAttribute('name', 'sunny');
  } else {
    icon.setAttribute('name', 'moon');
  }
}




/**
 * HEADER & BACK TOP BTN
 * header and back top btn visible when window scroll down to 200px
 */

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

const activeElementOnScroll = function () {
  if (window.scrollY > 200) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
}

window.addEventListener("scroll", activeElementOnScroll);

/**
 * SLIDER
 */

const fetchNews = async ()=>{
  var url = 'https://newsapi.org/v2/everything?' +
            'q=Tax&Finanace&Stocks&Budget&Economy&India&' +             
            'from=2024-09-01&' +      
            'sortBy=publishedAt&' +   
            'apiKey=7ac9f6fe81724f1da7ca674d84f52f2a';
  var req = new Request(url);
  
  let a = await fetch(req)
  let response = await a.json()
  console.log(response)
  let str =""
  response.articles.slice(0, 8).forEach((item) => {
    if (item.urlToImage && item.description) {
      str += `<div class="swiper-slide">
        <div class="card" style="width: 350px; height: 450px; padding: 20px; margin-left: 20px; border: 1px solid black;">
          <div class="img-card" style="width: 310px; overflow: hidden;">
            <img
              src="${item.urlToImage}" 
              alt="Card Image" 
              class="card-img" 
              onerror="this.onerror=null; this.src='https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png';" 
              style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <div class="card-content" style="margin-top: 0px;">
            <h3 class="card-title">${item.title ? item.title.slice(0, 50) : "No Title Available"}</h3>
            <p class="card-description">${item.description.slice(0, 200)}...</p>
            <button><a href="${item.url}" target="_blank" class="card-btn" style="color: grey; margin-top: 5px">Read More</a></button>
          </div>
        </div>
      </div>`; 
  }
  

  });
  document.querySelector(".swiper-wrapper").innerHTML = str;
  
  new Swiper('.swiper-container', {
      slidesPerView: 3,  
      spaceBetween: 10,   
      loop: true, 
      centeredSlides: true,         
      autoplay: {
        delay: 3000,    
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {  
        320: {
          slidesPerView: 1,  
          spaceBetween: 10,
        },
        640: {
          slidesPerView: 2,  
          spaceBetween: 10,
        },
        1024: {
          slidesPerView: 3,  
          spaceBetween: 10,
        },
      }
  });
  
  }
  fetchNews()

/**
 * ACCORDION
 */

const accordions = document.querySelectorAll("[data-accordion]");

let lastActiveAccordion;

const accordionInit = function (currentAccordion) {

  const accordionBtn = currentAccordion.querySelector("[data-accordion-btn]");

  accordionBtn.addEventListener("click", function () {

    if (currentAccordion.classList.contains("active")) {
      currentAccordion.classList.toggle("active");
    } else {
      if (lastActiveAccordion) lastActiveAccordion.classList.remove("active");
      currentAccordion.classList.add("active");
    }

    lastActiveAccordion = currentAccordion;

  });

}

for (let i = 0, len = accordions.length; i < len; i++) { accordionInit(accordions[i]); }