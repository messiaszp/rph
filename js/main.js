(() => {
  "use strict";

  /* ============================================================
     Gallery data
     Replace `label` with a real caption and swap the placeholder
     rendering (see renderGallery) for an <img> tag once real
     photographs are available. `size` controls the grid shape:
     'lg' | 'sm' | 'wide' | '' (default = half width)
     ============================================================ */
  const GALLERY_ITEMS = [
    { id: 1, category: "esportes", size: "lg",   label: "Substituir — esportes 01" },
    { id: 2, category: "retratos", size: "sm",   label: "Substituir — retrato 01" },
    { id: 3, category: "eventos",  size: "sm",   label: "Substituir — evento 01" },
    { id: 4, category: "esportes", size: "",     label: "Substituir — esportes 02" },
    { id: 5, category: "retratos", size: "",     label: "Substituir — retrato 02" },
    { id: 6, category: "eventos",  size: "wide", label: "Substituir — evento 02" },
    { id: 7, category: "retratos", size: "lg",   label: "Substituir — retrato 03" },
    { id: 8, category: "esportes", size: "sm",   label: "Substituir — esportes 03" },
    { id: 9, category: "eventos",  size: "sm",   label: "Substituir — evento 03" },
    { id: 10, category: "esportes", size: "",    label: "Substituir — esportes 04" },
  ];

  /* ============================================================
   Gallery
   Carrega as fotos do data/gallery.json
   ============================================================ */

const gallery = document.getElementById("gallery");

let GALLERY_ITEMS = [];

function labelToCaption(cat){
  const map = {
    esportes: "Esportes",
    eventos: "Eventos",
    retratos: "Retratos"
  };

  return map[cat] || cat;
}

async function loadGallery(){

  try {

    const response = await fetch("data/gallery.json");

    if(!response.ok){
      throw new Error("Não foi possível carregar as fotos.");
    }

    GALLERY_ITEMS = await response.json();

    renderGallery();

  } catch(error) {

    console.error("Erro ao carregar galeria:", error);

    gallery.innerHTML = `
      <p style="padding: 20px;">
        Não foi possível carregar as fotografias.
      </p>
    `;

  }

}

function renderGallery(){

  gallery.innerHTML = GALLERY_ITEMS.map(item => `

    <figure
      class="gallery-item${item.size ? " size-" + item.size : ""}"
      data-category="${item.category}"
      data-id="${item.id}"
      tabindex="0"
      role="button"
      aria-label="Ampliar fotografia: ${item.alt || labelToCaption(item.category)}"
    >

      <img
        src="${item.image}"
        alt="${item.alt || labelToCaption(item.category)}"
        loading="lazy"
      >

      <figcaption class="gallery-caption">
        ${labelToCaption(item.category)}
      </figcaption>

    </figure>

  `).join("");

}

loadGallery();

  /* ============================================================
     Header — solid on scroll
     ============================================================ */
  const header = document.querySelector(".site-header");
  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ============================================================
     Mobile menu
     ============================================================ */
  const menuToggle = document.querySelector(".menu-toggle");
  const navMobile = document.getElementById("menu-mobile");

  menuToggle.addEventListener("click", () => {
    const isOpen = navMobile.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  });

  navMobile.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navMobile.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menu");
    });
  });

  /* ============================================================
     Portfolio filter
     ============================================================ */
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");

      const filter = btn.dataset.filter;
      document.querySelectorAll(".gallery-item").forEach(item => {
        const match = filter === "all" || item.dataset.category === filter;
        item.classList.toggle("is-hidden", !match);
      });
    });
  });

  /* ============================================================
     Lightbox
     ============================================================ */
  const lightbox = document.getElementById("lightbox");
  const lightboxMedia = document.getElementById("lightbox-media");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxPrev = document.getElementById("lightbox-prev");
  const lightboxNext = document.getElementById("lightbox-next");

  let visibleItems = [];
  let currentIndex = 0;

  function getVisibleItems(){
    return Array.from(document.querySelectorAll(".gallery-item:not(.is-hidden)"));
  }

  function openLightbox(index){
    visibleItems = getVisibleItems();
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    lightboxClose.focus();
    document.body.style.overflow = "hidden";
  }

  function closeLightbox(){
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

 function updateLightbox(){

  const item = visibleItems[currentIndex];

  if(!item) return;

  const image = item.querySelector("img");

  if(!image) return;

  lightboxMedia.innerHTML = `
    <img
      src="${image.src}"
      alt="${image.alt}"
    >
  `;

  lightboxCaption.textContent =
    labelToCaption(item.dataset.category);
}

  function showNext(dir){
    if(!visibleItems.length) return;
    currentIndex = (currentIndex + dir + visibleItems.length) % visibleItems.length;
    updateLightbox();
  }

  gallery.addEventListener("click", (e) => {
    const item = e.target.closest(".gallery-item");
    if(!item) return;
    const items = getVisibleItems();
    openLightbox(items.indexOf(item));
  });

  gallery.addEventListener("keydown", (e) => {
    if((e.key === "Enter" || e.key === " ") && e.target.classList.contains("gallery-item")){
      e.preventDefault();
      const items = getVisibleItems();
      openLightbox(items.indexOf(e.target));
    }
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", () => showNext(-1));
  lightboxNext.addEventListener("click", () => showNext(1));
  lightbox.addEventListener("click", (e) => { if(e.target === lightbox) closeLightbox(); });

  document.addEventListener("keydown", (e) => {
    if(!lightbox.classList.contains("is-open")) return;
    if(e.key === "Escape") closeLightbox();
    if(e.key === "ArrowLeft") showNext(-1);
    if(e.key === "ArrowRight") showNext(1);
  });

  /* ============================================================
     Scroll reveal — sections only, one subtle pass
     ============================================================ */
  const revealTargets = document.querySelectorAll(".about-grid, .section-head, .service-row, .contact-grid");
  revealTargets.forEach(el => el.classList.add("reveal"));

  if("IntersectionObserver" in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add("is-visible"));
  }

  /* ============================================================
     Contact — WhatsApp / Instagram / e-mail placeholders
     Fill in the real values below; the site will wire the links
     automatically once populated.
     ============================================================ */
  const CONTACT = {
    whatsappNumber: "",   // e.g. "5588999999999" (DDI+DDD+numero, only digits)
    instagramHandle: "",  // e.g. "rodrigojr.foto"
    email: "",             // e.g. "contato@rodrigofotos.com"
  };

  const whatsappLink = document.getElementById("whatsapp-link");
  const instagramLink = document.getElementById("instagram-link");
  const emailLink = document.getElementById("email-link");

  if(CONTACT.whatsappNumber){
    whatsappLink.href = `https://wa.me/${CONTACT.whatsappNumber}`;
    whatsappLink.textContent = "Conversar agora";
    whatsappLink.target = "_blank";
    whatsappLink.rel = "noopener";
  }
  if(CONTACT.instagramHandle){
    instagramLink.href = `https://instagram.com/${CONTACT.instagramHandle}`;
    instagramLink.textContent = `@${CONTACT.instagramHandle}`;
    instagramLink.target = "_blank";
    instagramLink.rel = "noopener";
  }
  if(CONTACT.email){
    emailLink.href = `mailto:${CONTACT.email}`;
    emailLink.textContent = CONTACT.email;
  }

  /* ============================================================
     Contact form
     Submits to Netlify Forms (data-netlify on the <form>). Update
     the form's `action`/backend if hosting elsewhere.
     ============================================================ */
  const form = document.getElementById("contact-form");
  const formNote = document.getElementById("form-note");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    formNote.textContent = "Enviando…";

    const data = new FormData(form);
    const encoded = new URLSearchParams(data).toString();

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encoded,
    })
      .then(() => {
        formNote.textContent = "Mensagem enviada. Obrigado pelo contato!";
        form.reset();
      })
      .catch(() => {
        formNote.textContent = "Não foi possível enviar agora — tente novamente ou use o WhatsApp.";
      });
  });

})();
