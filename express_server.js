const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);
const PORT = 8080;


const {
  getUserByEmail, 
  ulrsForUser, 
  generateRandomString
} = require('./helpers');


// enable js with ejs
app.set('view engine', 'ejs');

// enable parse for POST
app.use(bodyParser.urlencoded({extended: true}));

//enable encryption of cookies
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


//DATABASE//
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  }
};

// REGISTERED USERS//
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", salt)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", salt)

  }
};


//PAGES//

//Home page
app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/url.jason", (req, res) => {
  res.json(urlDatabase);
});


//Register
app.get('/register', (req, res) => {
  if (users[req.session.userID]) {
    res.redirect('/urls')
    return;
  }
  const templateVars = {user: users[req.session.userID]};
  res.render('register', templateVars);
});


app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  if (!userEmail || !userPassword) {
    res.status(400).send("Both email & password are required");
  } else if (getUserByEmail(userEmail, users)) {
    res.status(400).send("User already exists."
      );
  } else {
    const hashedPassword = bcrypt.hashSync(userPassword, salt);
    const id = generateRandomString();
    users[id] = {
      id: id,
      email: userEmail,
      password: hashedPassword,
    };
    req.session["userID"] = id;

    res.redirect("/urls");
  }
});
  

//Login
app.get('/login', (req, res) => {
  if (users[req.session.userID]) {
    res.redirect("/urls");
    return;
  } 
  const user = users[req.session['userID']];
  const templateVars = { urls: urlDatabase, user: user};
  res.render('login', templateVars);
});


app.post('/login', (req, res) => {
  const id = req.body.userID;
  const password = req.body.password;
  const email= req.body.email;
  const userCheck = getUserByEmail(email, users);
  
  if (userCheck && bcrypt.compareSync[password, userCheck.password]) {
    req.session(userID) = userCheck.userID,
    res.redirect('/urls');
  } else {
    res.status(403).send("Please enter correct information");
  }
});


//Logout
app.post('/logout', (req, res) => {
  req.session = null;
  
  res.redirect('/urls');
});


//urls page
app.get("/urls", (req, res) => {
  const userID = req.session.userID
  const user = users[userID];
  const userURLS = ulrsForUser(userID, urlDatabase)
  const templateVars = {
    user: users[userID],
    urls: userURLS
  };
  if (!user) {
    res.status(401);
  } 
    res.render("urls_index", templateVars);
});



app.post("/urls", (req, res) => {
  if (req.session.userID) {
    const shortUrl = generateRandomString();
    urlDatabase[shortUrl] = {
      longURL: req.body.longURL,
      userID: req.session.userID
    }
    res.redirect(`/urls/${shortUrl}`);
  } else {
    res.status(401).send("You must login")
  }
});


//create new url
app.get("/urls/new", (req, res) => {
  if (req.session.userID) {
    const templateVars = {
      user: users[req.session.userID],
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});


//Redirect to long url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


//update a url
app.post("/urls/:shortURL/update", (req, res) => {
  const userKey = req.session.userID;
  const shortURL = req.params.shortURL;
  if (userKey !== urlDatabase[shortURL]["userID"]) {
    console.log("Permission DENIED to edit this URL");
  } else {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});


//delete a url
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.userID;
  const shortURL = req.params.shortURL;
  if (userID !== urlDatabase[shortURL]["userID"]) {
    console.log("Permission Denied to delete this URL");
  } else {
    delete urlDatabase[shortURL];
    res.redirect(`/urls/`);
  }
});


//short urls page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.session["userID"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
  };
  res.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Tinny app is listening on port ${PORT}`);
});