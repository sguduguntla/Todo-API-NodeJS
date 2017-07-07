# Todo API powered by NodeJS

A simple Todo API demo built using NodeJS coupled with Sqlite, Sequelize, and Postgres. 

API URL: https://sai-todo-api.herokuapp.com/

Available Endpoints:

| Endpoints  | Request Type | Description
| ---------- | ---- | ---------- |
| /user  | **POST**  | Creates a new user with the specified email and password and generates a custom authentication header
| /user/login  | **POST**  | Logs in a user with the specified email and password credentials
| /todos | **GET** | Retrieves all of the user's current todos
| /todos/:id | **GET** | Retrieves a single todo with the specified **id**
| /todos | **POST** | Creates a new todo with the specified **description** and **completed** (true or false) status. 
| /todos/:id | **DELETE** | 


To run the app locally:

1. Clone the repository and run ```npm install``` to install all the necessary **node_modules** for running the application.
2. Run ```npm start``` to start the application and navigate to ```localhost:3000``` on your browser.
