const mainAPI = require('../api/mainAPI');

exports.index = function (req, res) {
    // res.redirect('/dashboard');
    res.redirect('/login');
}

exports.login = function (req, res) {
    if (req.session.HAS_LOGGED_IN) {
        res.redirect("/dashboard");
    } else {
        res.render('login', {
            show_error: false
        });
    }
}

// exports.post_login = async function (req, res) {
//     try {

//         const minitial = (req.body.mname).substring(0,1);
//         req.session.ID = req.body.user_id;
//         req.session.NAME = req.body.fname + " " + minitial + ". " + req.body.lname;
//         req.session.DESIGNATION = req.body.designation;
//         req.session.DEPARTMENT = req.body.department;

//         req.session.HAS_LOGGED_IN = true;

//         const result = { status: "success" };
//         res.send(result);

//     } catch (err) {
//         console.log(err);
//         res.render('login', {
//             show_error: true
//         });
//     }
// }

exports.post_login = async function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const user = await mainAPI.get_user(username, password);

        req.session.ID = user[0].id;
        req.session.NAME = user[0].fname + " " + user[0].mname + ". " + user[0].lname;
        req.session.DESIGNATION = user[0].designation;
        req.session.DEPARTMENT = user[0].department;

        req.session.HAS_LOGGED_IN = true;

        res.redirect('/dashboard');
    } catch (err) {
        console.log(err);
        res.render('login', {
            show_error: true
        });
    }
}

exports.logout = function (req, res) {
    if (req.session) {
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                res.redirect("/");
            }
        });
    }
}

exports.dashboard = function (req, res) {
    if (req.session.HAS_LOGGED_IN) {
        res.render('dashboard');
        // res.render('documents');
    } else {
        res.redirect('/login');
    }
}

exports.documents = function (req, res) {
    if (req.session.HAS_LOGGED_IN) {
        res.render('documents');
    } else {
        res.redirect('/login');
    }
}

exports.all_documents = function (req, res) {
    if (req.session.HAS_LOGGED_IN) {
        res.render('all_documents');
    } else {
        res.redirect('/login');
    }
}