var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get("/", function(req, res) {
    res.send("TODO api root");
});

//GET /todos
app.get("/todos", function(req, res) {
    res.json(todos);
});

//GET /todos/:id (colon means that you can enter whatever id you want)
app.get('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId}); //Underscore js!!

    // todos.forEach(function(todo) {
    //     if (todoId === todo.id) {
    //         matchedTodo = todo;
    //     }
    // });

    if (matchedTodo) {
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
});

app.delete('/todos/:id', function(req, res) {

    var todoId = parseInt(req.params.id, 10);

    var matchedTodo = _.findWhere(todos, {id: todoId});

    if (matchedTodo) {
        todos = _.without(todos, matchedTodo);
        //todos.splice(todos.indexOf(matchedTodo), 1);
        res.json(matchedTodo);
    } else {
        res.status(404).json({"error": "no todo found with that id"});
    }

});

// POST /todos
app.post('/todos', function(req, res) {
    var body = _.pick(req.body, "description", "completed");

    //THE POWER OF UNDERSCOREE
    if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
        return res.status(400).send();
    }

    body.description = body.description.trim();

    body.id = todoNextId++;

    todos.push(body);

    res.send(body);

});

app.listen(PORT, function() {
    console.log("Listening on port " + PORT);
});
