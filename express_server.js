const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


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

function ulrsForUser(id, urls) {
  let userURL = {};
  console.log(urls);
  for (let url in urls) {
    if (urls[url].userID === id) {
      userURL[url] = {
        longURL: urls[url].longURL,
      }
    }
  }
  console.log(userURL)
  return userURL;
}

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
  const userKey = req.cookies["userID"];
  const templateVars = {
    user: user,
    urls: ulrsForUser(userKey, urlDatabase)
  };
  if (!req.cookies['userID']) {
    res.render('PleaseLoginFirst', templateVars);
  } else {
    res.render("urls_index", templateVars);
  }
 
});


app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();

  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: req.cookies.userID,
  };
  console.log(urlDatabase[shortUrl]);
  res.redirect(`/urls/${shortUrl}`);
});

//create new url
app.get("/urls/new", (req, res) => {
  if (req.cookies.userID) {
    const templateVars = {
      user: users[req.cookies.userID],
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
  const userKey = req.cookies.userID;
  const shortURL = req.params.shortURL;
  if (userKey !== urlDatabase[shortURL]["userID"]) {
    console.log("Permission DENIED to edit this URL");
  } else {
    const newURL = urlDatabase[shortURL].longURL;
    urlDatabase[req.params.shortURL].longURL = req.body[newURL];
    res.redirect("/urls");
  }
});


//delete a url
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.cookies.userID;
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
    user: users[req.cookies["userID"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    //userID: req.cookies["userID"]
  };
  res.render("urls_show", templateVars);
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