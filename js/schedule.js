let scheduledAppointments = [];
let services = [];
let filteredData = [];

$(document).ready(async function () {
  showLoader();
  await loadDataAsync();
  await loadTableAsync();
  hideLoader();
});

// Obtiene la información para cargar en la tabla
async function loadDataAsync() {
  scheduledAppointments = await getScheduledAppointments();
  services = await getServices();
  filteredData = scheduledAppointments;
}

// Llena la tabla y muestra la primera página al cargar la página web
async function loadTableAsync() {
  populateTable();
  displayPage();
  updatePagination();
}

function showLoader() {
  $("#loader").show();
}

function hideLoader() {
  $("#loader").hide();
}

async function getScheduledAppointments() {
  try {
    const userId = localStorage.getItem("userId");
    const response = await fetch(
      `http://localhost/api/appointments/get-appointments-by-user-and-role/${userId}`,
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error al obtener las citas:", error);
  }
}

async function getServices() {
  try {
    const response = await fetch("http://localhost/api/services");
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error al obtener servicios:", error);
  }
}

$(document).ready(async function () {
  $("#select-barber").on("change", async function () {
    await filterByBarberAsync();
  });
});

let currentPage = 0;
const rowsPerPage = 5;

async function filterByBarberAsync() {
  const selectedBarberId = document.getElementById("select-barber").value;

  if (selectedBarberId != 0)
    filteredData = scheduledAppointments.filter(
      (item) => item.barber.id == selectedBarberId,
    );
  else filteredData = scheduledAppointments;
  await loadTableAsync();
}

function populateTable() {
  const tableBody = document
    .getElementById("data-table")
    .getElementsByTagName("tbody")[0];

  tableBody.innerHTML = ""; // Limpiar la tabla primero

  filteredData.forEach((item) => {
    let serviceNamesArray = []; // para almacenar los nombres de los servicios

    item.services.forEach((id) => {
      // encontrar el servicio con el ID correspondiente y almacenar su nombre
      const service = services.find((s) => s.id === parseInt(id));
      if (service) {
        serviceNamesArray.push(service.name);
      }
    });

    // convertir el array de nombres de servicios nuevamente en una cadena
    const serviceNames = serviceNamesArray.join(", ");

    const row = document.createElement("tr");

    row.innerHTML = `
        <td class="d-none">${item.id}</td>
        <td class="d-none">${item.barber.id}</td>
        <td>${item.barber.name}</td>
        <td class="d-none">${item.services}</td>
        <td>${serviceNames}</td>
        <td class="d-none">${item.client.id}</td>
        <td>${item.client.name_user} ${item.client.surname_user}</td>
        <td>${item.date}</td>
        <td>${item.hour}</td>
        <td>
            <button type="button" class="btn btn-primary" onclick="editRecord('${item.id}')">Editar</button>
            <button type="button" class="btn btn-danger" onclick="deleteRecordAsync('${item.id}')">Eliminar</button>
        </td>
    `;

    // <button type="button" class="btn btn-success" onclick="invoiceRecord('${item.id}')">Facturar</button>

    tableBody.appendChild(row);
  });
}

function changePage(pageNumber) {
  currentPage = pageNumber;
  displayPage();
}

function displayPage() {
  const table = document.getElementById("data-table");
  const rows = table
    .getElementsByTagName("tbody")[0]
    .getElementsByTagName("tr");
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  for (let i = 0; i < rows.length; i++) {
    if (i >= startIndex && i < endIndex) {
      rows[i].style.display = "";
    } else {
      rows[i].style.display = "none";
    }
  }
}

function updatePagination() {
  const paginationContainer = document.querySelector(".pagination");
  const totalRecords = filteredData.length;
  const numberOfPages = Math.ceil(totalRecords / rowsPerPage);

  paginationContainer.innerHTML = ""; // Limpiar los botones anteriores

  for (let i = 0; i < numberOfPages; i++) {
    const li = document.createElement("li");
    li.className = "page-item";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "page-link";
    btn.innerText = i + 1;
    btn.addEventListener("click", function () {
      changePage(i);
    });

    li.appendChild(btn);
    paginationContainer.appendChild(li);
  }
}

function invoiceRecord(id) {
  window.location.href = "./invoice.html?id=" + encodeURIComponent(id);
}

function editRecord(barberId) {
  window.location.href =
    "./schedule-appointment.html?id=" + encodeURIComponent(barberId);
}

async function deleteRecordAsync(id) {
  try {
    const result = await Swal.fire({
      title: "Consultar agenda",
      text: "¿Está seguro de eliminar el registro?",
      icon: "question",
      confirmButtonText: "Confirmar",
      showCancelButton: true,
    });

    if (result.isConfirmed) {
      showLoader();
      const response = await fetch(`http://localhost/api/appointments/${id}`, {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      const data = await response.json();

      if (data?.appointment) {
        await loadDataAsync();
        await loadTableAsync();

        Swal.fire({
          title: "Agendar cita",
          text: "Cita eliminada correctamente",
          icon: "success",
        });
      } else {
        let errorMessage = "Hubo un problema al eliminar la cita <br>";

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
      text: "Hubo un error al eliminar la cita",
      icon: "error",
    });
    console.error("Error:", error);
    hideLoader();
  }
}
