Date.prototype.timeNow = function () {
  return (
    (this.getHours() < 10 ? "0" : "") +
    this.getHours() +
    ":" +
    (this.getMinutes() < 10 ? "0" : "") +
    this.getMinutes() +
    ":" +
    (this.getSeconds() < 10 ? "0" : "") +
    this.getSeconds()
  );
};

$("#btnAddAgenda").click(function () {
  const task = $("#addAgendaTextBox").val();
  const id = Date.now();
  // console.log(id);
  const date = $(".date").html();

  addAgendaFB(task, id, date);
  addAgendaUI(task, id);
  hideEditCard();
});

//chevron back
$(".btn-back").click(function () {
  $(".btn-back").prop('disabled', true);
  $(".btn-forward").prop('disabled', true);

  const today = $(".date").html();
  const yesterday = getYesterday(today);
  const day = getDay(yesterday);
  $(".day").html(day);
  $(".date").html(yesterday);
  loadAgendaFB(yesterday);
});

//chevron forward
$(".btn-forward").click(function () {
  $(".btn-back").prop('disabled', true);
  $(".btn-forward").prop('disabled', true);

  const today = $(".date").html();
  const tommorrow = getTommorrow(today);
  const day = getDay(tommorrow);
  $(".day").html(day);
  $(".date").html(tommorrow);
  loadAgendaFB(tommorrow);
});

$("#deleteAgendaBtn").click(function () {
  const id = $(this)
    .parent()
    .siblings(".modal-body")
    .children("p")
    .children(".task_id")
    .html();
  const date = $(".date").html();
  deleteAgendaFB(id, date);
  deleteAgendaUI(id);
  updateTaskCount("Delete");
});

function deleteAgendaUI(id) {
  // console.log(id);
  $(".tasks")
    .children()
    .each(function () {
      if ($(this).children(".task").children(".col-9").children(".task_id").html() == id) {
        $(this).remove();
      }
    });
}

$(document).on("click", ".tasks .btn-checkbox", function () {
  if ($(this).children(".material-icons").html() == "check_box") {
    $(this).children(".material-icons").html("check_box_outline_blank");
  } else {
    $(this).children(".material-icons").html("check_box");
  }
  updateTaskCount("Delete");
  const date = $(".date").html();
  updateConfirmAgendaFB(
    $(this).parent().siblings(".col-9").children(".task_id").html(),
    moment().format("LT"),
    date
  );
  addCompletedNotification(
    $(this).parent().siblings(".col-9").children(".task_id").html(),
    $(this).parent().siblings(".col-9").children(".task_content").html(),
    moment().format("LT")
  );
  $(this).parent().parent().parent().remove();
});

$(document).on("click", ".tasks .btn-edit", function () {
  const val = $(this).parent().parent().siblings(".col-9").children(".task_content").html();
  $(this)
    .parent()
    .parent()
    .parent()
    .siblings(".update-card")
    .children(".card-body")
    .children(".input-task")
    .val(val);

  $(this).parent().parent().parent().addClass("hide");
  $(this).parent().parent().parent().siblings(".update-card").removeClass("hide");
  $(this)
    .parent()
    .parent()
    .parent()
    .siblings(".update-card")
    .children(".card-body")
    .children(".input-task")
    .focus();
});

$(document).on("click", ".completion_alerts .btn-undo", function () {
  const id = $(this).parent().siblings(".task_id").html();
  const task = $(this)
    .parent()
    .siblings("strong")
    .children(".task_content")
    .html();

  const date = $(".date").html();

  addAgendaUI(task, id);
  updateConfirmAgendaFB(id, "", date, false);
  updateTaskCount("Add");
  $(this).parent().parent().parent().remove();
});

$(document).on("keydown", function (event) {
  if (event.ctrlKey && event.key === 'a') {
    $(".btn_add_agenda").addClass("hide");
    $(".btn_add_agenda").siblings(".edit-card").removeClass("hide");
    $("#addAgendaTextBox").focus();
  }
});

