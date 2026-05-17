
const currentDate = document.getElementById("date");

const Datee = new Date();
const onDate = {
  day: Datee.getDate(),
  mon: Datee.getMonth(),
  year: Datee.getFullYear(),
  hour: Datee.getHours() % 12 || 12,
  period: Datee.getHours > 12 ? "PM" : "AM",
  minutes: Datee.getMinutes(),
  seconds: Datee.getMilliseconds,
};

console.log(onDate.year);

function SetDate(Datte) {
  const date = new Date();
  let mon = "";
  switch (date.getMonth() + 1) {
    case 1:
      mon = "Jan";
      break;
    case 2:
      mon = "Feb";
      break;
    case 3:
      mon = "Mar";
      break;
    case 4:
      mon = "Apr";
      break;
    case 5:
      mon = "May";
      break;
    case 6:
      mon = "Jun";
      break;
    case 7:
      mon = "Jul";
      break;
    case 8:
      mon = "Aug";
      break;
    case 9:
      mon = "Sep";
      break;
    case 10:
      mon = "Oct";
      break;
    case 11:
      mon = "Nov";
      break;
    case 12:
      mon = "Dec";
      break;
  }

  let AmorPm = date.getHours() > 12 ? "PM" : "AM";
  let hour12 = date.getHours() % 12 || 12;
  Datte.innerHTML = ` ${date.getDate()}, ${mon}. ${hour12}:${date.getMinutes().toString().padStart(2, "0")} ${AmorPm}`;
}

function CurrentDate() {
  const date = new Date();
  let mon = "";
  switch (date.getMonth() + 1) {
    case 1:
      mon = "Jan";
      break;
    case 2:
      mon = "Feb";
      break;
    case 3:
      mon = "Mar";
      break;
    case 4:
      mon = "Apr";
      break;
    case 5:
      mon = "May";
      break;
    case 6:
      mon = "Jun";
      break;
    case 7:
      mon = "Jul";
      break;
    case 8:
      mon = "Aug";
      break;
    case 9:
      mon = "Sep";
      break;
    case 10:
      mon = "Oct";
      break;
    case 11:
      mon = "Nov";
      break;
    case 12:
      mon = "Dec";
      break;
  }

  let AmorPm = date.getHours() > 12 ? "PM" : "AM";
  let hour12 = date.getHours() % 12 || 12;
  return ` ${date.getDate()}, ${mon}. ${hour12}:${date.getMinutes().toString().padStart(2, "0")} ${AmorPm}`;
}

let x = CurrentDate();

console.log(x);

SetDate(currentDate);

setInterval(() => {
  SetDate(currentDate);
}, 1000);

const UserId = document.getElementById("User-id");
const UserName = document.getElementById("User-name");
const UserAge = document.getElementById("User-age");
const deleteUser = document.getElementById("delete-user");
const Display = document.querySelector(".section");

Display.addEventListener("click", function (e) {
  if (e.target.classList.contains("btn-close")) {
    if (confirm("Are you sure you want delete this user??")) {
      localStorage.removeItem("User_Id");
      localStorage.removeItem("User_Age");
      localStorage.removeItem("User_Name");
      location.reload();
    }
  }
});

const SubmitButton = document.getElementById("User-Submit");
SubmitButton.addEventListener("click", function sumbit(e) {
  if (UserId.value === "" || UserName.value === "" || UserAge.value === "") {
    alert("Please fill required fields");
    e.preventDefault();
  } else if (UserId.value === localStorage.getItem("User_Id")) {
    alert("User already exists");
    UserId.value = "";
    UserName.value = "";
    UserAge.value = "";
    e.preventDefault();
  } else {
    localStorage.setItem("User_Id", UserId.value);
    localStorage.setItem("User_Age", UserAge.value);
    localStorage.setItem("User_Name", UserName.value);
    UserId.value = "";
    UserName.value = "";
    UserAge.value = "";
    alert("User added successfully");
    setTimeout(() => {
      window.location = "/User.html";
    }, 500);
  }
});

