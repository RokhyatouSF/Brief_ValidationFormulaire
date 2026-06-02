/**
 * =========================
 * DOM REFERENCES
 */

const form = document.querySelector("#form");

const firstName = document.querySelector("#firstName");
const lastName = document.querySelector("#lastName");
const email = document.querySelector("#email");
const domain = document.querySelector("#domain");
const bio = document.querySelector("#bio");

const radios = document.querySelectorAll("input[name='rythme']");
const checkboxes = document.querySelectorAll("input[name='interets']");

const charCounter = document.querySelector("#charCounter");
const profileContainer = document.querySelector("#profileContainer");

/**
 * =========================
 * UTILITIES
 * =========================
 */

function sanitize(value) {
    return value.trim();
}

function setError(input, message) {
    const group = input.closest(".form-group");
    const error = group?.querySelector(".error-message");

    input.classList.add("input-error");
    input.classList.remove("input-success");

    if (error) error.textContent = message;
}

function setSuccess(input) {
    const group = input.closest(".form-group");
    const error = group?.querySelector(".error-message");

    input.classList.remove("input-error");
    input.classList.add("input-success");

    if (error) error.textContent = "";
}

/**
 * =========================
 * VALIDATIONS
 * =========================
 */

function validateName(input, label) {
    const value = sanitize(input.value);
    if (value.length < 3) {
        setError(input, `${label} doit contenir au moins 3 caractères`);
        return false;
    }
    setSuccess(input);
    return true;
}

function validateEmail() {
    const value = sanitize(email.value);
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(value)) {
        setError(email, "Email invalide (ex: nom@domaine.com)");
        return false;
    }
    setSuccess(email);
    return true;
}

function validateDomain() {
    if (domain.value === "") {
        setError(domain, "Veuillez choisir un domaine");
        return false;
    }
    setSuccess(domain);
    return true;
}

function validateRadio() {
    const group = document.querySelector("#radioGroup");
    const error = group?.querySelector(".error-message");
    const checked = [...radios].some(r => r.checked);

    if (!checked) {
        if (error) error.textContent = "Choix obligatoire";
        return false;
    }
    if (error) error.textContent = "";
    return true;
}

function validateCheckboxes() {
    const group = document.querySelector("#checkboxGroup");
    const error = group?.querySelector(".error-message");
    const checkedCount = [...checkboxes].filter(c => c.checked).length;

    if (checkedCount < 2) {
        if (error) error.textContent = "Choisir au moins 2 intérêts";
        return false;
    }
    if (error) error.textContent = "";
    return true;
}

function validateBio() {
    const value = sanitize(bio.value);
    if (value.length < 25) {
        setError(bio, "Minimum 25 caractères requis");
        return false;
    }
    if (value.length > 255) {
        setError(bio, "Maximum 255 caractères");
        return false;
    }
    setSuccess(bio);
    return true;
}

/**
 * =========================
 * VALIDATION AUTOMATIQUE (TEMPS RÉEL)
 * =========================
 */

// Validation automatique dès la saisie
firstName.addEventListener("input", () => validateName(firstName, "Prénom"));
lastName.addEventListener("input", () => validateName(lastName, "Nom"));
email.addEventListener("input", validateEmail);
domain.addEventListener("change", validateDomain);

bio.addEventListener("input", () => {
    const remaining = 255 - bio.value.length;
    charCounter.textContent = `${remaining} caractères restants`;
    validateBio();
});

// Radio & Checkboxes
radios.forEach(radio => {
    radio.addEventListener("change", validateRadio);
});

checkboxes.forEach(cb => {
    cb.addEventListener("change", validateCheckboxes);
});

/**
 * =========================
 * FORM SUBMIT
 * =========================
 */

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const isValid = 
        validateName(firstName, "Prénom") &&
        validateName(lastName, "Nom") &&
        validateEmail() &&
        validateDomain() &&
        validateRadio() &&
        validateCheckboxes() &&
        validateBio();

    if (!isValid) {
        return;
    }

    // Récupération des données
    const selectedRadio = [...radios].find(r => r.checked)?.value;
    const selectedInterests = [...checkboxes]
        .filter(c => c.checked)
        .map(c => c.value);

    const data = {
        firstName: sanitize(firstName.value),
        lastName: sanitize(lastName.value),
        email: sanitize(email.value),
        domain: domain.value,
        rythme: selectedRadio,
        interets: selectedInterests,
        bio: sanitize(bio.value)
    };

    createProfile(data);

    // Reset du formulaire
    form.reset();
    charCounter.textContent = "255 caractères restants";
    document.querySelectorAll(".input-success").forEach(el => el.classList.remove("input-success"));
    profileContainer.scrollIntoView({ behavior: "smooth" });
});

/**
 * =========================
 * PROFILE CREATION
 * =========================
 */

function createProfile(data) {
    profileContainer.innerHTML = `
        <div class="profile-card" style="background:rgba(58, 211, 148, 0.1); padding:25px; border-radius:12px; margin-top:30px; border:1px solid var(--accent-green);">
            <h2 style="color:#3ad394;">✅ Profil créé avec succès !</h2>
            <p><strong>Nom :</strong> ${data.firstName} ${data.lastName}</p>
            <p><strong>Email :</strong> ${data.email}</p>
            <p><strong>Domaine :</strong> ${data.domain}</p>
            <p><strong>Rythme :</strong> ${data.rythme === 'early-bird' ? '☀️ Early Bird' : '🦉 Night Owl'}</p>
            <p><strong>Intérêts :</strong> ${data.interets.join(", ")}</p>
            <p><strong>Bio :</strong> ${data.bio}</p>
        </div>
    `;
}