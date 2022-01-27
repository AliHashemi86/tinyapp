const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const emailExists = (email) => {
  for (let userID in users) {
    if (users[userID]['email'] === email) {
      return true;
    }
  }
  return false;
};

function generateRandomString() {
  let num = (Math.random() + 1).toString(36).substring(7);
return num;
};

//Register
app.get('/register', (req, res) => {
  const templateVars = {user: null};
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).end();

  } else if (emailExists(email)) {
    res.status(400).end();

  } else {
    const userID = generateRandomString();

    const newUser = {
      userID,
      email,
      password
    };
  
    users[userID] = newUser;
    res.cookie("userID", userID);
    res.redirect('/urls');
  }
});
  

//Login
app.get('/login', (req, res) => {
  const user = users[req.cookies['userID']];
  const templateVars = { urls: urlDatabase, user: user};
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  console.log(req.body);
  const userID = req.body.userID;
  const password = req.body.password;
  const userCheck = emailExists(userID, password);
  
  if (!userCheck) {
    res.status(403).end();
  } else if (userCheck && userID['password'] !== req.body.password) {
    res.status(403).end();
  } else {
    res.cookie('userID', userID);
    res.redirect('/urls');
  }
});


//Logout
app.post('/logout', (req, res) => {
  res.clearCookie('userID');
  
  res.redirect('/urls');
});

//urls page
app.get("/urls", (req, res) => {
  const user = users[req.cookies['userID']];
  const templateVars = { urls: urlDatabase, user: user};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  console.log("body longURL: ", req.body.longURL);
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect(`/urls/${shortUrl}`);
});

app.post('/urls/:id', (req, res) => {
  console.log(req.params.id);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls');
});

//delete a url
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortUrl = generateRandomString();
  console.log("body longURL: ", req.body.longURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

//create new url
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.userID],
  }
  res.render("urls_new", templateVars);
});

//short urls page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    userID: req.cookies["userID"]
  };
  res.render("urls_show", templateVars);
});

//Redirect to long url
app.get("/u/:shortURL", (req, res) => {
  console.log(urlDatabase);
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Home page
app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/url.jason", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.listen(PORT, () => {
  console.log(`Tinny app is listening on port ${PORT}`);
});