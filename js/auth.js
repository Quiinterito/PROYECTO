$(document).ready(function () {
  authValidations();
  setUserData();
});

$(document).ready(function () {
  $("#btn-logout").on("click", function () {
    logout();

    window.location.href = "index.html";
  });
});

function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userFullname");
}

function authValidations() {
  let token = localStorage.getItem("authToken");

  let currentURL = window.location.href.toLowerCase();

  if (
    (currentURL.endsWith("login.html") ||
      currentURL.endsWith("index.html") ||
      currentURL.endsWith("sign-up.html")) &&
    token !== null
  ) {
    // Redirige al usuario a home.html
    window.location.href = "./home.html";
  }

  // Si el usuario NO tiene token y NO está en login ni index, redirige a login
  if (
    !currentURL.endsWith("login.html") &&
    !currentURL.endsWith("index.html") &&
    !currentURL.endsWith("sign-up.html") &&
    token === null
  ) {
    window.location.href = "login.html";
  }
}

function setUserData() {
  let userFullname = localStorage.getItem("userFullname");

  if (userFullname) {
    $("#dropdownMenuLink").text(userFullname);
  }
}
