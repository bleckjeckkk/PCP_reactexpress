const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const app = express();

const SELECT_ALL_SUPERMARKET_QUERY = 'SELECT * FROM supermarket WHERE supermarket.supermarketID != 0';
const SELECT_ALL_USER_QUERY ='SELECT userID, userName, firstName, lastName FROM user WHERE isAdmin != 1';

const ONLINE_CREDENTIALS = {
  host: 'sql12.freemysqlhosting.net',
  user: 'sql12303279',
  password: 'zbU2YYDlY3',
  database: 'sql12303279'
};

const OFFLINE_CREDENTIALS = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'price_check_program'
};

const CREDENTIALS = ONLINE_CREDENTIALS;

//const connection = mysql.createConnection(CREDENTIALS);

const connection = mysql.createPool({
  ...CREDENTIALS,
  connectionLimit : 20,
});


function isEmpty(obj) {
  for(var key in obj) {
    if(obj.hasOwnProperty(key))
      return false;
  }
  return true;
}

connection.getConnection(err => {
  if (err) {
    console.log(err.code);
    return err;
  }
  console.log('Connected!');
});

app.use(cors());

app.get('/', (req, res) => {
  return res.json({
    msg: 'success',
    res : 'hello there!'
  });
});

// ---------------------------------------------------------------------------
// ---------------------------------- ADDING ---------------------------------
// ---------------------------------------------------------------------------
//adds data to products
//TODO: change with the new attribute (matchID)
app.get('/products/add', (req, res) => {
  const {
    productID,
    productName,
    productPrice,
    productAvailability,
    supermarketID,
    productMatch,
  } = req.query;
  const INSERT_PRODUCTS_QUERY = `INSERT INTO product (productID,productName, productPrice, productAvailability, supermarketID, productMatch)
  VALUES (${productID},'${productName}', ${productPrice}, ${productAvailability}, ${supermarketID}, ${productMatch})`
  const NOT_ONE_SIDED_CHANGE = `UPDATE product SET productMatch = ${productID} WHERE productID = ${productMatch != 0 ? productMatch : 0}` 
  console.log(INSERT_PRODUCTS_QUERY);
  connection.query(INSERT_PRODUCTS_QUERY, (err, results) => {
    if (err) {
      return res.json({
        msg: 'error',
        res : err
      });
    } else {
      connection.query(NOT_ONE_SIDED_CHANGE, (err, results) => {
        if (err) {
          return res.json({
            msg: 'error',
            res : err
          });
        } else {
          return res.json({
            msg: 'success',
            res : results
          });
        }
      });
    }
  });
});

//adding a user
app.get('/users/add', (req, res) => {
  const { userID, userName, userPassword, firstName, lastName } = req.query;

  const salt = 10;
  bcrypt.hash(userPassword, salt, function(err, hash) {
    if (err) {
      return res.json({
        msg: 'error in hashing',
        res : err
      });
    }
    const INSERT_USERS_QUERY = `INSERT INTO user (userID, userName, userPassword, firstName, lastName, favItems)
    VALUES (${userID},'${userName}', '${hash}', '${firstName}', '${lastName}', '[]')`;
    connection.query(INSERT_USERS_QUERY, (err, results) => {
      if (err) {
        return res.json({
          msg: 'error',
          res : err
        });
      } else {
        return res.json({
          msg: 'success',
          res: results
        });
      }
    });
  });
});

//adds data to supermarket
app.get('/supermarkets/add', (req, res) => {
  const { supermarketID, supermarketName, supermarketAddress } = req.query;
  const INSERT_SUPERMARKETS_QUERY = `INSERT INTO supermarket (supermarketID, supermarketName, supermarketAddress)
  VALUES (${supermarketID},'${supermarketName}', '${supermarketAddress}')`;
  connection.query(INSERT_SUPERMARKETS_QUERY, (err, results) => {
    if (err) {
      return res.json({
        msg: 'error',
        res : err
      });
    } else {
      return res.json({
        msg: 'success',
        res : results
      });
    }
  });
});

