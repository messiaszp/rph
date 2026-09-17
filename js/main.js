document.addEventListener("DOMContentLoaded", () => {

  /* =========================================================
     GALERIA
  ========================================================= */

  const gallery = document.getElementById("gallery");

  let galleryData = [];
  let visibleItems = [];
  let currentIndex = 0;

  function labelToCaption(category) {
    const map = {
      esportes: "Esportes",
      eventos: "Eventos",
      retratos: "Retratos"
    };

    return map[category] || category;
  }

  async function loadGallery() {
  try {
    const response = await fetch("/.netlify/functions/list-photos");

    if (!response.ok) {
      throw new Error("Não foi possível carregar as fotografias");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error("A função não retornou as fotografias");
    }

    galleryData = data.photos.filter(
      photo => photo.image && photo.published !== false
);

    renderGallery();

  } catch (error) {
    console.error("Erro ao carregar galeria:", error);

    gallery.innerHTML = `
      <p style="padding: 20px;">
        Não foi possível carregar as fotografias.
      </p>
    `;
  }
}

  function renderGallery() {

    gallery.innerHTML = galleryData.map(item => `
      <figure
        class="gallery-item${item.size ? " size-" + item.size : ""}"
        data-category="${item.category}"
        data-id="${item.id}"
        tabindex="0"
        role="button"
        aria-label="Ampliar fotografia"
      >

        <img
          src="${item.image}"
          alt="${item.alt || "Fotografia"}"
          loading="lazy"
        >

        <figcaption class="gallery-caption">
          ${labelToCaption(item.category)}
        </figcaption>

      </figure>
    `).join("");

    setupGalleryEvents();
    updateVisibleItems();
  }

  function setupGalleryEvents() {

    document.querySelectorAll(".gallery-item").forEach(item => {

      item.addEventListener("click", () => {
        openLightbox(item);
      });

      item.addEventListener("keydown", event => {

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(item);
        }

      });

    });

  }


  /* =========================================================
     FILTROS
  ========================================================= */

  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach(button => {

    button.addEventListener("click", () => {

      filterButtons.forEach(btn => {
        btn.classList.remove("is-active");
      });

      button.classList.add("is-active");

      const filter = button.dataset.filter;

      document.querySelectorAll(".gallery-item").forEach(item => {

        if (filter === "all" || item.dataset.category === filter) {
          item.style.display = "";
        } else {
          item.style.display = "none";
        }

      });

      updateVisibleItems();

    });

  });


  function updateVisibleItems() {

    visibleItems = Array.from(
      document.querySelectorAll(".gallery-item")
    ).filter(item => {
      return item.style.display !== "none";
    });

  }


  /* =========================================================
     LIGHTBOX
  ========================================================= */

  const lightbox = document.getElementById("lightbox");

  const lightboxMedia = document.getElementById("lightboxMedia");
  const lightboxCaption = document.getElementById("lightboxCaption");

  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");


  function openLightbox(item) {

    updateVisibleItems();

    currentIndex = visibleItems.indexOf(item);

    if (currentIndex < 0) {
      currentIndex = 0;
    }

    updateLightbox();

    lightbox.classList.add("is-open");
    document.body.classList.add("no-scroll");

  }


  function closeLightbox() {

    lightbox.classList.remove("is-open");
    document.body.classList.remove("no-scroll");

  }


  function updateLightbox() {

    const item = visibleItems[currentIndex];

    if (!item) return;

    const image = item.querySelector("img");

    if (!image) return;

    lightboxMedia.innerHTML = `
      <img
        src="${image.src}"
        alt="${image.alt || "Fotografia"}"
      >
    `;

    lightboxCaption.textContent =
      labelToCaption(item.dataset.category);

  }


  function nextLightbox() {

    if (!visibleItems.length) return;

    currentIndex =
      (currentIndex + 1) % visibleItems.length;

    updateLightbox();

  }


  function prevLightbox() {

    if (!visibleItems.length) return;

    currentIndex =
      (currentIndex - 1 + visibleItems.length) %
      visibleItems.length;

    updateLightbox();

  }


  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  if (lightboxNext) {
    lightboxNext.addEventListener("click", nextLightbox);
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", prevLightbox);
  }


  if (lightbox) {

    lightbox.addEventListener("click", event => {

      if (event.target === lightbox) {
        closeLightbox();
      }

    });

  }


  document.addEventListener("keydown", event => {

    if (!lightbox.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
    }

    if (event.key === "ArrowRight") {
      nextLightbox();
    }

    if (event.key === "ArrowLeft") {
      prevLightbox();
    }

  });


  /* =========================================================
     HEADER
  ========================================================= */

  const header = document.querySelector("header");

  function updateHeader() {

    if (!header) return;

    if (window.scrollY > 30) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }

  }

  window.addEventListener("scroll", updateHeader);

  updateHeader();


  /* =========================================================
     MENU MOBILE
  ========================================================= */

  const menuToggle =
    document.querySelector(".menu-toggle");

  const nav =
    document.querySelector(".nav");

  if (menuToggle && nav) {

    menuToggle.addEventListener("click", () => {

      nav.classList.toggle("is-open");

    });

  }


  /* =========================================================
     REVEAL AO ROLAR
  ========================================================= */

  const revealElements =
    document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (entry.isIntersecting) {

            entry.target.classList.add("is-visible");

            observer.unobserve(entry.target);

          }

        });

      },
      {
        threshold: 0.1
      }
    );

    revealElements.forEach(element => {
      observer.observe(element);
    });

  } else {

    revealElements.forEach(element => {
      element.classList.add("is-visible");
    });

  }


  /* =========================================================
     CONTATOS
  ========================================================= */

  const CONTACT = {
    whatsappNumber: "",
    instagramHandle: "",
    email: ""
  };


  const whatsappLinks =
    document.querySelectorAll("[data-whatsapp]");

  whatsappLinks.forEach(link => {

    if (CONTACT.whatsappNumber) {

      link.href =
        `https://wa.me/${CONTACT.whatsappNumber}`;

    }

  });


  const instagramLinks =
    document.querySelectorAll("[data-instagram]");

  instagramLinks.forEach(link => {

    if (CONTACT.instagramHandle) {

      link.href =
        `https://instagram.com/${CONTACT.instagramHandle}`;

    }

  });


  const emailLinks =
    document.querySelectorAll("[data-email]");

  emailLinks.forEach(link => {

    if (CONTACT.email) {

      link.href =
        `mailto:${CONTACT.email}`;

    }

  });


  /* =========================================================
     FORMULÁRIO NETLIFY
  ========================================================= */

  const form =
    document.querySelector("form[name='contact']");

  if (form) {

    form.addEventListener("submit", async event => {

      event.preventDefault();

      const formData = new FormData(form);

      try {

        const response = await fetch("/", {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded"
          },
          body:
            new URLSearchParams(formData).toString()
        });

        if (response.ok) {

          form.reset();

          alert("Mensagem enviada com sucesso!");

        } else {

          alert("Não foi possível enviar a mensagem.");

        }

      } catch (error) {

        console.error(error);

        alert("Ocorreu um erro ao enviar a mensagem.");

      }

    });

  }

