const path = require('path');

// Use the existing dishes data
const dishes = require(path.resolve('src/data/dishes-data'));

// Use this function to assign ID's when necessary
const nextId = require('../utils/nextId');

// TODO: Implement the /dishes handlers needed to make the tests pass
////////////////////////////////////////////////
// --------------- MIDDLEWARE --------------- //
////////////////////////////////////////////////
const bodyDataHas = propertyName => {
	return (req, res, next) => {
		const { data = {} } = req.body;
		if (data[propertyName]) {
			return next();
		}
		next({ status: 400, message: `Must include a ${propertyName}` });
	};
};

const priceIsValidNumber = (req, res, next) => {
	const { data: { price } = {} } = req.body;
	if (price < 0 || !Number.isInteger(price)) {
		return next({
			status: 400,
			message: 'price',
		});
	}
	next();
};

const dishExists = (req, res, next) => {
	const { dishId } = req.params;
	const foundDish = dishes.find(dish => dish.id === dishId);
	if (foundDish) {
		res.locals.dish = foundDish;
		return next();
	}
	next({
		status: 404,
		message: `Dish does not exist: ${dishId}.`,
	});
};

const dishIdMatch = (req, res, next) => {
	const { dishId } = req.params;
	const { data: { id } = {} } = req.body;

	if (id === undefined || id === '' || id === null) {
		return next();
	}

	if (id !== dishId) {
		return next({
			status: 400,
			message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
		});
	}

	next();
};

////////////////////////////////////////////////
// ------------- ROUTE HANDLERS ------------- //
////////////////////////////////////////////////
// LIST route handler
const list = (req, res) => res.json({ data: dishes });

// CREATE route handler
const create = (req, res) => {
	const { data: { name, description, price, image_url } = {} } = req.body;

	// NEW DISH creation
	const newDish = {
		id: nextId(),
		name,
		description,
		price,
		image_url,
	};
	dishes.push(newDish);
	res.status(201).json({ data: newDish });
};

// READ route handler
const read = (req, res) => res.json({ data: res.locals.dish });

// UPDATE route handler
const update = (req, res) => {
	const dish = res.locals.dish;
	const { data: { name, description, price, image_url } = {} } = req.body;

	// DISH update
	dish.name = name;
	dish.description = description;
	dish.price = price;
	dish.image_url = image_url;

	res.json({ data: dish });
};

////////////////////////////////////////////////
// ------------- MODULE EXPORTS ------------- //
////////////////////////////////////////////////
module.exports = {
	list,
	create: [
		bodyDataHas('name'),
		bodyDataHas('description'),
		bodyDataHas('price'),
		bodyDataHas('image_url'),
		priceIsValidNumber,
		create,
	],
	read: [dishExists, read],
	update: [
		dishExists,
		dishIdMatch,
		bodyDataHas('name'),
		bodyDataHas('description'),
		bodyDataHas('price'),
		bodyDataHas('image_url'),
		priceIsValidNumber,
		update,
	],
};
