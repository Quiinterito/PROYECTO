let userId = 0;

$(document).ready(async function () {
  $("#btn-schedule-appointment").on("click", async function () {
    let selectedServices = getSelectedServices();

    const appointmentData = {
      user_id: userId,
      date: $("#date").val(),
      hour: $("#time").val(),
      employee_id: $("#barber").val(),
      services: selectedServices,
    };

    const urlParams = new URLSearchParams(window.location.search);
    const appointmentId = urlParams.get("id");

    if (!appointmentId) {
      showLoader();
      await saveAppointmentAsync(appointmentData);
      hideLoader();
    } else {
      await updateAppointmentAsync(appointmentData, appointmentId);
    }

    userId = parseInt(localStorage.getItem("userId"));
    let userFullname = localStorage.getItem("userFullname");

    $("#client").val(userFullname);
    $("#date").val("");
    $("#time").val("");
    $("#barber").val("");
    $("#price").val("");
  });

  $("#service").on("mousedown", function (e) {
    e.preventDefault();

    var select = this;
    var scroll = select.scrollTop;

    e.target.selected = !e.target.selected;

    setTimeout(() => {
      select.scrollTop = scroll;
    }, 0);

    $(select).focus();

    let selectedServices = getSelectedServices();

    let price = calculateTotalPrice(selectedServices);

    $("#price").val(price);
  });
});

$(document).ready(async function () {
  showLoader();
  await getEmployeesAsync();
  await getServicesAsync();

  const urlParams = new URLSearchParams(window.location.search);
  const appointmentId = urlParams.get("id");

  if (appointmentId) {
    await loadAppointmentByIdAsync(appointmentId);
  } else {
    userId = parseInt(localStorage.getItem("userId"));
    let userFullname = localStorage.getItem("userFullname");

    $("#client").val(userFullname);
  }

  hideLoader();
});

function showLoader() {
  $("#loader").show();
}

function hideLoader() {
  $("#loader").hide();
}

async function saveAppointmentAsync(appointmentData) {
  // Solicitud POST al API
  try {
    const response = await fetch("http://localhost/api/appointments", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(appointmentData),
    });

    const data = await response.json();

    if (data?.appointment) {
      Swal.fire({
        title: "Agendar cita",
        text: "Cita agendada correctamente",
        icon: "success",
      });
    } else {
      let errorMessage = "Hubo un problema al agendar la cita <br>";

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
      text: "Hubo un error al agendar la cita",
      icon: "error",
    });
    console.error("Error en catch del fetch:", error);
  }
}

async function updateAppointmentAsync(appointmentData, appointmentId) {
  try {
    const result = await Swal.fire({
      title: "Agendar cita",
      text: "¿Está seguro de modificar la cita?",
      icon: "question",
      confirmButtonText: "Confirmar",
      showCancelButton: true,
    });

    if (result.isConfirmed) {
      showLoader();
      const response = await fetch(
        `http://localhost/api/appointments/${appointmentId}`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify(appointmentData),
        }
      );

      const data = await response.json();

      if (data?.appointment) {
        Swal.fire({
          title: "Agendar cita",
          text: "Cita modificada correctamente",
          icon: "success",
        });
      } else {
        let errorMessage = "Hubo un problema al modificar la cita <br>";

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
      hideLoader();
    }
  } catch (error) {
    Swal.fire({
      title: "Error",
      text: "Hubo un error al modificar la cita",
      icon: "error",
    });
    console.error("Error:", error);
    hideLoader();
  }
}

//Llamada usando fetch para obtener los barberos
async function getEmployeesAsync() {
  try {
    const response = await fetch("http://localhost/api/employees");
    const data = await response.json();
    fillBarbers(data.data);
  } catch (error) {
    console.error("Error al obtener barberos:", error);
  }
}

async function getServicesAsync() {
  try {
    const response = await fetch("http://localhost/api/services");
    const data = await response.json();
    fillServices(data.data);
  } catch (error) {
    console.error("Error al obtener servicios:", error);
  }
}

//Función para llenar el desplegable de barberos
function fillBarbers(barbers) {
  const barberDropdown = $("#barber");
  barberDropdown.empty(); // Limpiar opciones existentes

  barbers.forEach((barber) => {
    barberDropdown.append(
      $("<option></option>").val(barber.id).text(barber.name)
    );
  });
}

let servicesData = [];

//Función para llenar la lista de servicios
function fillServices(services) {
  servicesData = services;

  let formatter = getCurrencyFormatter();

  const serviceDropdown = $("#service");
  serviceDropdown.empty(); // Limpiar opciones existentes

  services.forEach((service) => {
    serviceDropdown.append(
      $("<option></option>")
        .val(service.id)
        .text(`${service.name} ......${formatter.format(service.price)}`)
    );
  });
}

async function loadAppointmentByIdAsync(appointmentId) {
  const appointmentData = await getAppointmentByIdAsync(appointmentId);

  let selectedServices = [];

  // Seleccionamos los servicios correctos en el dropdown
  for (const service of $("#service")[0].options) {
    service.selected = appointmentData.services.includes(
      parseInt(service.value)
    );

    if (service.selected) selectedServices.push(parseInt(service.value));
  }

  // Calcular el precio total
  let price = calculateTotalPrice(selectedServices);

  userId = parseInt(appointmentData.client.id);

  $("#client").val(
    `${appointmentData.client.name_user} ${appointmentData.client.surname_user}`
  );
  $("#date").val(appointmentData.date);
  $("#time").val(appointmentData.hour);
  $("#barber").val(appointmentData.barber.id);
  $("#price").val(price);
  $("#service").focus();
}

async function getAppointmentByIdAsync(appointmentId) {
  try {
    const response = await fetch(
      `http://localhost/api/appointments/${appointmentId}`
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error al obtener los datos de la cita:", error);
  }
}

// Función para calcular el precio total de los servicios seleccionados
function calculateTotalPrice(selectedServices) {
  let totalPrice = 0;

  // Crear un objeto `Intl.NumberFormat` y configurarlo para el formato de moneda colombiano.
  let formatter = getCurrencyFormatter();

  // Recorremos cada servicio seleccionado
  for (let serviceId of selectedServices) {
    // Buscamos el servicio correspondiente en servicesData
    let service = servicesData.find((s) => s.id === parseInt(serviceId));

    // Si encontramos el servicio, sumamos su precio al total
    if (service) {
      totalPrice += parseFloat(service.price);
    }
  }

  return formatter.format(totalPrice);
}

function getCurrencyFormatter() {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
  });
}

function getSelectedServices() {
  let selectedOptions = $("#service")[0].selectedOptions;

  let selectedServices = [];

  for (let option of selectedOptions) {
    selectedServices.push(option.value);
  }

  return selectedServices;
}