//Delete Agenda Modal
const deleteAgendaModal = document.getElementById("deleteAgendaModal");
if (deleteAgendaModal) {
  deleteAgendaModal.addEventListener("show.bs.modal", (event) => {
    // Button that triggered the modal
    const button = event.relatedTarget;
    // Extract info from data-bs-* attributes
    const id = button.getAttribute("data-bs-id");
    const task = button.getAttribute("data-bs-task");
    // If necessary, you could initiate an Ajax request here
    // and then do the updating in a callback.
    console.log(id);
    console.log(task);
    // Update the modal's content.
    const task_content = deleteAgendaModal.querySelector(
      ".modal-body .task_content"
    );
    const task_id = deleteAgendaModal.querySelector(".modal-body .task_id");

    task_content.textContent = task;
    task_id.textContent = id;
  });
}

var tasks = [];
var tasksCount = 0;

//Task count

function updateTaskCount(type = "Update") {
  if (type == "Add") {
    tasksCount++;
  } else if (type == "Update") {
    //do nothing
  } else {
    tasksCount--;
  }

  if (tasksCount > 1) {
    $(".task_count").html(tasksCount.toString() + " tasks");
  } else {
    $(".task_count").html(tasksCount.toString() + " task");
  }
}

//Notifications

function addCompletedNotification(id, task, time) {
  $(".completion_alerts").append(`
        <div class="card completion_alert bg-success-subtle text-success-emphasis border border-success-subtle">
                                        <div class="card-body">
                                          <i class="material-icons">task_alt</i> Completed task
                                          <strong><span class="task_content">${task}</span></strong>
                                          <span class="task_id hide">${id}</span>
                                          <div class="d-flex justify-content-between align-items-center">    
                                            <span class="badge rounded-pill bg-warning-subtle text-warning-emphasis">${time}</span>
                                            <button class="btn btn-sm btn-success btn-undo"><i class="material-icons">undo</i></button>
                                          </div>
                                        </div>
                                    </div>
        `);
}

//Edit card functions
function showEditCard(elem) {
  $(elem).addClass("hide");
  $(elem).siblings(".edit-card").removeClass("hide");
  $("#addAgendaTextBox").focus();
}

function hideEditCard() {
  $("#addAgendaTextBox").val("");
  $(".btn_add_agenda").removeClass("hide");
  $(".btn_add_agenda").siblings(".edit-card").addClass("hide");
}

function valueChangedNewAgenda(e, elem) {
  const val = $(elem).val();
  if (val != "") {
    $("#btnAddAgenda").removeClass("disabled");
  } else {
    $("#btnAddAgenda").addClass("disabled");
  }
}

function checkKeyNewAgenda(e, elem) {
  if (e.key === "Escape" || e.keyCode === 27) {
    hideEditCard();
  }
  const task = $(elem).val();
  if (task != "") {
    if (e.key === "Enter" || e.keyCode === 13) {
      const id = Date.now();
      // console.log(id);
      const date = $(".date").html();
      addAgendaFB(task, id, date);
      addAgendaUI(task, id);
      hideEditCard();
    }
  }
}

function addAgendaUI(task, id) {
  $(".tasks").append(`
         <div>
                                                <div class="card update-card hide">
                                                    <div class="card-body">
                                                        <input type="text" class="form-control input-task"
                                                            placeholder="to add new agenda click here.."
                                                            onkeydown="valueChangedUpdateAgenda(this)" onkeyup="checkKeyUpdateAgenda(event, this)"/>
                                                        <div class="float-end controls-edit">
                                                            <button class="btn bg-secondary-subtle text-secondary-emphasis"
                                                                onclick="hideUpdateCard(this)">Cancel</button>
                                                            <button
                                                                class="btn bg-danger-subtle text-danger-emphasis btn-update"
                                                                onclick="updateAgenda(this, '${id}')">Update</button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="row task align-items-center">
                                                    <div class="col">
                                                        <a class="btn btn-drag text-muted"><i
                                                            class="material-icons">drag_indicator</i></a>
                                                        <a href="#" class="btn btn-checkbox"><i
                                                            class="material-icons">check_box_outline_blank</i></a>
                                                    </div>
                                                    <div class="col-9">
                                                        <span class="task_content">${task}</span>
                                                        <span class="task_id hide">${id}</span>
                                                    </div>
                                                    <div class="col">
                                                        <div class="float-end">
                                                            <a class="btn btn-edit text-muted"><i
                                                                    class="material-icons">edit_note</i></a>
                                                            <a class="btn btn-delete text-muted" data-bs-toggle="modal" data-bs-target="#deleteAgendaModal" data-bs-id="${id}" data-bs-task="${task}"><i
                                                                    class="material-icons">delete_forever</i></a>
                                                        </div>
                                                    </div>  
                                                </div>
                                                <hr>
                                            </div>
                                        
        `);
}

