const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/todos/", async (request, response) => {
  const { priority, status, search_q = "" } = request.query;
  let dbResponse;
  let outPut;
  if (priority !== undefined && status !== undefined) {
    dbResponse = `
    SELECT * FROM todo WHERE 
    todo like '%${search_q}%' AND
    status='${status}' AND priority='${priority}'
    `;
    outPut = await db.all(dbResponse);
    response.send(outPut);
  } else if (priority !== undefined) {
    dbResponse = `
       SELECT * FROM todo WHERE
       todo like '%${search_q}%' AND
       priority='${priority}'`;
    outPut = await db.all(dbResponse);
    response.send(outPut);
  } else if (status !== undefined) {
    dbResponse = `
       SELECT * FROM todo WHERE 
       todo like '%${search_q}%' AND
       status='${status}'`;
    outPut = await db.all(dbResponse);
    response.send(outPut);
  } else if (search_q !== undefined) {
    dbResponse = `
       SELECT * FROM todo WHERE
       todo like '%${search_q}%'`;
    outPut = await db.all(dbResponse);
    response.send(outPut);
  }
});
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const dbResponse = `
    SELECT * FROM todo WHERE 
    id=${todoId}`;
  const outPut = await db.get(dbResponse);
  response.send(outPut);
});
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;

  let updateTodoQuery;
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}'
    WHERE
      id = ${todoId};`;

      await db.run(updateTodoQuery);
      response.send(`Status Updated`);
      break;
    case requestBody.priority !== undefined:
      updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}'
    WHERE
      id = ${todoId};`;

      await db.run(updateTodoQuery);
      response.send(`Priority Updated`);
      break;
    case requestBody.todo !== undefined:
      updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}'
    WHERE
      id = ${todoId};`;

      await db.run(updateTodoQuery);
      response.send(`Todo Updated`);
      break;
  }
});
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const dbResponse = `
    INSERT INTO todo (id,todo,priority,status)
    VALUES('${id}','${todo}','${priority}','${status}')`;
  await db.run(dbResponse);
  response.send("Todo Successfully Added");
});
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
