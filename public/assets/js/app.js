
$('.scrape').on('click', function () {
    $.ajax({
        method: 'GET', url: '/scrape'
    }).done(function (data) {
        alert('Scraped Done');
        window.location = '/articles';
    });
});

$('.save').on('click', function () {
    var thisId = $(this).attr('data-id');
    $.ajax({
        method: 'POST', url: '/articles/save/' + thisId
    }).done(function (data) {
        alert('Article saved');
        window.location.reload(true);
    });
});

$('.note').on('submit', function (event) {
    var thisId = $('#noteid').val();
    var newNote = {
        title: $('#NoteTitle').val().trim(),
        body: $('#NoteBody').val().trim()
    };

    $.ajax({
        method: 'POST',
        url: '/articles/' + thisId,
        data: newNote
    }).then(function (data) {
        console.log(data);
    });
});

$('.clear').on('click', function () {
    $.ajax({
        method: 'GET', url: '/clear'
    }).done(function (data) { });
    window.location = '/';
});

$('.notetrigger').on('click', function () {
    var thisId = $(this).attr('data-id');
    $.ajax({
        method: 'GET', url: '/articles/' + thisId
    }).then(function (data) {
        $('#NoteTitle').text(data.note.title);
        $('#NoteBody').text(data.note.body);
    });
});

$('.delete').on('click', function () {
    var thisId = $(this).attr('data-id');
    $.ajax({
        method: 'POST', url: '/articles/delete/' + thisId
    }).done(function (data) { });
    window.location.reload(true);
});