//adding feedback
app.get('/feedbacks/add', (req, res) => {
  const {feedbackID, userID, feedbackContent, productID } = req.query;
  const INSERT_FEEDBACKS_QUERY = `INSERT INTO feedback(feedbackID, userID, feedbackContent)
  VALUES (NULL, ${userID}, '${feedbackContent}')`;
  connection.query(INSERT_FEEDBACKS_QUERY, (err, results) => {
    if (err) {
      return res.json({
        msg: 'error',
        res : err
      });
    } else {
      return res.json({
        msg: 'success',
        res : results
      });
    }
  })
})

// ---------------------------------------------------------------------------
// --------------------------------- UPDATE ----------------------------------
// ---------------------------------------------------------------------------
//Query for UPDATING specific data in a table
//updates products
app.get('/products/update', (req, res) => {
  const {
    productID,
    productName,
    productPrice,
    productAvailability,
    productMatch,
    supermarketID
  } = req.query;
  const UPDATE_PRODUCTS_QUERY = `UPDATE product SET productName = '${productName}', productPrice = '${productPrice}', productAvailability = ${productAvailability}, productMatch = ${productMatch}, supermarketID = ${supermarketID} WHERE productID=${productID}`;
  const NOT_ONE_SIDED_CHANGE = `UPDATE product SET productMatch = ${productID} WHERE productID = ${productMatch != 0 ? productMatch : 0}` 
  connection.query(UPDATE_PRODUCTS_QUERY, (err, results) =>{
    if (err) {
      return res.json({
        msg: 'error',
        res : err
      });
    } else {
      connection.query(NOT_ONE_SIDED_CHANGE, (err, results) =>{
        if (err) {
          return res.json({
            msg: 'error',
            res : err
          });
        } else {
          return res.json({
            msg: 'success',
            res : results
          });
        }
      });
    }
  });
});

//updates users
app.get('/users/update', (req, res) => {
  const { userID, userName, firstName, lastName } = req.query;
  const UPDATE_USERS_QUERY = `UPDATE user SET userName = '${userName}', firstName = '${firstName}', lastName = '${lastName}' WHERE userID = ${userID}`;
  connection.query(UPDATE_USERS_QUERY, (err, results) => {
    if (err) {
      return res.json({
        msg: 'error',
        res : err
      });
    } else {
      return res.json({
        msg: 'success',
        res : results
      });
    }
  });
});

//update supermarketAddress
app.get('/supermarkets/update', (req, res) => {
  const { supermarketID, supermarketName, supermarketAddress } = req.query;
  const UPDATE_SUPERMARKETS_QUERY = `UPDATE supermarket SET supermarketName = '${supermarketName}', supermarketAddress = '${supermarketAddress}' WHERE supermarketID = ${supermarketID}`
  connection.query(UPDATE_SUPERMARKETS_QUERY, (err, results) => {
    if (err) {
      return res.json({
        msg: 'error',
        res : err
      });
    } else {
      return res.json({
        msg: 'success',
        res : results
      });
    }
  });
});

// ---------------------------------------------------------------------------
// ---------------------------------- DELETE ---------------------------------
// ---------------------------------------------------------------------------
//Query for DELETING specific data in a table
//delete user
app.get('/users/delete', (req, res) => {
  const { userID } = req.query;
  const DELETE_USERS_QUERY = `DELETE FROM user WHERE userID = ${userID}`;
  connection.query(DELETE_USERS_QUERY, (err, results) => {
    if (err) {
      return res.json({
        msg: 'error',
        res : err
      });
    } else {
      return res.json({
        msg: 'success',
        res : results
      });
    }
  });
});

