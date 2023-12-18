$(document).ready(function () {
  hideLoader();

  $("#btn-register").on("click", async function () {
    // Recopilando los datos del formulario
    const userData = {
      name_user: $("#name").val(),
      surname_user: $("#surname").val(),
      phone: $("#phone").val(),
      email: $("#email").val(),
      name: $("#user").val(),
      password: $("#password").val(),
      birthdate: $("#date").val(),
      gender: $("#barber").val(),
      permission: "client",
    };

    showLoader();
    await saveData(userData);
    hideLoader();
  });
});

async function saveData(userData) {
  // Solicitud POST al API
  try {
    const response = await fetch("http://localhost/api/register", {
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
      Swal.fire({
        title: "Crear cuenta",
        text: "Usuario creado correctamente",
        icon: "success",
      });
      clearForm();
    } else {
      let errorMessage = "Hubo un problema al crear el usuario <br>";

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
      text: "Hubo un error al crear el usuario",
      icon: "error",
    });
    console.error("Error en catch del fetch:", error);
  }
}

function clearForm() {
  $("#name").val("");
  $("#surname").val("");
  $("#phone").val("");
  $("#email").val("");
  $("#user").val("");
  $("#password").val("");
  $("#date").val("");
  $("#barber").val("");
}

function showLoader() {
  $("#loader").show();
}

function hideLoader() {
  $("#loader").hide();
}
