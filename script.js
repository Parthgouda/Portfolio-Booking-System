const form = document.getElementById("bookingForm");

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const bookingData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    service: document.getElementById("service").value,
    budget: document.getElementById("budget").value,
    deadline: document.getElementById("deadline").value,
    description: document.getElementById("description").value
  };

  try {

    const response = await fetch(
      "http://localhost:5000/api/bookings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bookingData)
      }
    );

    const data = await response.json();

    alert(data.message);

    form.reset();

  } catch (error) {

    console.log(error);

    alert("Error submitting booking");

  }

});