//delete products
app.get('/products/delete', (req, res) => {
  const{ productID } = req.query;
  const GET_PRODUCT_INFO = `SELECT productID, productMatch FROM product WHERE productID = ${productID}`
  const DELETE_PRODUCTS_QUERY = `DELETE FROM product WHERE productID = ${productID}`;

  connection.query(GET_PRODUCT_INFO, (err, results) => {
    if (err) {
      return res.json({
        msg: 'error',
        res : err
      });
    } else {
      matchedID = results[0].productMatch
      const REASSIGN_PAIRED_PRODUCT = `UPDATE product SET productMatch = '0' WHERE productID = ${matchedID}`
      connection.query(REASSIGN_PAIRED_PRODUCT, (err, results) => {
        if (err) {
          return res.json({
            msg: 'error',
            res : err
          });
        } else {
          connection.query(DELETE_PRODUCTS_QUERY, (err, results) => {
            if (err) {
              return res.json({
                msg: 'error',
                res : err
              });
            } else {
              return res.json({
                msg: 'success',
                res : results
              });
            }
          });
        }
      });
    }
  });
});

//delete supermarkets
app.get('/supermarkets/delete', (req, res) => {
  const{supermarketID} = req.query;
  const DELETE_LINKED_PRODUCTS = `DELETE FROM product WHERE product.supermarketID = ${supermarketID}`;
  const DELETE_SUPERMARKETS_QUERY = `DELETE FROM supermarket WHERE supermarketID = ${supermarketID}`;
  
  connection.query(DELETE_LINKED_PRODUCTS, (err, results) => {
    if (err) {
      return res.json({
        msg: 'error',
        res : err
      });
    } else {
      connection.query(DELETE_SUPERMARKETS_QUERY, (err, results) => {
        if (err) {
            return res.json({
              msg: 'error',
            res : err
          });
        } else {
          return res.json({
            msg: 'success',
            res : results
          });
        }
      });
    }
  });
});

//delete feedbacks
app.get('/feedbacks/delete', (req, res) => {
  const{feedbackID} = req.query;
  const DELETE_FEEDBACKS_QUERY = `DELETE FROM feedback WHERE feedbackID = ${feedbackID}`;
  connection.query(DELETE_FEEDBACKS_QUERY, (err, results) => {
    if (err) {
      return res.json({
        msg: 'error',
        res : err
      });
    } else {
      return res.json({
        msg: 'success',
        res : results
      });
    }
  });
});

// ---------------------------------------------------------------------------
// --------------------------------- GETTERS ---------------------------------
// ---------------------------------------------------------------------------
//gets the count of users
app.get('/users/getCount', (req, res) => {
  connection.query("SELECT MAX(userID) AS count FROM user", (err, results) => {
    if (err) {
      return res.json({
        msg: 'error',
        res : err
      });
    } else {
      return res.json({
        msg: 'success',
        res : results
      });
    }
  });
});

//gets the count of supermarkets
app.get('/supermarkets/getCount', (req, res) => {
  connection.query("SELECT MAX(supermarketID) AS count FROM supermarket", (err, results) => {
    if (err) {
      return res.json({
        msg: 'error',
        res : err
      });
    } else {
      return res.json({
        msg: 'success',
        res : results
      });
    }
  });
});

//gets the count of products
app.get('/products/getCount', (req, res) => {
  connection.query("SELECT MAX(productID) AS count FROM product", (err, results) => {
    if (err) {
      return res.json({
        msg: 'error',
        res : err
      });
    } else {
      return res.json({
        msg: 'success',
        res : results
      });
    }
  });
});

//gets the count of feedbacks
app.get('/feedbacks/getCount', (req, res) => {
  connection.query("SELECT MAX(feedbackID) AS count FROM feedback", (err, results) => {
    if (err) {
      return res.json({
        msg: 'error',
        res : err
      });
    } else {
      return res.json({
        msg: 'success',
        res : results
      });
    }
  });
});


// ---------------------------------------------------------------------------
// --------------------------------- GET ALL ---------------------------------
// ---------------------------------------------------------------------------
// gets all products in the database
const productQuery = 'SELECT productID, productName, productPrice, productAvailability, s.supermarketName, s.supermarketID, productMatch FROM product p INNER JOIN supermarket s WHERE p.supermarketID = s.supermarketID AND productID != 0 ORDER BY productID';
app.get('/products', (req, res) => {
  connection.query(productQuery, (err, results) => {
    if (err) {
      return res.json({
        msg: 'error',
        res : err
      });
    } else {
      return res.json({
        msg: 'success',
        res : results
      });
    }
  });
});

