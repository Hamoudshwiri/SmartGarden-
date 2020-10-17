/* ---------------------------------------- SETUP ---------------------------------------- */
// express
const express = require('express');
const app = express();

// packages
const fs = require('fs');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
const cors = require('cors')
const session = require('express-session');

// app use
app.use(express.static(__dirname + '/public/build'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());
app.use(session({
    secret: 'smart_garden',
    resave: true,
    saveUninitialized: true,
    cookie: {
        path: '/', 
        httpOnly: true, 
        secure: false, 
        maxAge: null
    }
}));

// modules
const {registerUser, checkUser, verifyUser, confirmVerifiedUser, sendResetLink, resetPass} = require('./modules/usersAuth')

// user
const userRoutes = require('./routes/userRoutes');

// port
const port = process.env.PORT || 5000;

/* ---------------------------------------- POST ROUTES ---------------------------------------- */
app.post('/register', (req, res) => {
    // your post register handler here
    // console.log(req.body)
    // 2 data error
    // 1 user registered successfully
    // 3 user is exist
    // 4 server error
    const firstName = req.body.firstName.trim();
    const lastName = req.body.lastName.trim();
    const userName = req.body.userName.trim();
    const email = req.body.email.trim();
    const password = req.body.password;
    const repassword = req.body.repassword;
    if (firstName && lastName && userName && email && password && password == repassword){
        registerUser(entities.encode(firstName), entities.encode(lastName), entities.encode(userName), entities.encode(email), password).then(() => {
            res.json(1)
        }).catch(error => {
            console.log(error);
            if (error == "exist") {
                res.json(3)
            } else{
                res.json(4)
            }
        })
    } else {
        res.json(2)
    };
});

app.post('/login', (req, res) => {
    // 1 login success
    // 2 serverError
    // 3 password is wrong
    // 4 user not exist
    if (req.body.email && req.body.password) {
        checkUser(entities.encode(req.body.email.trim()), req.body.password).then(user => {
            req.session.user = user
            res.json(1)
        }).catch(error => {
            console.log(error);
            if (error == 3) {
                res.json(3)
            } else {
                res.json(4)
            };
        })
    } else {
        res.json(2)
    };
});

// verify user
app.post('/verification', (req, res) => {
    verifyUser(req.body.email).then(() => {
        res.json(1);
        // confirm the user with email 
        confirmVerifiedUser(req.body.email).then(() => {
            res.json(1);
        }).catch(err => {
            res.json(2)
        });
    }).catch(err => {
        res.json(2)
      console.log(err);
    });
  });

// Reset user Pass page
app.post('/sendResetLink', (req, res) => {
    // 1 sending success
    // 2 serverError
    // 4 user not exist
    sendResetLink(req.body.email).then(() => {
        res.json(1);
    }).catch(err => {
        if (err == 4) {
            res.json(4)
        } else {
            res.json(2)
        }
      console.log(err);
    });
  });

// Reset user Pass query
app.post('/resetPass', (req, res) => {
    // 1 sending success
    // 2 serverError
    resetPass(req.body.email, req.body.id, req.body.pass).then(() => {
        res.json(1);
    }).catch(err => {
        if (err == 4) {
            res.json(4)
        } else {
            res.json(2)
        }
    });
  });

// checklogin
app.post('/checklogin', (req, res) => {
    // just for development, delete for production!!!
    req.session.user = {
        id: 3,
        firstname: 'Felix',
        lastname: 'Wurst',
        username: 'felix',
        email: 'felix.wurst@gmail.com',
        password: 'sha1$8212f6a2$1$0714d58be01c48e54a40320817e6dfbdf53af8da',
        verified: 1
    };
    // console.log(req.session.user);
    if (req.session.user) {
        res.json(req.session.user.username);
    } else {
        res.json(10);
    }
});

/* ---------------------------------------- USE ROUTES ---------------------------------------- */
app.use('/user', userRoutes);

app.use('/', (req, res) => {
    const html = fs.readFileSync(__dirname + '/public/build/index.html', 'utf-8');
    res.send(html);
});

/* ---------------------------------------- LOCALHOST ---------------------------------------- */
app.listen(port, () => {
    console.log(`App is listening to port: ${port}`);
});


/*
robot.txt
# https://www.robotstxt.org/robotstxt.html
#User-agent: *
#Disallow:

*/ 