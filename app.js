var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
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
    var query = req.query;

    var where = {};

    if (query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
         where.description = {
             $like: '%' + query.q + '%'
         };
    }

    db.todo.findAll({where: where}).then(function(todos) {
        res.json(todos);
    }, function(e) {
        res.status(500).send();
    });
    // var filteredTodos = todos;
    //
    // if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
    //     filteredTodos = _.where(filteredTodos, {
    //         completed: true
    //     }); //Gets all todos where completed is true
    // } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
    //     filteredTodos = _.where(filteredTodos, {
    //         completed: false
    //     }); //Gets all todos where completed is false
    // }
    //
    // if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
    //     filteredTodos = _.filter(filteredTodos, function(todo) {
    //         return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
    //     }); //Filter returns a new array with all values that returned true for the anonymous function above
    // }
    //
    // res.json(filteredTodos);

});

//GET /todos/:id (colon means that you can enter whatever id you want)
app.get('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);

    db.todo.findById(todoId).then(function(todo) {
        if (!!todo) { //Only runs if todo exists (1 exclamation turns it into false and 2 turns it into true)
            res.json(todo.toJSON());
        } else {
            res.status(404).send();
        }
    }, function(e) {
        res.status(500).send();
    })
    // var todoId = parseInt(req.params.id, 10);
    // //Finds the first todo that has the id that is equal to todoId
    // var matchedTodo = _.findWhere(todos, {
    //     id: todoId
    // }); //Underscore js!!
    //
    // // todos.forEach(function(todo) {
    // //     if (todoId === todo.id) {
    // //         matchedTodo = todo;
    // //     }
    // // });
    //
    // if (matchedTodo) {
    //     res.json(matchedTodo);
    // } else {
    //     res.status(404).send();
    // }
});

// DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {

    var todoId = parseInt(req.params.id, 10);

    var matchedTodo = _.findWhere(todos, {
        id: todoId
    });

    if (matchedTodo) {
        todos = _.without(todos, matchedTodo);
        //todos.splice(todos.indexOf(matchedTodo), 1);
        res.json(matchedTodo);
    } else {
        res.status(404).json({
            "error": "no todo found with that id"
        });
    }

});

// PUT /todos/:id
app.put('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {
        id: todoId
    });
    var body = _.pick(req.body, 'description', 'completed'); //Only captures the description and completed properties
    var validAttributes = {};

    if (!matchedTodo) {
        return res.status(400).send();
    }

    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) { //Check is body has the "completed" attribute
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return res.status(400).send();
    }

    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        return res.status(400).send();
    }

    _.extend(matchedTodo, validAttributes); //Overrides all same attributes in matchedTodo with validAttributes
    res.json(matchedTodo);
});

// POST /todos
app.post('/todos', function(req, res) {
    var body = _.pick(req.body, "description", "completed");

    db.todo.create(body).then(function(todo) {
        return res.status(200).json(todo);
    }).catch(function(e) {
        return res.status(400).json(e);
    });

    //THE POWER OF UNDERSCOREE
    // if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
    //     return res.status(400).send();
    // }

    // body.description = body.description.trim();

    //body.id = todoNextId++;

    //todos.push(body);

    //res.send(body);

});

db.sequelize.sync().then(function() {
    app.listen(PORT, function() {
        console.log("Listening on port " + PORT);
    });
});