// function addAgendaUI(task, id) {
//   $(".tasks").append(`
//         <div>
//                                             <div class="card update-card hide">
//                                                 <div class="card-body">
//                                                     <input type="text" class="form-control input-task"
//                                                         placeholder="to add new agenda click here.."
//                                                         onkeydown="valueChangedUpdateAgenda(this)" onkeyup="checkKeyUpdateAgenda(event, this)"/>
//                                                     <div class="float-end controls-edit">
//                                                         <button class="btn bg-secondary-subtle text-secondary-emphasis"
//                                                             onclick="hideUpdateCard(this)">Cancel</button>
//                                                         <button
//                                                             class="btn bg-danger-subtle text-danger-emphasis btn-update"
//                                                             onclick="updateAgenda(this, '${id}')">Update</button>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             <div class="task align-middle">
//                                                 <a class="btn btn-drag text-muted"><i
//                                                         class="material-icons">drag_indicator</i></a>
//                                                 <a href="#" class="btn btn-checkbox"><i
//                                                         class="material-icons">check_box_outline_blank</i></a>
//                                                 <span class="task_content">${task}</span>
//                                                 <span class="task_id hide">${id}</span>
//                                                 <div class="float-end">
//                                                     <a class="btn btn-edit text-muted"><i
//                                                             class="material-icons">edit_note</i></a>
//                                                     <a class="btn btn-delete text-muted" data-bs-toggle="modal" data-bs-target="#deleteAgendaModal" data-bs-id="${id}" data-bs-task="${task}"><i
//                                                             class="material-icons">delete_forever</i></a>
//                                                 </div>
//                                             </div>
//                                             <hr>
//                                         </div>
                                        
//         `);
// }

//update card functions

function checkKeyUpdateAgenda(e, elem) {
  if (e.key === "Escape" || e.keyCode === 27) {
    $(elem).parent().parent().addClass("hide");
    $(elem).parent().parent().siblings(".task").removeClass("hide");
  }
  const task = $(elem).val();
  if (task != "") {
    if (e.key === "Enter" || e.keyCode === 13) {
      const id = $(elem)
        .parent()
        .parent()
        .siblings(".task")
        .children(".col-9")
        .children(".task_id")
        .html();
      const date = $(".date").html();
      updateAgendaFB(task, id, date);
      $(elem)
        .parent()
        .parent()
        .siblings(".task")
        .children(".col-9")
        .children(".task_content")
        .html(task);
      $(elem).parent().parent().addClass("hide");
      $(elem).parent().parent().siblings(".task").removeClass("hide");
    }
  }
}

function hideUpdateCard(elem) {
  $(elem).parent().parent().parent().addClass("hide");
  $(elem).parent().parent().parent().siblings(".task").removeClass("hide");
}

function valueChangedUpdateAgenda(elem) {
  const val = $(elem).val();
  if (val != "") {
    $(".btn-update").removeClass("disabled");
  } else {
    $(".btn-update").addClass("disabled");
  }
}

function updateAgenda(elem, id) {
  const task = $(elem).parent().siblings(".input-task").val();
  const date = $(".date").html();
  updateAgendaFB(task, id, date);
  // console.log(val);
  $(elem)
    .parent()
    .parent()
    .parent()
    .siblings(".task")
    .children(".col-9")
    .children(".task_content")
    .html(task);
  $(elem).parent().parent().parent().addClass("hide");
  $(elem).parent().parent().parent().siblings(".task").removeClass("hide");
}

//Firebase functions

function loadAgendaFB(date = "") {
  $(".loading_agenda").removeClass("hide");
  $(".tasks-container").addClass("hide");
  $(".task_count").html("0 tasks");

  //UI clear containers for task and completions
  $(".tasks").html("");
  $(".completion_alerts").html("");

  var data;

  if (date == "") {
    data = { date: getToday() };
  } else {
    data = { date: date };
  }

  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/agenda/getAgendas");
  xhttp.onload = function () {
    $(".btn-back").prop('disabled', false);
    $(".btn-forward").prop('disabled', false);
    const response = JSON.parse(this.responseText);
    tasks = response;
    loadAgendaList(response);
    loadCompletedAgendas(response);
    $(".loading_agenda").addClass("hide");
    $(".tasks-container").removeClass("hide");
  };
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify(data));
}

