$("#form-signup").submit(function(e) {

    e.preventDefault();

    var data = $(this).serializeArray();

    console.log(data);

    $.ajax({
        type: "POST",
        url: "/users",
        data: {
            "email": data[0].email,
            "password": data[1].password
        },
        success: function(result) {
            alert("Hi");
        },
        dataType: dataType
    });

});
