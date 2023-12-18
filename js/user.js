$(document).ready(async function () {
  showLoader();
  await loadUserDataAsync();
  hideLoader();
});

$(document).ready(async function () {
  $("#btn-show-update-password").on("click", async function () {
    await showChangePasswordModal();
  });

  $("#btn-update-user").on("click", async function () {
    const userData = getFormData();

    const userId = localStorage.getItem("userId");

    showLoader();
    await updateUserAsync(userData, userId);
    hideLoader();
  });
});

function showLoader() {
  $("#loader").show();
}

function hideLoader() {
  $("#loader").hide();
}

async function loadUserDataAsync() {
  const token = localStorage.getItem("authToken");
  const userData = await getUserAsync(token);

  $("#name").val(userData.name_user);
  $("#surname").val(userData.surname_user);
  $("#phone").val(userData.phone);
  $("#email").val(userData.email);
  $("#user").val(userData.name);
  $("#date").val(userData.birthdate);
  $("#gender").val(userData.gender);
}

function getFormData() {
  return (formData = {
    name_user: $("#name").val(),
    surname_user: $("#surname").val(),
    phone: $("#phone").val(),
    email: $("#email").val(),
    name: $("#user").val(),
    birthdate: $("#date").val(),
    gender: $("#gender").val(),
  });
}

async function showChangePasswordModal() {
  const modal = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success mr-3",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });

  const result = await modal.fire({
    title: "Cambiar Contraseña",
    html: `
        <div class="col-sm-12" style="text-align: left;">
            <form id="changePasswordForm">
                <div class="col-sm-12">
                    <div class="row">
                        <div class="col-sm-6 form-group">
                            <label for="password">Contraseña</label>
                            <input
                                class="form-control"
                                placeholder="Contraseña"
                                type="password"
                                id="password"
                            />
                        </div>
                        <div class="col-sm-6 form-group">
                            <label for="confirm_password">Confirmar Contraseña</label>
                            <input
                                class="form-control"
                                placeholder="Confirmar Contraseña"
                                type="password"
                                id="confirm_password"
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
        `,
    confirmButtonText: "Actualizar",
    showCancelButton: true,
    width: 800,
  });

  if (result.isConfirmed) {
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm_password").value;

    const userId = parseInt(localStorage.getItem("userId"));

    const passwordData = {
      password: password,
    };

    if (password !== confirmPassword) {
      Swal.fire({
        title: "Validación fallida",
        text: "Las contraseñas no coinciden",
        icon: "warning",
      });
    } else {
      try {
        showLoader();
        await updatePasswordAsync(passwordData, userId);
        hideLoader();
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "Hubo un error al eliminar la cita",
          icon: "error",
        });
        console.error("Error:", error);
        hideLoader();
      }
    }
  }
}

async function getUserAsync(token) {
  try {
    const response = await fetch("http://localhost/api/user", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
        "content-type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener los datos del usuario:", error);
  }
}

async function updateUserAsync(userData, userId) {
  try {
    const response = await fetch(`http://localhost/api/users/${userId}`, {
      method: "PUT",
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
        title: "Editar Usuario",
        text: "Usuario editado correctamente",
        icon: "success",
      });
    } else {
      let errorMessage = "Hubo un problema al editar al usuario <br>";

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
    Swal.fire({
      title: "Error",
      text: "Hubo un error al editar al usuario",
      icon: "error",
    });
    console.error("Error en catch del fetch:", error);
  }
}

async function updatePasswordAsync(passwordData, userId) {
  try {
    const response = await fetch(
      `http://localhost/api/users/update-password/${userId}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(passwordData),
      },
    );

    const data = await response.json();

    if (data?.user) {
      Swal.fire({
        title: "Actualizar contraseña",
        text: "Contraseña actualizada correctamente",
        icon: "success",
      });
    } else {
      let errorMessage = "Hubo un problema al actualizar la contraseña <br>";

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
    Swal.fire({
      title: "Error",
      text: "Hubo un error al actualizar la contraseña",
      icon: "error",
    });
    console.error("Error en catch del fetch:", error);
  }
}
