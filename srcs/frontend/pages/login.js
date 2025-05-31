import { EventSystem } from "../src/api/EventSystem.js";

export async function loginPage() {
  // Parent container
  const container = document.createElement( "div" );
  container.className = "login-page container py-5 d-flex justify-content-center";

  // Card
  const card = document.createElement( "div" );
  card.className = "card p-4 shadow-sm";
  card.style.maxWidth = "500px";
  card.style.width = "100%";

  // Title
  const title = document.createElement( "h2" );
  title.className = "mb-3 text-center";
  title.textContent = "Welcome";

  // Subtitle
  const subtitle = document.createElement( "p" );
  subtitle.className = "mb-4 text-center text-muted";
  subtitle.textContent = "Please choose an option below.";

  // --- Navigation Tabs ---
  const navWrapper = document.createElement( "ul" );
  navWrapper.className = "nav nav-tabs mb-3 justify-content-center";

  const loginTabItem = document.createElement( "li" );
  loginTabItem.className = "nav-item";
  const loginTabLink = document.createElement( "a" );
  loginTabLink.className = "nav-link active";
  loginTabLink.href = "#";
  loginTabLink.textContent = "Login";
  loginTabItem.appendChild( loginTabLink );

  const registerTabItem = document.createElement( "li" );
  registerTabItem.className = "nav-item";
  const registerTabLink = document.createElement( "a" );
  registerTabLink.className = "nav-link";
  registerTabLink.href = "#";
  registerTabLink.textContent = "Register";
  registerTabItem.appendChild( registerTabLink );

  const remoteAuthTabItem = document.createElement( "li" );
  remoteAuthTabItem.className = "nav-item";
  const remoteAuthTabLink = document.createElement( "a" );
  remoteAuthTabLink.className = "nav-link";
  remoteAuthTabLink.href = "#";
  remoteAuthTabLink.textContent = "Remote Auth";
  remoteAuthTabItem.appendChild( remoteAuthTabLink );

  navWrapper.appendChild( loginTabItem );
  navWrapper.appendChild( registerTabItem );
  navWrapper.appendChild( remoteAuthTabItem );

  // --- Alert Box for Errors / Warnings ---
  const alertBox = document.createElement( "div" );
  alertBox.className = "alert alert-danger d-none";
  alertBox.setAttribute( "role", "alert" );
  alertBox.textContent = "";

  // --- Login Form ---
  const loginForm = document.createElement( "form" );
  loginForm.className = "needs-validation";

  const usernameGroupLogin = document.createElement( "div" );
  usernameGroupLogin.className = "mb-3";
  usernameGroupLogin.innerHTML = `
    <label for="loginUsername" class="form-label">Username</label>
    <input
      type="text"
      id="loginUsername"
      name="username"
      class="form-control"
      placeholder="Enter username"
      required
    />
  `;

  const passwordGroupLogin = document.createElement( "div" );
  passwordGroupLogin.className = "mb-3 position-relative";
  passwordGroupLogin.innerHTML = `
    <label for="loginPassword" class="form-label">Password</label>
    <input
      type="password"
      id="loginPassword"
      name="password"
      class="form-control"
      placeholder="Enter password"
      required
    />
  `;

  const loginBtn = document.createElement( "button" );
  loginBtn.type = "submit";
  loginBtn.className = "btn btn-primary w-100 mt-3";
  loginBtn.textContent = "Login";

  loginForm.appendChild( usernameGroupLogin );
  loginForm.appendChild( passwordGroupLogin );
  loginForm.appendChild( loginBtn );

  loginForm.addEventListener( "submit", ( event ) => {
    event.preventDefault();
    alertBox.classList.add( "d-none" );

    const { username, password } = loginForm.elements;
    if ( !username.value.trim() || !password.value.trim() ) {
      alertBox.classList.remove( "d-none" );
      alertBox.textContent = "Username and password must not be empty.";
      return;
    }

    try {
      EventSystem.emit( "login-form-submit", {
        username: username.value.trim(),
        password: password.value,
      } );
    } catch ( error ) {
      alertBox.classList.remove( "d-none" );
      alertBox.textContent = `Login failed. ${error.message}`;
      console.error( "Login error:", error );
    }
  } );

  // --- Register Form ---
  const registerForm = document.createElement( "form" );
  registerForm.className = "needs-validation d-none";

  const usernameGroupReg = document.createElement( "div" );
  usernameGroupReg.className = "mb-3";
  usernameGroupReg.innerHTML = `
    <label for="registerUsername" class="form-label">Username</label>
    <input
      type="text"
      id="registerUsername"
      name="username"
      class="form-control"
      placeholder="Enter username"
      required
    />
  `;

  const emailGroupReg = document.createElement( "div" );
  emailGroupReg.className = "mb-3";
  emailGroupReg.innerHTML = `
    <label for="registerEmail" class="form-label">Email</label>
    <input
      type="email"
      id="registerEmail"
      name="email"
      class="form-control"
      placeholder="Enter email"
      required
    />
  `;

  const passwordGroupReg = document.createElement( "div" );
  passwordGroupReg.className = "mb-3 position-relative";
  passwordGroupReg.innerHTML = `
    <label for="registerPassword" class="form-label">Password</label>
    <input
      type="password"
      id="registerPassword"
      name="password"
      class="form-control"
      placeholder="Enter password"
      required
    />
  `;

  const registerBtn = document.createElement( "button" );
  registerBtn.type = "submit";
  registerBtn.className = "btn btn-success w-100 mt-3";
  registerBtn.textContent = "Register";

  registerForm.appendChild( usernameGroupReg );
  registerForm.appendChild( emailGroupReg );
  registerForm.appendChild( passwordGroupReg );
  registerForm.appendChild( registerBtn );

  registerForm.addEventListener( "submit", ( event ) => {
    event.preventDefault();
    alertBox.classList.add( "d-none" );

    const { username, email, password } = registerForm.elements;
    if ( !username.value.trim() || !email.value.trim() || !password.value.trim() ) {
      alertBox.classList.remove( "d-none" );
      alertBox.textContent = "All fields (username, email, password) are required.";
      return;
    }

    EventSystem.emit( "register-form-submit", {
      username: username.value.trim(),
      email: email.value.trim(),
      password: password.value,
    } );
  } );

  // --- Ecole 42 Remote Auth Section ---
  // This section is revealed when the "Remote Auth" tab is clicked.
  const remoteAuthSection = document.createElement( "div" );
  remoteAuthSection.className = "d-none";

  const remoteTitle = document.createElement( "h5" );
  remoteTitle.textContent = "Sign in with a Remote Provider";
  remoteTitle.className = "mb-3";
  remoteAuthSection.appendChild( remoteTitle );

  // Example: "Login with 42" button
  const ecole42Button = document.createElement( "button" );
  ecole42Button.type = "button";
  ecole42Button.className = "btn btn-outline-secondary w-100 mb-2";
  ecole42Button.textContent = "Login with 42";

  // When clicked, either do a redirect or emit an event for your main app to handle
  ecole42Button.addEventListener( "click", () => {
    // Option A: Emit an event your main code can handle:

    window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-3cafa2bbf70d7d822581950d88a0ea056581e80d49919f33c78ecd45b192caa2&redirect_uri=http%3A%2F%2F10.11.244.64%2F&response_type=code';
  } );

  remoteAuthSection.appendChild( ecole42Button );

  // Add more remote providers if needed (GitHub, Google, etc.)

  // ********************************************************
  //   TABS
  // ********************************************************
  loginTabLink.addEventListener( "click", ( e ) => {
    e.preventDefault();
    e.stopPropagation();
    registerTabLink.classList.remove( "active" );
    remoteAuthTabLink.classList.remove( "active" );
    loginTabLink.classList.add( "active" );

    registerForm.classList.add( "d-none" );
    remoteAuthSection.classList.add( "d-none" );
    loginForm.classList.remove( "d-none" );
    alertBox.classList.add( "d-none" );
  } );

  registerTabLink.addEventListener( "click", ( e ) => {
    e.preventDefault();
    e.stopPropagation();
    loginTabLink.classList.remove( "active" );
    remoteAuthTabLink.classList.remove( "active" );
    registerTabLink.classList.add( "active" );

    loginForm.classList.add( "d-none" );
    remoteAuthSection.classList.add( "d-none" );
    registerForm.classList.remove( "d-none" );
    alertBox.classList.add( "d-none" );
  } );

  remoteAuthTabLink.addEventListener( "click", ( e ) => {
    e.preventDefault();
    e.stopPropagation();
    loginTabLink.classList.remove( "active" );
    registerTabLink.classList.remove( "active" );
    remoteAuthTabLink.classList.add( "active" );

    loginForm.classList.add( "d-none" );
    registerForm.classList.add( "d-none" );
    remoteAuthSection.classList.remove( "d-none" );
    alertBox.classList.add( "d-none" );

    // Possibly emit a global event if you want to do something 
    // else when switching to remote auth:
  } );

  // ********************************************************
  //   ASSEMBLE EVERYTHING
  // ********************************************************
  card.appendChild( title );
  card.appendChild( subtitle );
  card.appendChild( navWrapper ); // The tabs
  card.appendChild( alertBox );
  card.appendChild( loginForm );
  card.appendChild( registerForm );
  card.appendChild( remoteAuthSection );

  container.appendChild( card );
  return container;
}
