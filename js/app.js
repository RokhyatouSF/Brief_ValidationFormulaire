
/* ═══════════════════════════════════════════════
   REGISTER DrawSVG (nécessaire pour drawSVG)
═══════════════════════════════════════════════ */
gsap.registerPlugin(DrawSVGPlugin);

/* ═══════════════════════════════════════════════
   DOM REFS
═══════════════════════════════════════════════ */
const form             = document.querySelector("#form");
const firstName        = document.querySelector("#firstName");
const lastName         = document.querySelector("#lastName");
const email            = document.querySelector("#email");
const domain           = document.querySelector("#domain");
const bio              = document.querySelector("#bio");
const radios           = document.querySelectorAll("input[name='rythme']");
const checkboxes       = document.querySelectorAll("input[name='interets']");
const charCounter      = document.querySelector("#charCounter");
const profileContainer = document.querySelector("#profileContainer");
const card             = document.querySelector(".page-container");
const btn              = document.querySelector(".submit-btn");

// Modal
const modal     = document.querySelector("#confirmModal");
const preview   = document.querySelector("#previewData");
const editBtn   = document.querySelector("#editBtn");
const confirmBtn= document.querySelector("#confirmBtn");

// Thank you
const thankYou  = document.querySelector("#thankYou");

let tempData = null;

/* ═══════════════════════════════════════════════
   INTRO ANIMATION
═══════════════════════════════════════════════ */
window.addEventListener("load", () => {
    const tl = gsap.timeline();
    tl.from("body",              { opacity:0, duration:1 })
      .from(".page-container",   { scale:.7, opacity:0, rotateX:25, duration:1.5, ease:"expo.out" })
      .from(".illustration-side h1", { y:80, opacity:0, duration:1 }, "-=1")
      .from(".illustration-side p",  { y:40, opacity:0, duration:1 }, "-=.7")
      .from(".illustration-side img",{ scale:0, rotation:180, opacity:0, duration:1.2, ease:"back.out(1.7)" }, "-=.6")
      .from(".form-group",       { x:60, opacity:0, stagger:.08, duration:.7, ease:"power3.out" }, "-=1");
});

/* ═══════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════ */
function sanitize(v){ return v.trim(); }

function setError(input, message){
    const group = input.closest(".form-group");
    const err   = group?.querySelector(".error-message");
    input.classList.add("input-error");
    input.classList.remove("input-success");
    if(err) err.textContent = message;
    gsap.fromTo(input, { x:-8 }, { x:8, duration:.06, repeat:6, yoyo:true, ease:"power1.inOut" });
}

function setSuccess(input){
    const group = input.closest(".form-group");
    const err   = group?.querySelector(".error-message");
    input.classList.remove("input-error");
    input.classList.add("input-success");
    if(err) err.textContent = "";
    gsap.fromTo(input, { scale:.95 }, { scale:1, duration:.4, ease:"back.out(2)" });
}

/* ═══════════════════════════════════════════════
   VALIDATIONS INDIVIDUELLES
═══════════════════════════════════════════════ */
function validateName(input, label){
    if(input.value.trim().length < 3){
        setError(input, `${label} doit contenir au moins 3 caractères`);
        return false;
    }
    setSuccess(input);
    return true;
}

function validateEmail(){
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!regex.test(email.value)){
        setError(email, "Email invalide");
        return false;
    }
    setSuccess(email);
    return true;
}

function validateDomain(){
    if(domain.value === ""){
        setError(domain, "Veuillez choisir un domaine");
        return false;
    }
    setSuccess(domain);
    return true;
}

function validateRadio(){
    const group = document.querySelector("#radioGroup");
    const err   = group.querySelector(".error-message");
    const checked = [...radios].some(r => r.checked);
    if(!checked){
        err.textContent = "Choix obligatoire";
        gsap.from(group, { x:-10, duration:.3, repeat:3, yoyo:true });
        return false;
    }
    err.textContent = "";
    return true;
}

function validateCheckboxes(){
    const group = document.querySelector("#checkboxGroup");
    const err   = group.querySelector(".error-message");
    const count = [...checkboxes].filter(c => c.checked).length;
    if(count < 2){
        err.textContent = "Choisir au moins 2 intérêts";
        gsap.from(group, { scale:.98, duration:.2, repeat:3, yoyo:true });
        return false;
    }
    err.textContent = "";
    return true;
}

function validateBio(){
    const val = sanitize(bio.value);
    if(val.length < 25){
        setError(bio, "Minimum 25 caractères requis");
        return false;
    }
    if(val.length > 255){
        setError(bio, "Maximum 255 caractères");
        return false;
    }
    setSuccess(bio);
    return true;
}

/* ═══════════════════════════════════════════════
   REAL-TIME VALIDATION
═══════════════════════════════════════════════ */
firstName.addEventListener("input",  () => validateName(firstName, "Prénom"));
lastName.addEventListener("input",   () => validateName(lastName,  "Nom"));
email.addEventListener("input",      validateEmail);
domain.addEventListener("change",    validateDomain);
radios.forEach(r    => r.addEventListener("change",  validateRadio));
checkboxes.forEach(c => c.addEventListener("change", validateCheckboxes));

bio.addEventListener("input", () => {
    charCounter.textContent = `${255 - bio.value.length} caractères restants`;
    validateBio();
});

