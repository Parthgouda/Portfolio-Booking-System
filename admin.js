let allBookings = [];

let statusChart;
let bookingChart;
let monthlyChart;

const searchInput =
document.getElementById("searchInput");

const statusFilter =
document.getElementById("statusFilter");

if (
  localStorage.getItem("adminLoggedIn")
  !== "true"
){
  window.location.href =
  "admin-login.html";
}

const totalBookings =
document.getElementById("totalBookings");

const pendingBookings =
document.getElementById("pendingBookings");

const progressBookings =
document.getElementById("progressBookings");

const completedBookings =
document.getElementById("completedBookings");

const totalRevenue =
document.getElementById("totalRevenue");

const completedRevenue =
document.getElementById("completedRevenue");

const pendingRevenue =
document.getElementById("pendingRevenue");

/* ========================= */
/* CHARTS */
/* ========================= */

function renderCharts(
  pending,
  progress,
  completed,
  total
){

  if(statusChart){
    statusChart.destroy();
  }

  if(bookingChart){
    bookingChart.destroy();
  }

  const statusCtx =
  document.getElementById(
    "statusChart"
  );

  statusChart =
  new Chart(statusCtx, {

    type:"pie",

    data:{
      labels:[
        "Pending",
        "In Progress",
        "Completed"
      ],

      datasets:[{
        data:[
          pending,
          progress,
          completed
        ]
      }]
    }

  });

  const bookingCtx =
  document.getElementById(
    "bookingChart"
  );

  bookingChart =
  new Chart(bookingCtx, {

    type:"bar",

    data:{
      labels:[
        "Total",
        "Pending",
        "In Progress",
        "Completed"
      ],

      datasets:[{
        label:"Bookings",

        data:[
          total,
          pending,
          progress,
          completed
        ]
      }]
    }

  });

}

/* ========================= */
/* MONTHLY GRAPH */
/* ========================= */

function renderMonthlyChart(
  bookings
){

  if(monthlyChart){
    monthlyChart.destroy();
  }

  const monthlyCounts =
  Array(12).fill(0);

  bookings.forEach((booking)=>{

    if(!booking.createdAt) return;

    const month =
    new Date(
      booking.createdAt
    ).getMonth();

    monthlyCounts[month]++;

  });

  const ctx =
  document.getElementById(
    "monthlyChart"
  );

  monthlyChart =
  new Chart(ctx, {

    type:"line",

    data:{
      labels:[
        "Jan","Feb","Mar",
        "Apr","May","Jun",
        "Jul","Aug","Sep",
        "Oct","Nov","Dec"
      ],

      datasets:[{

        label:"Monthly Bookings",

        data:monthlyCounts,

        borderWidth:3,

        tension:0.4

      }]
    }

  });

}

/* ========================= */
/* LOAD BOOKINGS */
/* ========================= */