// gets all users in the database
app.get('/users', (req, res) => {
  connection.query(SELECT_ALL_USER_QUERY, (err, results) => {
    if (err) {
      return res.json({
        msg: 'error',
        res : err
      });
    } else {
      return res.json({
        msg: 'success',
        res : results
      });
    }
  });
});

// gets all supermarkets in the database
app.get('/supermarkets', (req, res) => {
  connection.query(SELECT_ALL_SUPERMARKET_QUERY, (err, results) => {
    if (err) {
      return res.json({
        msg: 'error',
        res : err
      });
    } else {
      return res.json({
        msg: 'success',
        res : results
      });
    }
  });
});

//gets all feedbacks in the database
app.get('/feedbacks', (req, res) => {
  connection.query('SELECT f.feedbackID, f.feedbackContent, usr.firstName, usr.userID FROM feedback f INNER JOIN user usr WHERE f.userID = usr.userID', (err, results) => {
    if (err) {
      return res.json({
        msg: 'error',
        res : err
      });
    } else {
      return res.json({
        msg: 'success',
        res : results
      });
    }
  });
});



// ---------------------------------------------------------------------------
// ----------------------------------- MISC ----------------------------------
// ---------------------------------------------------------------------------

// retrieves matched products
app.get('/products/find', (req, res) => {
  const {productName} = req.query;
  const SEARCH_A_PRODUCT_NAME = `SELECT
    p.productID AS p_ID,
    p.productName AS p_name,
    p.productAvailability AS p_availability,
    p.productPrice AS p_price,
    p.supermarketID AS p_marketID,
    p.supermarketName AS p_market,
    p.productMatch AS p_matchID,
	  mtch.productID AS matched_ID,
    mtch.productName AS matched_name,
    mtch.productAvailability AS matched_availability,
    mtch.productPrice AS matched_price,
    mtch.supermarketID AS matched_marketID,
    mtch.supermarketName AS matched_market
    FROM
    (
    SELECT
    	productID,
    	productName,
        productAvailability,
        productPrice,
        product.supermarketID,
        supermarketName,
        productMatch
    FROM ${CREDENTIALS.database}.product
    INNER JOIN ${CREDENTIALS.database}.supermarket
    	ON product.supermarketID=supermarket.supermarketID
    	WHERE product.supermarketID=supermarket.supermarketID )
        p,
    (
    SELECT
    	productID,
    	productName,
        productAvailability,
        productPrice,
        product.supermarketID,
        supermarketName,
        productMatch
    FROM ${CREDENTIALS.database}.product
    INNER JOIN ${CREDENTIALS.database}.supermarket
    	ON product.supermarketID=supermarket.supermarketID
    	WHERE product.supermarketID=supermarket.supermarketID)
        mtch
    WHERE p.productMatch=mtch.productID AND p.productID != 0 AND p.productName LIKE '%${productName}%'`;
  connection.query(SEARCH_A_PRODUCT_NAME, (err, results) => {
    if (err) {
      return res.json({
        msg: 'error',
        res : err
      });
    } else {
      return res.json({
        msg : 'success',
        res : results
      });
    }
  });
});

//auth for user
app.get('/users/auth', (req, res) => {
  const { userName, userPassword } = req.query;

  const GET_USERS_QUERY = `SELECT userID, userName, userPassword, isAdmin, firstName, lastName, favItems FROM user
  WHERE userName = '${userName}'`;
  connection.query(GET_USERS_QUERY, (err, results) => {
    if (err) {
      return res.send(err);
    }
    try{
      bcrypt.compare(userPassword, results[0].userPassword, function(err, isCorrect) {
        if (err) {
          return res.send(err);
        }
        return res.json({
          auth : isCorrect,
          admin : results[0].isAdmin,
          user : {
            id : results[0].userID,
            firstName : results[0].firstName,
            lastName : results[0].lastName,
            userName : results[0].userName,
            favItems : results[0].favItems,
          }
        });
      });
    }catch(e){
      return res.json({
        auth : false,
        admin : false,
        message: 'an error occurred!',
        error : e
      });
    }
  });
});