/* ═══════════════════════════════════════════════
   SUBMIT → OUVRE LA MODALE
═══════════════════════════════════════════════ */
form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Valider TOUT (& bitwise pour tous les appels)
    const isValid =
        validateName(firstName, "Prénom") &
        validateName(lastName,  "Nom")    &
        validateEmail()   &
        validateDomain()  &
        validateRadio()   &
        validateCheckboxes() &
        validateBio();

    if(!isValid) return;

    tempData = {
        firstName: sanitize(firstName.value),
        lastName:  sanitize(lastName.value),
        email:     sanitize(email.value),
        domain:    domain.value,
        rythme:    [...radios].find(r => r.checked)?.value,
        interets:  [...checkboxes].filter(c => c.checked).map(c => c.value),
        bio:       sanitize(bio.value)
    };

    openModal(tempData);
});

/* ═══════════════════════════════════════════════
   MODAL : OUVRIR
═══════════════════════════════════════════════ */
function openModal(data){
    preview.innerHTML = `
        <div class="row"><span class="label">Nom</span>      <span class="val">${data.firstName} ${data.lastName}</span></div>
        <div class="row"><span class="label">Email</span>    <span class="val">${data.email}</span></div>
        <div class="row"><span class="label">Domaine</span>  <span class="val">${data.domain}</span></div>
        <div class="row"><span class="label">Rythme</span>   <span class="val">${data.rythme}</span></div>
        <div class="row"><span class="label">Intérêts</span> <span class="val">${data.interets.join(", ")}</span></div>
        <div class="row"><span class="label">Bio</span>      <span class="val">${data.bio}</span></div>
    `;

    modal.classList.remove("hidden");

    gsap.fromTo(".modal-content",
        { scale:.5, opacity:0, y:40 },
        { scale:1,  opacity:1, y:0, duration:.6, ease:"back.out(2)" }
    );
}

/* ═══════════════════════════════════════════════
   MODAL : MODIFIER
═══════════════════════════════════════════════ */
editBtn.addEventListener("click", () => {
    gsap.to(".modal-content", {
        scale:.8, opacity:0, duration:.25, ease:"power2.in",
        onComplete: () => modal.classList.add("hidden")
    });
});

/* ═══════════════════════════════════════════════
   MODAL : CONFIRMER
═══════════════════════════════════════════════ */
confirmBtn.addEventListener("click", () => {
    gsap.to(".modal-content", {
        scale:.8, opacity:0, duration:.25, ease:"power2.in",
        onComplete: () => {
            modal.classList.add("hidden");
            createProfile(tempData);

            // Reset form
            form.reset();
            charCounter.textContent = "255 caractères restants";
            document.querySelectorAll(".input-success, .input-error")
                    .forEach(el => el.classList.remove("input-success","input-error"));

            // Afficher l'animation de remerciement
            showThankYou();
        }
    });
});

/* ═══════════════════════════════════════════════
   CRÉER PROFIL
═══════════════════════════════════════════════ */
function createProfile(data){
    profileContainer.innerHTML = `
        <div class="profile-card">
            <h2>✨ Profil créé avec succès</h2>
            <p><strong>Nom :</strong> ${data.firstName} ${data.lastName}</p>
            <p><strong>Email :</strong> ${data.email}</p>
            <p><strong>Domaine :</strong> ${data.domain}</p>
            <p><strong>Rythme :</strong> ${data.rythme}</p>
            <p><strong>Intérêts :</strong> ${data.interets.join(", ")}</p>
            <p><strong>Bio :</strong> ${data.bio}</p>
        </div>
    `;
    profileContainer.scrollIntoView({ behavior:"smooth" });
    gsap.from(".profile-card", { scale:0, rotate:15, opacity:0, duration:1.2, ease:"elastic.out(1,.5)" });
}

/* ═══════════════════════════════════════════════
   THANK YOU ANIMATION (GSAP + DrawSVG)
═══════════════════════════════════════════════ */
function showThankYou(){
    thankYou.classList.remove("hidden");

    const tl = gsap.timeline({ defaults:{ ease:"power2.inOut" } });

    // fade in overlay
    gsap.set(thankYou, { opacity:0 });
    tl.to(thankYou, { opacity:1, duration:.5 })

    // faire apparaître le SVG
    .set("#svg-stage", { opacity:1 })

    // DrawSVG : trace le path de 0 à 100%
    .fromTo("path",
        { drawSVG:"0% 0%" },
        { drawSVG:"0% 100%", duration:2.5, ease:"power1.inOut" }
    )

    // Puis retour (loop optionnel)
    .to("path",
        { drawSVG:"100% 100%", duration:2, ease:"power1.inOut" },
        "+=.3"
    )

    // Titre
    .to("#thankYouTitle", { y:0, opacity:1, duration:.9, ease:"power3.out" }, "-=1.5");
}

/* ═══════════════════════════════════════════════
   CARD 3D MOUSE EFFECT
═══════════════════════════════════════════════ */
card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const rotateY = ((e.clientX - rect.left) / rect.width  - .5) *  15;
    const rotateX = ((e.clientY - rect.top)  / rect.height - .5) * -15;
    gsap.to(card, { rotateX, rotateY, transformPerspective:1000, duration:.4 });
});
card.addEventListener("mouseleave", () => {
    gsap.to(card, { rotateX:0, rotateY:0, duration:.8 });
});

/* ═══════════════════════════════════════════════
   BUTTON MAGNETIC
═══════════════════════════════════════════════ */
btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    gsap.to(btn, {
        x: (e.clientX - rect.left - rect.width/2)  * .3,
        y: (e.clientY - rect.top  - rect.height/2) * .3,
        duration:.3
    });
});
btn.addEventListener("mouseleave", () => {
    gsap.to(btn, { x:0, y:0, duration:.5 });
});
