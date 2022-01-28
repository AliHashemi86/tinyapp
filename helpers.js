const getUserByEmail = (email, database) => {
  for (let userID in database) {
    if (database[userID].email === email) {
      return database[userID];
    }
  }
  return undefined;
};

const generateRandomString = () => {
  let num = (Math.random() + 1).toString(36).substring(7);
  return num;
};

const ulrsForUser = (id, urls) => {
  let userURL = {};
  for (let url in urls) {
    if (urls[url].userID === id) {
      userURL[url] = {
        longURL: urls[url].longURL,
      };
    }
  }
  return userURL;
};


module.exports = {
  getUserByEmail,
  ulrsForUser,
  generateRandomString
};