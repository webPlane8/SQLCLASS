const { faker } = require("@faker-js/faker");
const express = require("express");
const app = express();
const mysql = require("mysql2");
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");

let port = 8080;

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "delta_app",
  password: "szs03466171",
});

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

app.get("/", (req, res) => {
  let q = "select count(*) from user";
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]["count(*)"];
      res.render("index.ejs", { count });
    });
  } catch (err) {
    console.log(err);
    res.send(`some error in db`);
  }
});

app.get("/user", (req, res) => {
  let q = "select * from user";
  try {
    connection.query(q, (err, users) => {
      if (err) throw err;
      res.render("showusers.ejs", { users });
    });
  } catch (err) {
    console.log(err);
    // res.send(`some error in db`);
  }
});
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `select * from user where id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      // console.log(user);
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    // res.send(`some error in db`);
  }
});

app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password: formPassword, name: formname } = req.body;
  let q = `select * from user where id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      // console.log(result);
      if (formPassword != user.password) {
        res.send("Wrong password");
      } else {
        let q2 = `update user set name='${formname}' where id='${id}'`;
        connection.query(q2, (err, result) => {
          if (err) throw err;
          res.redirect("/user");
        });
      }
    });
  } catch (err) {
    console.log(err);
  }
});

app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/user", (req, res) => {
  let id = uuidv4();
  let { name, email, password } = req.body;
  let q = `insert into user (id, name, email, password) values ('${id}', '${name}', '${email}', '${password}')`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log(result);
      res.redirect("/user");
      // let user = result[0];
      // res.send(result);
      // res.render("edit.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    // res.send(`some error in db`);
  }
});

app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `select * from user where id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      // console.log(result);
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    console.log(err);
  }
});

// app.delete("/user/:id", (req, res) => {
//   let { id } = req.params;
//   console.log(id);
// });

app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let { email: subemail, password: subpassword } = req.body;
  let q = `select * from user where id='${id}'`;
  // let q = `delete from user where id='${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log(result);
      let user = result[0];
      if (subemail != user.email || subpassword != user.password) {
        res.send(
          `The password and email combination you have entered to delete is incorrect.`
        );
      } else {
        let q2 = `delete from user where id='${id}'`;
        connection.query(q2, (err, result) => {
          if (err) throw err;
          // res.send(`delete query working`);
          res.redirect("/user");
        });
      }
      // res.redirect("/user");
    });
  } catch (err) {
    console.log(err);
  }
  // res.send(`delete request working`);
});

app.listen(port, () => {
  console.log(`server is listening on port:${port}`);
});
