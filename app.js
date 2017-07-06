var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcryptjs');
var middleware = require('./middleware.js')(db);
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.set("views", path.join(__dirname, 'views'));
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function(req, res) {
    res.render('index');
});

//GET /todos
app.get("/todos", middleware.requireAuthentication, function(req, res) {
    var query = req.query;

    var where = {
        userId: req.user.get('id')
    };

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

    db.todo.findAll({
        where: where
    }).then(function(todos) {
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
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var todoId = parseInt(req.params.id, 10);

    db.todo.findOne({
            where: {
                id: todoId,
                userId: req.user.get('id')
            }
        }).then(function(todo) {
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
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {

    var todoId = parseInt(req.params.id, 10);

    db.todo.destroy({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then(function(rowsDeleted) {
        if (rowsDeleted === 0) {
            res.status(404).json({
                error: "Todo could not be found with id" + todoId
            });
        } else {
            res.status(204).send(); //204 means everything went well, and nothing is sent back
        }
    }, function(e) {
        res.status(500).send();
    })

    // var matchedTodo = _.findWhere(todos, {
    //     id: todoId
    // });
    //
    // if (matchedTodo) {
    //     todos = _.without(todos, matchedTodo);
    //     //todos.splice(todos.indexOf(matchedTodo), 1);
    //     res.json(matchedTodo);
    // } else {
    //     res.status(404).json({
    //         "error": "no todo found with that id"
    //     });
    // }

});

// PUT /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    // var matchedTodo = _.findWhere(todos, {
    //     id: todoId
    // });
    var body = _.pick(req.body, 'description', 'completed'); //Only captures the description and completed properties
    var attributes = {};

    // if (!matchedTodo) {
    //     return res.status(400).send();
    // }

    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) { //Check is body has the "completed" attribute
        attributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return res.status(400).json({
            "error": "The value for 'completed' is not a boolean"
        });
    }

    if (body.hasOwnProperty('description') && _.isString(body.description)) {
        attributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        return res.status(400).json({
            "error": "The value for 'description' is not a string"
        })
    }

    db.todo.findOne({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then(function(todo) {
        if (todo) {
            todo.update(attributes).then(function(todo) {
                res.json(todo.toJSON());
            }, function(e) {
                res.status(400).json(e);
            });
        } else {
            res.status(404).send();
        }
    }, function() {
        res.status(500).send();
    });

    // _.extend(matchedTodo, validAttributes); //Overrides all same attributes in matchedTodo with validAttributes
    // res.json(matchedTodo);
});

// POST /todos
app.post('/todos', middleware.requireAuthentication, function(req, res) {
    var body = _.pick(req.body, "description", "completed");

    db.todo.create(body).then(function(todo) {
        req.user.addTodo(todo).then(function(todo) {
            return todo.reload();
        }).then(function(todo) {
            res.json(todo.toJSON());
        });
    }).catch(function(e) {
        res.status(400).json(e);
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

// POST /users
app.post('/users', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.create(body).then(function(user) {
        res.json(user.toPublicJSON());
    }, function(e) {
        res.status(400).json(e);
    });
})

// POST /users/login

app.post('/users/login', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');
    var userInstance;

    db.user.authenticate(body).then(function(user) {
        var token = user.generateToken('authentication');

        userInstance = user;

        return db.token.create({
            token: token
        });
    }).then(function(tokenInstance) {
        res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
    }).catch(function() {
        res.status(401).send();
    });

});

//DELETE /users/login

app.delete('/users/login', middleware.requireAuthentication, function(req, res) {
    req.token.destroy().then(function() {
        res.status(204).send();
    }).catch(function() {
        res.status(500).send();
    })
})

db.sequelize.sync({
    force: true
}).then(function() {
    app.listen(PORT, function() {
        console.log("Listening on port " + PORT);
    });
});
