# Todo API powered by NodeJS & SQL

A simple Todo API demo built using NodeJS coupled with ExpressJS, Sqlite, Sequelize, Postgres, and Heroku. 

To run the app locally:

1. Clone the repository and run ```npm install``` to install all the necessary **node_modules** for running the application.
2. Run ```npm start``` to start the application and navigate to ```localhost:3000``` on your browser.

API URL: https://sai-todo-api.herokuapp.com/

Available Endpoints:

| Endpoints  | Request Type | Description
| ---------- | ---- | ---------- |
| /user  | **POST**  | Creates a new user with the specified email and password and generates a unique ```Auth``` header
| /user/login  | **POST**  | Logs in a user with the specified email and password credentials
| /user/login | **DELETE** | Logs out the current user with the specified ```Auth``` header.
| /todos | **GET** | Retrieves all of the user's current todos
| /todos/\<id\> | **GET** | Retrieves a single todo with the specified **id**
| /todos | **POST** | Creates a new todo with the specified **description** and **completed** (true or false) status. 
| /todos/\<id\> | **DELETE** | Deletes a single todo with the specified **id**
| /todos/\<id\> | **PUT** | Updates a single todo with the specified **description** and **completed** status

