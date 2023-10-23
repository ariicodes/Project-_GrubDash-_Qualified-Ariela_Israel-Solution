const path = require('path');

// Use the existing order data
const orders = require(path.resolve('src/data/orders-data'));

// Use this function to assign ID's when necessary
const nextId = require('../utils/nextId');

// TODO: Implement the /orders handlers needed to make the tests pass
////////////////////////////////////////////////
// --------------- MIDDLEWARE --------------- //
////////////////////////////////////////////////

const bodyDataHas = propertyName => {
	return (req, res, next) => {
		const { data = {} } = req.body;
		if (!data[propertyName]) {
			return next({
				status: 400,
				message: `Order must include ${propertyName}`,
			});
		}
		next();
	};
};

const dishPropertyIsValid = (req, res, next) => {
	const { data: { dishes } = {} } = req.body;

	if (!dishes || dishes.length === 0 || !Array.isArray(dishes)) {
		return next({
			status: 400,
			message: 'Dishes must be a non-empty array of valid dishes.',
		});
	}

	for (let i = 0; i < dishes.length; i++) {
		const dish = dishes[i];
		if (
			dish.quantity === undefined ||
			dish.quantity <= 0 ||
			!Number.isInteger(dish.quantity)
		) {
			return next({
				status: 400,
				message: `Dish quantity for dish at index ${i} must be valid.`,
			});
		}
	}

	next();
};

const quantityIsValidNumber = (req, res, next) => {
	const { data: { dishes } = {} } = req.body;

	for (let i = 0; i < dishes.length; i++) {
		const dish = dishes[i];
		if (
			!dish.quantity ||
			dish.quantity === 0 ||
			!Number.isInteger(dish.quantity)
		) {
			return next({
				status: 400,
				message: `Dish quantity for dish at index ${i} must be valid.`,
			});
		}
	}

	next();
};

const orderExists = (req, res, next) => {
	const { orderId } = req.params;
	const foundOrder = orders.find(order => order.id === orderId);

	if (foundOrder) {
		res.locals.order = foundOrder;

		if (req.body.data && req.body.data.id && req.body.data.id !== orderId) {
			return next({
				status: 400,
				message: `Order id does not match route id. Order: ${req.body.data.id}, Route: ${orderId}.`,
			});
		}

		return next();
	}

	next({
		status: 404,
		message: `Order does not exist: ${orderId}.`,
	});
};

const statusPropertyIsValid = (req, res, next) => {
	const { data: { status } = {} } = req.body;
	const validStatus = ['pending', 'out-for-delivery', 'delivered'];
	if (validStatus.includes(status)) {
		return next();
	}
	next({
		status: 400,
		message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
	});
};

const checkIfPending = (req, res, next) => {
	const order = res.locals.order;
	if (order) {
		if (order.status !== 'pending') {
			return next({
				status: 400,
				message: `An order cannot be deleted unless it is pending.`,
			});
		}
		next();
	}
};

////////////////////////////////////////////////
// ------------- ROUTE HANDLERS ------------- //
////////////////////////////////////////////////
// LIST route handler
const list = (req, res) => res.json({ data: orders });

// CREATE route handler
const create = (req, res) => {
	const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

	const newOrder = {
		id: nextId(),
		deliverTo,
		mobileNumber,
		dishes,
	};
	orders.push(newOrder);
	res.status(201).json({ data: newOrder });
};

// READ route handler
const read = (req, res) => res.json({ data: res.locals.order });

// UPDATE route handler
const update = (req, res) => {
	const order = res.locals.order;
	const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

	// ORDER update
	order.deliverTo = deliverTo;
	order.mobileNumber = mobileNumber;
	order.dishes = dishes;

	res.json({ data: order });
};

// DESTROY route handler
const destroy = (req, res) => {
	const { orderId } = req.params;
	const index = orders.findIndex(order => order.id === orderId);

	orders.splice(index, 1);
	res.sendStatus(204);
};

////////////////////////////////////////////////
// ------------- MODULE EXPORTS ------------- //
////////////////////////////////////////////////

module.exports = {
	list,
	create: [
		bodyDataHas('deliverTo'),
		bodyDataHas('mobileNumber'),
		bodyDataHas('dishes'),
		dishPropertyIsValid,
		quantityIsValidNumber,
		create,
	],
	read: [orderExists, read],
	update: [
		bodyDataHas('deliverTo'),
		bodyDataHas('mobileNumber'),
		bodyDataHas('dishes'),
		bodyDataHas('status'),
		dishPropertyIsValid,
		quantityIsValidNumber,
		statusPropertyIsValid,
		orderExists,
		update,
	],
	delete: [orderExists, checkIfPending, destroy],
};
