const controllers = require("./controllers");
const authMiddleware = require("./middlewares/auth");

module.exports = (app) => {
	// dito na rin yung get user by email query?
	app.get("/users", controllers.userController.list);
	app.post("/users/signup", controllers.userController.signUp);
	app.post("/users/login", controllers.userController.login);
	app.get("/users/checkAuth", controllers.userController.checkAuth);

	// for post related requests
	app.get("/posts", [authMiddleware], controllers.postController.list);
	app.get("/posts/:id", [authMiddleware], controllers.postController.get);
	app.patch("/posts/:id", [authMiddleware], controllers.postController.update);
	app.delete("/posts/:id", [authMiddleware], controllers.postController.delete);
	app.post(
		"/posts/create",
		[authMiddleware],
		controllers.postController.create
	);

	app.get("/protected", [authMiddleware], (req, res) => {
		res.send("Authenticated, cool");
	});

	// friend-related request
	app.post(
		"/friends/add",
		[authMiddleware],
		controllers.userController.sendFriendRequest
	);
	app.post(
		"/friends/accept",
		[authMiddleware],
		controllers.userController.acceptFriendRequest
	);
	// same controllers for rejecting and deleting friendship
	app.post(
		"/friends/reject",
		[authMiddleware],
		controllers.userController.rejectFriendRequest
	);
	app.post(
		"/friends/delete",
		[authMiddleware],
		controllers.userController.rejectFriendRequest
	);
};