/* =========================================================
   IMAGEM PRINCIPAL — HERO
========================================================= */

async function loadHeroImage() {

  try {

    const response =
      await fetch(
        "/.netlify/functions/get-site-images"
      );


    if (!response.ok) {
      return;
    }


    const data =
      await response.json();


    if (
      !data.success ||
      !data.hero ||
      !data.hero.image
    ) {
      return;
    }


    const heroMedia =
      document.querySelector(".hero-media");


    if (!heroMedia) {
      return;
    }


    heroMedia.classList.remove("ph");

    heroMedia.removeAttribute(
      "data-ph-label"
    );


    heroMedia.innerHTML = "";


    const image =
      document.createElement("img");


    image.src =
      data.hero.image;


    image.alt =
      "Fotografia de destaque";


    image.loading =
      "eager";


    heroMedia.appendChild(
      image
    );


  } catch (error) {

    console.error(
      "Erro ao carregar foto principal:",
      error
    );

  }

}

/* =========================================================
   IMAGEM DO SOBRE
========================================================= */

async function loadAboutImage() {

  try {

    const response =
      await fetch(
        "/.netlify/functions/get-site-images"
      );


    if (!response.ok) {
      return;
    }


    const data =
      await response.json();


    if (
      !data.success ||
      !data.about ||
      !data.about.image
    ) {
      return;
    }


    const aboutPhoto =
      document.querySelector(".about-photo");


    if (!aboutPhoto) {
      return;
    }


    aboutPhoto.classList.remove("ph");

    aboutPhoto.removeAttribute(
      "data-ph-label"
    );


    aboutPhoto.innerHTML = "";


    const image =
      document.createElement("img");


    image.src =
      data.about.image;


    image.alt =
      "Fotografia de Rodrigo";


    image.loading =
      "lazy";


    aboutPhoto.appendChild(image);


  } catch (error) {

    console.error(
      "Erro ao carregar foto do Sobre:",
      error
    );

  }

}


/* =========================================================
   INICIAR
========================================================= */

loadGallery();

loadAboutImage();

});

