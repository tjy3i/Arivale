
$(document).ready(function () {
    var currentUser = null;
    var eventIdToDelete = null;
    var newEventStartTime = null;
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay,listWeek'
        },
        defaultDate: Date.now(),
        navLinks: true, // can click day/week names to navigate views
        selectable: true,
        selectConstraint: 'businessHours',
        select: selectSlot,
        eventClick: eventClick,
        eventConstraint: 'businessHours',
        selectOverlap: false,
        editable: true,
        eventLimit: true, // allow "more" link when too many events
        events: renderEvents,
        defaultTimedEventDuration: '01:00:00',
        slotDuration:'01:00:00',
        forceEventDuration: true,
        businessHours: true,
        allDaySlot: false,
        timezone: "local",
        eventRender: function (event, element) {
            if (event.rendering == 'background') {
                element.append(event.title);
            }
        }
    });

});

function eventClick(event, element) {
    $('#cancelModal').openModal();
    eventIdToDelete = event.id;
}
$(document).on('click', '#deleteButton', function () { //when user confirms deletion
    $.ajax({
        type: "POST",
        url: "/coachCalender/removeEvent",
        data:
        {
            eventId: eventIdToDelete
        }
    }).success(function (data, status) {
        console.log(data);
        $('#cancelModal').closeModal();
        $('#calendar').fullCalendar('removeEvents', [eventIdToDelete]);
        eventIdToDelete = null;
    }).fail(function (err, status) {
        console.log(err.responseText);

    });
});


function selectSlot(start) {
    if (currentUser.scope == "Coach") return;
    newEventStartTime = start;
    $('#scheduleMsg').text("Are you going to schedule a one-hour call at "+ 
    start._d.toLocaleDateString() + " "+start._d.toLocaleTimeString()+"?")
    $('#scheduleModal').openModal();
}
$(document).on('click', '#confirmButton', function () {
    var title = "Coaching call";
    var eventData = {
        title: title,
        start: newEventStartTime,
        overlap: false,
        durationEditable: false,
        startEditable: false,
    };
    $('#scheduleModal').closeModal();
    $.ajax({
        type: "POST",
        url: "/coachCalender/addEvent",
        data:
        {
            time: newEventStartTime._d
        }
    }).success(function (data, status) {
        console.log(data);
        eventData.id = data.event._id;
        $('#calendar').fullCalendar('renderEvent', eventData, false);
        $('#calendar').fullCalendar('unselect');
        
    }).fail(function (err, status) {
        console.log(err.responseText);

    });
});

function renderEvents(start, end, timezone, callback) {
    $.ajax({
        url: '/coachCalender/eventsByCoach',
        type: 'GET',
        success: function (data) {
            console.log(data);
            var events = [];
            currentUser = data.user;
            for (let item of data.events) {
                if (currentUser.scope == "Coach") {
                    events.push({
                        title: "Coaching call with " + item.clientEmail,
                        start: item.time,
                        overlap: false,
                        durationEditable: false,
                        startEditable: false,
                        id: item._id,
                    });
                } else {
                    if (currentUser.email == item.clientEmail) {
                        events.push({
                            title: "Coaching call",
                            start: item.time,
                            overlap: false,
                            durationEditable: false,
                            startEditable: false,
                            id: item._id,
                        });
                    } else {
                        events.push({
                            title: "Busy",
                            start: item.time,
                            overlap: false,
                            rendering: 'background',
                            color: '#ff9f89'
                        });
                    }
                }
            }
            callback(events);
        }
    });
}