function loadAgendaList(data) {
  var count = 0;
  for (let i = 0; i < data.length; i++) {
    if (!data[i].isCompleted) {
      addAgendaUI(data[i].task, data[i].id);
      count++;
    }
  }
  tasksCount = count;
  updateTaskCount();
}

function addAgendaFB(task, id, date) {
  const data = { task: task, id: id, date: date };
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/agenda/addAgenda");
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify(data));
  updateTaskCount("Add");
}

function updateAgendaFB(task, id, date) {
  const data = { task: task, id: id, date: date };
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/agenda/updateAgenda");
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify(data));
}

function deleteAgendaFB(id, date) {
  const data = { id: id, date: date };
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/agenda/deleteAgenda");
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify(data));
}

function updateConfirmAgendaFB(id, time, date, isCompleted = true) {
  const data = {
    id: id,
    time: time,
    isCompleted: isCompleted,
    date: date,
  };
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/agenda/updateConfirmAgenda");
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify(data));
}

function loadCompletedAgendas(data) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].isCompleted) {
      addCompletedNotification(data[i].id, data[i].task, data[i].time);
    }
  }
}

function setToday() {
  const date = getToday();
  $(".date").html(date);
  const day = getDay(date);
  $(".day").html(day);
}

function getToday() {
  return moment().format("DD-MM-YYYY");
}

function getDay(date) {
  if (date == moment().format("DD-MM-YYYY")) {
    return "Today";
  } else if (date == moment().subtract(1, "days").format("DD-MM-YYYY")) {
    return "Yesterday";
  } else if (date == moment().add(1, "days").format("DD-MM-YYYY")) {
    return "Tommorrow";
  } else {
    return moment(date, "DD-MM-YYYY").format('dddd');
  }

}

function getYesterday(dt) {
  return moment(dt, "DD-MM-YYYY").subtract(1, "days").format("DD-MM-YYYY");
}

function getTommorrow(dt) {
  return moment(dt, "DD-MM-YYYY").add(1, "days").format("DD-MM-YYYY");
}

function generatePlanRosterUI(data) {
  $("#plan11AM").html(getIRNameRoster(data[0].data["11AM"]) + " " + generatePlanStatusAgenda(getPlanStatus(data[0].data["11AM"])));
  $("#plan1PM").html(getIRNameRoster(data[0].data["1PM"]) + " " + generatePlanStatusAgenda(getPlanStatus(data[0].data["1PM"])));
  $("#plan3PM").html(getIRNameRoster(data[0].data["3PM"]) + " " + generatePlanStatusAgenda(getPlanStatus(data[0].data["3PM"])));
  $("#plan5PM").html(getIRNameRoster(data[0].data["5PM"]) + " " + generatePlanStatusAgenda(getPlanStatus(data[0].data["5PM"])));
  $("#plan7PM").html(getIRNameRoster(data[0].data["7PM"]) + " " + generatePlanStatusAgenda(getPlanStatus(data[0].data["7PM"])));
}

function generatePlanStatusAgenda(val){
  var pill = "";

  if (val == "Confirmed") {
      pill = `<span class="plan_status badge rounded-pill text-bg-success">Confirmed</span>`;
  } else if (val == "Reconfirmed") {
      pill = `<span class="plan_status badge rounded-pill text-bg-success">ReConfirmed</span>`;
  } else if (val == "Done") {
      pill = `<span class="plan_status badge rounded-pill text-bg-primary">Done</span>`;
  } else if (val == "Rescheduled") {
      pill = `<span class="plan_status badge rounded-pill text-bg-secondary">Rescheduled</span>`;
  } else if (val == "Cancelled") {
      pill = `<span class="plan_status badge rounded-pill text-bg-danger">Cancelled</span>`;
  } else {
      pill = `<span class="plan_status badge rounded-pill"></span>`;
  }

  return pill;
}

setToday();
loadAgendaFB();
// loadPlanRoster();
