const rootEl = document.getElementById("root");

/**
 *
 * @param {object} trans
 * @returns {{key: string[], value: string}[]}
 */
const flatternTranslations = (trans) => {
  const keys = Object.keys(trans);
  const newArr = [];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = trans[key];
    if (typeof value === "string") {
      newArr.push({ key: [key], value });
    } else {
      flatternTranslations(value).forEach((item) => {
        newArr.push({ ...item, key: [key, ...item.key] });
      });
    }
  }
  return newArr;
};

/**
 * Updates a nested object by creating or modifying values based on an array of keys.
 * This function handles cases where the intermediate keys may not exist, ensuring
 * the correct nested structure is created.
 *
 * @param {string[]} keys - An array of strings representing the nested path (e.g., ['test', 'kik']).
 * @param {*} value - The value to be assigned at the end of the nested path.
 * @param {object} [obj={}] - The object to be updated. It will be created if not provided.
 * @returns {object} The modified or new object.
 */
const updateNestedObject = (keys, value, obj = {}) => {
  // Start with a reference to the original object.
  let currentLevel = obj;

  // Iterate over the keys to traverse or build the nested path.
  // We stop at the second-to-last key, as the last key will receive the final value.
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];

    // Check if the current key exists on the current level.
    if (!currentLevel[key] || typeof currentLevel[key] !== "object") {
      // If the key doesn't exist, or its value is not an object,
      // create an empty object for it.
      currentLevel[key] = {};
    }

    // Move the reference to the next level of the object.
    currentLevel = currentLevel[key];
  }

  // At the end of the loop, `currentLevel` is the object where the final
  // key and value should be assigned.
  const lastKey = keys[keys.length - 1];
  currentLevel[lastKey] = value;

  // Return the original object which has now been updated.
  return obj;
};

const caughtJSON = (json) => {
  try {
    return JSON.parse(json);
  } catch (error) {
    return {};
  }
};

const createLocalStorage = () => {
  let updateEventHandlers = [];

  const getRawDefaultLanguage = () =>
    localStorage.getItem("defaultLanguage") || "";
  const getRawTranslatedLanguage = () =>
    localStorage.getItem("translatedLanguage") || "";

  const getDefaultLanguage = () => caughtJSON(getRawDefaultLanguage());
  const getTranslatedLanguage = () => caughtJSON(getRawTranslatedLanguage());

  const setDefaultLanguage = (value) => {
    localStorage.setItem("defaultLanguage", value);
    updateEventHandlers.forEach((cb) => cb());
  };
  const setTranslatedLanguage = (value) => {
    localStorage.setItem("translatedLanguage", value);
    updateEventHandlers.forEach((cb) => cb());
  };

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

  const onUpdate = (cb) => {
    updateEventHandlers.push(cb);
  };
  const offUpdate = (cb) => {
    updateEventHandlers = updateEventHandlers.filter((item) => item !== cb);
  };
  return {
    onUpdate,
    offUpdate,
    getDefaultLanguage,
    getTranslatedLanguage,
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
    <div class="title">Translated Language</div>
    <textarea id="translated-language-input"></textarea>
  `;

  const defaultInput = el.querySelector("#default-language-input");
  const translatedInput = el.querySelector("#translated-language-input");

  defaultInput.value = storage.getRawDefaultLanguage();
  translatedInput.value = storage.getRawTranslatedLanguage();

  storage.onUpdate(() => {
    defaultInput.value = storage.getRawDefaultLanguage();
    translatedInput.value = storage.getRawTranslatedLanguage();
  });

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

const createTranslateItem = (key, value, translated) => {
  const el = document.createElement("div");
  el.classList.add("translate-item");
  el.innerHTML = `
    <div class="key">${key.join(".")}</div>
    <div class="value"></div>
    <input class="input" placeholder="Translate" type="text" value="${translated}"></input>
  `;
  const valueEl = el.querySelector(".value");
  valueEl.textContent = value;

  const input = el.querySelector(".input");

  if (!translated.trim()) {
    input.classList.add("no-input");
  }

  input.addEventListener("input", () => {
    const value = el.querySelector(".input").value;

    if (!value.trim()) {
      input.classList.add("no-input");
    } else {
      input.classList.remove("no-input");
    }

    const translatedObj = storage.getTranslatedLanguage() || {};

    storage.setTranslatedLanguage(
      JSON.stringify(
        updateNestedObject(key, value.trim() || undefined, translatedObj),
        null,
        2
      )
    );
  });

  return { el };
};
const createTranslateList = () => {
  const el = document.createElement("div");
  el.classList.add("pane", "translate-container");

  const defaultStrings = flatternTranslations(storage.getDefaultLanguage());
  const translatedStrings = flatternTranslations(
    storage.getTranslatedLanguage() || {}
  );

  const defaultStringsLength = defaultStrings.length;
  const translatedStringsLength = translatedStrings.length;

  const translatedPercent =
    ((translatedStringsLength / defaultStringsLength) * 100).toFixed(2) + "%";

  const detailsEl = document.createElement("div");
  detailsEl.classList.add("details");
  detailsEl.innerHTML = `
    <div class="out-of">${translatedStringsLength}/${defaultStringsLength}</div>
    <div class="percent">(${translatedPercent})</div>
  `;

  storage.onUpdate(() => {
    const defaultStrings = flatternTranslations(storage.getDefaultLanguage());
    const translatedStrings = flatternTranslations(
      storage.getTranslatedLanguage() || {}
    );

    const defaultStringsLength = defaultStrings.length;
    const translatedStringsLength = translatedStrings.length;

    const translatedPercent =
      ((translatedStringsLength / defaultStringsLength) * 100).toFixed(2) + "%";

    detailsEl.classList.add("details");
    detailsEl.innerHTML = `
    <div class="out-of">${translatedStringsLength}/${defaultStringsLength}</div>
    <div class="percent">(${translatedPercent})</div>
  `;
  });

  el.appendChild(detailsEl);

  const transListEl = document.createElement("div");
  transListEl.classList.add("translate-list");

  defaultStrings.forEach((item) => {
    const translated = translatedStrings.find(
      (i) => i.key.join(".") === item.key.join(".")
    );
    const transItem = createTranslateItem(
      item.key,
      item.value,
      translated?.value || ""
    );
    transItem.el.classList.add("default-language-item");
    transItem.el.addEventListener("click", () => {});

    transListEl.appendChild(transItem.el);
  });

  el.appendChild(transListEl);

  rootEl.appendChild(el);
};

createTranslateList();