function renderCard() {
  if (
    localStorage.getItem("User_Id") &&
    localStorage.getItem("User_Age") &&
    localStorage.getItem("User_Name")
  ) {
    let user_id = localStorage.getItem("User_Id");
    let user_age = localStorage.getItem("User_Age");
    let user_name = localStorage.getItem("User_Name");
    if (user_id % 3 === 0) {
      Display.innerHTML += ` <div
              class="card border-1 rounded-4 Patient shadow-sm"
              style="width: 20rem; height: 23rem "
            >
              <div class="card-body cursor">
                <div class="card-title mt-2 d-flex justify-content-between">
                  <h4 class= "fw-bolder">User #0${user_id}</h4>
                  <button
                    type="button"
                    class="btn-close"
                    aria-label="Close"
                    id = "delete-button"
                  ></button>
                </div>
                <div class="card-text m-auto">
                  <div class="card border-1 mt-4">
                    <div class="card-body d-flex gap-0 flex-wrap">
                      <div class="card-title">
                        <h4>
                          <i
                            class="fas fa-user-circle person"
                            style="color: #35b958"
                          ></i>
                        </h4>
                      </div>
                      <div class="card-text">
                        <div class="d-flex flex-column">
                          <h4 class="min-wd">${user_name}</h4>
                          <p class="lead">Age:${user_age}</p>
                        </div>
                      </div>
                      <p class="fs-5">
                        <span class="lead">Next dose at:</span>
                        <span class="fw-bolder">8:00 am</span>
                      </p>
                      <div>
                        <p class="lead d-flex">
                          2 Medications
                          <span
                            class="badge bg-success-subtle text-black ms-5 mt-1 px-3"
                            >Taken</span
                          >
                        </p>
                      </div>
                      <button
                        class="btn w-100 mt-1 py-2 fs-5"
                        data-bs-toggle="modal"
                        data-bs-target="#View-user"
                        style="background-color: #3e6aa9; color: white"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>`;
      Display.innerHTML += `<div class="modal fade" id="View-user" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-md">
    <div class="modal-content">
      <div class="modal-header">
        
         <div class="d-flex flex-column align-items-center m-auto" >
        <i class="fas fa-user-circle person text-center" style="color: #35b958;"></i>
        <h3 class= "mt-3">${user_name}</h3>
        <p class = "lead">User ID: 0${user_id}</p>
      </div>
      
      </div>
      <div class="modal-body d-flex flex-column">
     <p class="fw-semibold">Age : ${user_age}</p>
     <p class="fw-semibold mb-1">Medications:</p>
     <ul>
      <li>
        Aspirin - <span class="lead">8:00 am</span>
      </li>
      <li>
        Vitamin D - <span class="lead">1:00 am</span>
      </li>
     </ul>
     <p>Status <span class="text-danger">Not Taken</span></p>


      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="submit" class="btn" style="background-color: #3e6aa9; color: white;" id="View-user">Close</button>
      </div>
    </div>
  </div>
</div>`;
    } else if (user_id % 2 === 0) {
      Display.innerHTML += ` <div
              class="card border-1 rounded-4 Patient shadow-sm"
              style="width: 20rem; height: 23rem"
            >
              <div class="card-body cursor">
                <div class="card-title mt-2 d-flex justify-content-between">
                  <h4 class= "fw-bolder">User #0${user_id}</h4>
                  <button
                    type="button"
                    class="btn-close"
                    aria-label="Close"
                    id = "delete-button"
                  ></button>
                </div>
                <div class="card-text m-auto">
                  <div class="card border-1 mt-4">
                    <div class="card-body d-flex gap-0 flex-wrap">
                      <div class="card-title">
                        <h4>
                          <i
                            class="fas fa-user-circle person"
                            style="color: #d66b19"
                          ></i>
                        </h4>
                      </div>
                      <div class="card-text">
                        <div class="d-flex flex-column">
                          <h4 class="min-wd">${user_name}</h4>
                          <p class="lead">Age:${user_age}</p>
                        </div>
                      </div>
                      <p class="fs-5">
                        <span class="lead">Next dose at:</span>
                        <span class="fw-bolder">8:00 am</span>
                      </p>
                      <div>
                        <p class="lead d-flex">
                          2 Medications
                          <span
                            class="badge bg-success-subtle text-black ms-5 mt-1 px-3"
                            >Taken</span
                          >
                        </p>
                      </div>
                      <button
                        class="btn w-100 mt-1 py-2 fs-5"
                        data-bs-toggle="modal"
                        data-bs-target="#View-user"
                        style="background-color: #3e6aa9; color: white"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>`;
      Display.innerHTML += `<div class="modal fade" id="View-user" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-md">
    <div class="modal-content">
      <div class="modal-header">
        
         <div class="d-flex flex-column align-items-center m-auto" >
        <i class="fas fa-user-circle person text-center" style="color: #d66b19;"></i>
        <h3 class= "mt-3">${user_name}</h3>
        <p class = "lead">User ID: 0${user_id}</p>
      </div>
      
      </div>
      <div class="modal-body d-flex flex-column">
     <p class="fw-semibold">Age : ${user_age}</p>
     <p class="fw-semibold mb-1">Medications:</p>
     <ul>
      <li>
        Aspirin - <span class="lead">8:00 am</span>
      </li>
      <li>
        Vitamin D - <span class="lead">1:00 am</span>
      </li>
     </ul>
     <p>Status <span class="text-danger">Not Taken</span></p>


      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="submit" class="btn" style="background-color: #3e6aa9; color: white;" id="View-user">Close</button>
      </div>
    </div>
  </div>
</div>`;
    } else {
      Display.innerHTML += `  <div
              class="card border-1 rounded-4 Patient shadow-sm"
              style="width: 20rem; height: 23rem"
            >
              <div class="card-body cursor">
                <div class="card-title mt-2 d-flex justify-content-between">
                  <h4 class= "fw-bolder">User #0${user_id}</h4>
                  <button
                    type="button"
                    class="btn-close"
                    aria-label="Close"
                    id = "delete-button"
                  ></button>
                </div>
                <div class="card-text m-auto">
                  <div class="card border-1 mt-4">
                    <div class="card-body d-flex gap-0 flex-wrap">
                      <div class="card-title">
                        <h4>
                          <i
                            class="fas fa-user-circle person"
                            style="color: #4f0ca2"
                          ></i>
                        </h4>
                      </div>
                      <div class="card-text">
                        <div class="d-flex flex-column">
                          <h4 class="min-wd">${user_name}</h4>
                          <p class="lead">Age:${user_age}</p>
                        </div>
                      </div>
                      <p class="fs-5">
                        <span class="lead">Next dose at:</span>
                        <span class="fw-bolder">8:00 am</span>
                      </p>
                      <div>
                        <p class="lead d-flex">
                          2 Medications
                          <span
                            class="badge bg-success-subtle text-black ms-5 mt-1 px-3"
                            >Taken</span
                          >
                        </p>
                      </div>
                      <button
                        class="btn w-100 mt-1 py-2 fs-5"
                        data-bs-toggle="modal"
                        data-bs-target="#View-user"
                        style="background-color: #3e6aa9; color: white"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>`;
      Display.innerHTML += `<div class="modal fade" id="View-user" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-md">
    <div class="modal-content">
      <div class="modal-header">
        
         <div class="d-flex flex-column align-items-center m-auto" >
        <i class="fas fa-user-circle person text-center" style="color: #4f0ca2;"></i>
        <h3 class = "mt-2">${user_name}</h3>
        <p class = "lead">User ID: 0${user_id}</p>
      </div>
      
      </div>
      <div class="modal-body d-flex flex-column">
     <p class="fw-semibold">Age : ${user_age}</p>
     <p class="fw-semibold mb-1">Medications:</p>
     <ul>
      <li>
        Aspirin - <span class="lead">8:00 am</span>
      </li>
      <li>
        Vitamin D - <span class="lead">1:00 am</span>
      </li>
     </ul>
     <p>Status <span class="text-danger">Not Taken</span></p>


      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="submit" class="btn" style="background-color: #3e6aa9; color: white;" id="View-user">Close</button>
      </div>
    </div>
  </div>
</div>`;
    }
  }
}
renderCard();
