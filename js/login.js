$(document).ready(async function () {
  hideLoader();
});

function showLoader() {
  $("#loader").show();
}

function hideLoader() {
  $("#loader").hide();
}

$(document).ready(async function () {
  $("#btn-login").on("click", async function () {
    const userData = {
      email: $("#email").val(),
      password: $("#password").val(),
    };

    showLoader();
    await authAsync(userData);
    hideLoader();
  });
});

async function authAsync(userData) {
  // Solicitud POST al API
  try {
    const response = await fetch("http://localhost/api/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (data?.user) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("username", data.user.name);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userRole", data.user.permission);
      localStorage.setItem(
        "userFullname",
        `${data.user.name_user} ${data.user.surname_user}`
      );

      window.location.href = "./home.html";
    } else {
      let errorMessage = "Hubo un problema al iniciar sesión <br>";

      if (data.errors) {
        Object.entries(data.errors).forEach(([field, errorMessages]) => {
          errorMessages.forEach((message) => {
            errorMessage += `<br>${message}`;
          });
        });
      }

      Swal.fire({
        title: "Error",
        html: errorMessage,
        icon: "error",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      title: "Error",
      text: "Hubo un error al iniciar sesión",
      icon: "error",
    });
    console.error("Error en catch del fetch:", error);
  }
}
