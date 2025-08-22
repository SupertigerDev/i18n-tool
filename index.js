const rootEl = document.getElementById("root");

const caughtJSON = (json) => {
  try {
    return JSON.parse(json);
  } catch (error) {
    return {};
  }
};

const createLocalStorage = () => {
  const getRawDefaultLanguage = () =>
    localStorage.getItem("defaultLanguage") || "";
  const getRawTranslatedLanguage = () =>
    localStorage.getItem("translatedLanguage") || "";

  const getDefaultLanguage = () => caughtJSON(getRawDefaultLanguage());
  const getTranslatedLanguage = () => caughtJSON(getRawTranslatedLanguage());

  const setDefaultLanguage = (value) =>
    localStorage.setItem("defaultLanguage", value);
  const setTranslatedLanguage = (value) =>
    localStorage.setItem("translatedLanguage", value);

  if (!getRawDefaultLanguage()) {
    setDefaultLanguage(
      JSON.stringify(
        {
          loginPage: {
            title: "Login to continue",
            username: "Username",
            password: "Password",
          },
        },
        null,
        2
      )
    );
  }

  return {
    getDefaultLanguage: getRawDefaultLanguage,
    getTranslatedLanguage: getRawTranslatedLanguage,
    setDefaultLanguage,
    setTranslatedLanguage,
    getRawDefaultLanguage,
    getRawTranslatedLanguage,
  };
};

const storage = createLocalStorage();

const createDefaultLanguageInput = () => {
  const el = document.createElement("div");
  el.classList.add("pane", "default-language-input-container");

  el.innerHTML = `
    <div class="title">Default Language</div>
    <textarea id="default-language-input"></textarea>
    <textarea id="translated-language-input"></textarea>
  `;

  const defaultInput = el.querySelector("#default-language-input");
  const translatedInput = el.querySelector("#translated-language-input");

  defaultInput.value = storage.getDefaultLanguage();
  translatedInput.value = storage.getTranslatedLanguage();

  defaultInput.placeholder = JSON.stringify(
    {
      loginPage: {
        title: "Login to continue",
        username: "Username",
        password: "Password",
      },
    },
    null,
    2
  );
  translatedInput.placeholder = JSON.stringify(
    {
      loginPage: {
        title: "Ingrese para continuar",
        username: "usuario",
        password: "Contraseña",
      },
    },
    null,
    2
  );

  const onChange = () => {
    const defaultValue = defaultInput.value;
    const translatedValue = translatedInput.value;

    storage.setDefaultLanguage(defaultValue);
    storage.setTranslatedLanguage(translatedValue);
  };

  defaultInput.addEventListener("input", onChange);
  translatedInput.addEventListener("input", onChange);

  rootEl.appendChild(el);
};

createDefaultLanguageInput();