async function loadBookings(){

  try{

    const response =
    await fetch(
      "https://portfolio-booking-system-ltuq.onrender.com/api/bookings"
    );

    const bookings =
    await response.json();

    allBookings = bookings;

    const pendingCount =
    bookings.filter(
      b => b.status === "Pending"
    ).length;

    const progressCount =
    bookings.filter(
      b => b.status === "In Progress"
    ).length;

    const completedCount =
    bookings.filter(
      b => b.status === "Completed"
    ).length;

    const totalRevenueValue =
    bookings.reduce((sum, booking)=>{

      return sum +
      (parseInt(
        booking.budget
      ) || 0);

    },0);

    const completedRevenueValue =
    bookings
    .filter(
      booking =>
      booking.status === "Completed"
    )
    .reduce((sum, booking)=>{

      return sum +
      (parseInt(
        booking.budget
      ) || 0);

    },0);

    const pendingRevenueValue =
    bookings
    .filter(
      booking =>
      booking.status !== "Completed"
    )
    .reduce((sum, booking)=>{

      return sum +
      (parseInt(
        booking.budget
      ) || 0);

    },0);

    totalBookings.textContent =
    bookings.length;

    pendingBookings.textContent =
    pendingCount;

    progressBookings.textContent =
    progressCount;

    completedBookings.textContent =
    completedCount;

    if(totalRevenue){
      totalRevenue.textContent =
      `₹${totalRevenueValue.toLocaleString()}`;
    }

    if(completedRevenue){
      completedRevenue.textContent =
      `₹${completedRevenueValue.toLocaleString()}`;
    }

    if(pendingRevenue){
      pendingRevenue.textContent =
      `₹${pendingRevenueValue.toLocaleString()}`;
    }

    renderCharts(
      pendingCount,
      progressCount,
      completedCount,
      bookings.length
    );

    renderMonthlyChart(
      bookings
    );

    const bookingList =
    document.getElementById(
      "bookingList"
    );

    bookingList.innerHTML = "";

    const searchValue =
    searchInput.value.toLowerCase();

    const selectedStatus =
    statusFilter.value;

    const filteredBookings =
    bookings.filter((booking)=>{

      const matchesSearch =

        booking.name
        .toLowerCase()
        .includes(searchValue)

        ||

        booking.email
        .toLowerCase()
        .includes(searchValue)

        ||

        booking.service
        .toLowerCase()
        .includes(searchValue);

      const matchesStatus =

        selectedStatus === "All"

        ||

        booking.status ===
        selectedStatus;

      return (
        matchesSearch &&
        matchesStatus
      );

    });

    filteredBookings.forEach(
      (booking)=>{

      bookingList.innerHTML += `

      <div class="project-card">

        <h3>${booking.name}</h3>

        <p><strong>Service:</strong>
        ${booking.service}</p>

        <p><strong>Email:</strong>
        ${booking.email}</p>

        <p><strong>Phone:</strong>
        ${booking.phone}</p>

        <p><strong>Status:</strong></p>

        <select onchange="updateStatus('${booking._id}', this.value)">

          <option value="Pending"
          ${booking.status==="Pending" ? "selected" : ""}>
          Pending
          </option>

          <option value="In Progress"
          ${booking.status==="In Progress" ? "selected" : ""}>
          In Progress
          </option>

          <option value="Completed"
          ${booking.status==="Completed" ? "selected" : ""}>
          Completed
          </option>

        </select>

        <p><strong>Budget:</strong>
        ${booking.budget}</p>

        <p><strong>Deadline:</strong>
        ${booking.deadline}</p>

        <p><strong>Description:</strong>
        ${booking.description}</p>

        <button onclick="deleteBooking('${booking._id}')">
        Delete Booking
        </button>

      </div>

      `;
    });

  }catch(error){

    console.log(error);

  }

}

/* ========================= */
/* UPDATE STATUS */
/* ========================= */

async function updateStatus(
  id,
  status
){

  await fetch(
    `https://portfolio-booking-system-ltuq.onrender.com/api/bookings/${id}`,
    {
      method:"PUT",

      headers:{
        "Content-Type":
        "application/json"
      },

      body:JSON.stringify({
        status
      })
    }
  );

  loadBookings();

}

/* ========================= */
/* DELETE */
/* ========================= */

async function deleteBooking(id){

  const confirmDelete =
  confirm(
    "Delete this booking?"
  );

  if(!confirmDelete) return;

  await fetch(
    `https://portfolio-booking-system-ltuq.onrender.com/api/bookings/${id}`,
    {
      method:"DELETE"
    }
  );

  loadBookings();

}

/* ========================= */
/* CSV EXPORT */
/* ========================= */

function exportCSV(){

  let csv =
  "Name,Email,Phone,Service,Status,Budget,Deadline\n";

  allBookings.forEach((b)=>{

    csv +=
    `${b.name},${b.email},${b.phone},${b.service},${b.status},${b.budget},${b.deadline}\n`;

  });

  const blob =
  new Blob([csv],{
    type:"text/csv"
  });

  const url =
  URL.createObjectURL(blob);

  const a =
  document.createElement("a");

  a.href = url;

  a.download =
  "Bookings.csv";

  a.click();

}

/* ========================= */
/* EXCEL EXPORT */
/* ========================= */

function exportExcel(){

  const excelData =
  allBookings.map((b)=>({

    Name:b.name,
    Email:b.email,
    Phone:b.phone,
    Service:b.service,
    Status:b.status,
    Budget:b.budget,
    Deadline:b.deadline,
    Description:b.description,
    CreatedAt:new Date(
      b.createdAt
    ).toLocaleString()

  }));

  const worksheet =
  XLSX.utils.json_to_sheet(
    excelData
  );

  const workbook =
  XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Bookings"
  );

  XLSX.writeFile(
    workbook,
    "Bookings.xlsx"
  );

}

/* ========================= */
/* LOGOUT */
/* ========================= */

function logout(){

  localStorage.removeItem(
    "adminLoggedIn"
  );

  window.location.href =
  "admin-login.html";

}

searchInput.addEventListener(
  "input",
  loadBookings
);

statusFilter.addEventListener(
  "change",
  loadBookings
);

loadBookings();