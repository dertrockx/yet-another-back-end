const Post = require("../models/Post");
const User = require("../models/User");
const mongoose = require("mongoose");

exports.list = async (req, res) => {
	console.log(req.user || "No user found");
	let posts = await Post.find().populate("author").sort({ createdAt: "desc" });

	res.json({
		posts,
	});
};

exports.create = async (req, res) => {
	const { author = null, content = "" } = req.body;
	if (!author || !content) {
		res.status(400);
		return res.json({
			success: false,
			msg: "Author and content fields are required",
		});
	}
	try {
		// check if user exists
		const user = await User.findById(author);
		if (!user) {
			res.status(404);
			return res.json({
				success: false,
				msg: `Error, can't find user with id ${author}`,
			});
		}

		const post = new Post({
			author,
			content,
		});

		await post.save();
		console.log("Successfully saved post!");
		post.author = user;
		return res.json({
			success: true,
			msg: "Post created successfully!",
			post,
		});
	} catch (err) {
		console.log(err);
		res.status(500);
		return res.json({
			success: false,
			msg: "Server error, please contact admin...",
		});
	}
};

exports.get = async (req, res) => {
	const { id = "" } = req.params;
	try {
		const post = await Post.findById(id);
		if (!post) {
			res.status(404);
			return res.json({
				success: false,
				msg: `Post with id ${id} not found`,
			});
		}
		return res.json({
			success: true,
			msg: "Successfully got post",
			post,
		});
	} catch (err) {
		console.log(err);
		if (err instanceof mongoose.Error.CastError) {
			res.status(400);
			return res.json({
				success: false,
				msg: "Invalid ID provided",
			});
		}
		res.status(500);
		return res.json({
			success: false,
			msg: "Server error... please contact admin",
		});
	}
};

// only update the content, not owner
exports.update = async (req, res) => {
	const { content = null } = req.body;
	const { id = "" } = req.params;
	if (!id) {
		res.status(400);
		return res.json({
			success: false,
			msg: "ID field is required...",
		});
	}
	if (!content) {
		res.status(400);
		return res.json({
			success: false,
			msg: "content field is required, can't be null",
		});
	}
	try {
		// const post = await Post.findByIdAndUpdate(id, { content });
		const post = await Post.findById(id);
		if (!post) {
			res.status(404);
			return res.json({
				success: false,
				msg: `Post with id ${id} not found`,
			});
		}
		// console.log(, req.user._id);

		if (!post.author.equals(req.user._id)) {
			res.status(403);
			return res.json({
				success: false,
				msg: "Unauthorized, can' edit someone else's post",
			});
		}
		post.content = content;
		await post.save();

		return res.json({
			success: true,
			msg: "Successfully updated post",
			post: post,
		});
	} catch (err) {
		console.log(err);
		res.status(500);
		return res.json({
			success: false,
			msg: "Server error... please contact admin",
		});
	}
};

exports.delete = async (req, res) => {
	const { id } = req.params;
	try {
		// const post = await Post.findByIdAndRemove(id);
		const post = await Post.findById(id);
		if (!post) {
			res.status(404);
			return res.json({
				success: false,
				msg: `Post with id ${id} not found`,
			});
		}
		if (!post.author.equals(req.user._id)) {
			res.status(403);
			return res.json({
				success: false,
				msg: "Unauthorized, can' edit someone else's post",
			});
		}

		await Post.findByIdAndRemove(id);
		return res.json({
			success: true,
			msg: "Successfully deleted post",
			post: post,
		});
	} catch (err) {
		console.log(err);
		res.status(500);
		return res.json({
			success: false,
			msg: "Server error... please contact admin",
		});
	}
};