//checking for username uniqueness
app.get('/users/check', (req, res) => {
  const { userName } = req.query;

  const GET_USERS_QUERY = `SELECT userName FROM user
  WHERE userName = '${userName}'`;
  connection.query(GET_USERS_QUERY, (err, results) => {
    if (err) {
      return res.send(err);
    }
    try{
      if(isEmpty(results)){
        return res.json({
            unique : true
        });
      }else{
        return res.json({
          unique: false
        })
      }
    }catch(e){
      return res.json({
        message: 'an error occurred!',
        error : e
      });
    }
  });
});

//to call when "transforming" keys to products
app.get('/products/getProducts', (req,res) =>{
  const {products} = req.query;
  var prod = JSON.parse(products);

  var query = `SELECT
    p.productID AS p_ID,
    p.productName AS p_name,
    p.productAvailability AS p_availability,
    p.productPrice AS p_price,
    p.supermarketID AS p_marketID,
    p.supermarketName AS p_market,
    p.productMatch AS p_matchID,
    mtch.productID AS matched_ID,
    mtch.productName AS matched_name,
    mtch.productAvailability AS matched_availability,
    mtch.productPrice AS matched_price,
    mtch.supermarketID AS matched_marketID,
    mtch.supermarketName AS matched_market
    FROM
    (
    SELECT
      productID,
      productName,
        productAvailability,
        productPrice,
        product.supermarketID,
        supermarketName,
        productMatch
    FROM ${CREDENTIALS.database}.product
    INNER JOIN ${CREDENTIALS.database}.supermarket
      ON product.supermarketID=supermarket.supermarketID
      WHERE product.supermarketID=supermarket.supermarketID )
        p,
    (
    SELECT
      productID,
      productName,
        productAvailability,
        productPrice,
        product.supermarketID,
        supermarketName,
        productMatch
    FROM ${CREDENTIALS.database}.product
    INNER JOIN ${CREDENTIALS.database}.supermarket
      ON product.supermarketID=supermarket.supermarketID
      WHERE product.supermarketID=supermarket.supermarketID)
        mtch
    WHERE p.productMatch=mtch.productID AND p.productID != 0 AND (`;

  prod.map((item)=>{
    query = query.concat(`p.productID = ${item} OR `);
  })
  query = query.concat("FALSE)");

  connection.query(query, (err, results) => {
    if (err) {
      return res.json({
        msg: 'error',
        res : err
      });
    } else {
      return res.json({
        msg : 'success',
        res : results
      });
    }
  });
});

app.get('/users/updateFav', (req,res) =>{
  const { userID, favItems } = req.query;
  const UPDATE_FAVITEMS_QUERY = `UPDATE user SET favItems = '${favItems}' WHERE user.userID = ${userID};`
  connection.query(UPDATE_FAVITEMS_QUERY, (err, results) => {
    if (err) {
      return res.json({
        msg: 'error',
        res : err
      });
    } else {
      return res.json({
        msg : 'success',
        res : results
      });
    }
  });
});

app.get('/users/info', (req, res) =>{
  const { id } = req.query;
  const GET_USERS_QUERY = `SELECT userID, userName, firstName, lastName, favItems FROM user
  WHERE userID = '${id}'`;
  connection.query(GET_USERS_QUERY, (err, results) => {
    if (err) {
      return res.send(err);
    }
    return res.json({
      user : {
        id : results[0].userID,
        firstName : results[0].firstName,
        lastName : results[0].lastName,
        userName : results[0].userName,
        favItems : results[0].favItems,
      }
    });
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`PCP API listening on port ${PORT}`);
  console.log(`Using host ${CREDENTIALS.host}`);
});
