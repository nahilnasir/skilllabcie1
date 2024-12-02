const express = require('express');
const cron = require('node-cron');

const app = express();
app.use(express.json());

// Menu: In-memory array for storing menu items
const menu = [
  { id: 1, name: 'Pizza', price: 10, category: 'Main' },
  { id: 2, name: 'Burger', price: 5, category: 'Main' },
  { id: 3, name: 'Pasta', price: 7, category: 'Main' },
  { id: 4, name: 'Salad', price: 4, category: 'Side' },
  { id: 5, name: 'Coke', price: 2, category: 'Drink' },
];

// Orders: In-memory array for storing orders
let orders = [];

// Order Queue: Queue to simulate order processing
let orderQueue = [];

// Order Status Constants
const ORDER_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

// Simulate the order processing status updates periodically
cron.schedule('*/5 * * * *', () => {
  if (orderQueue.length > 0) {
    const orderId = orderQueue.shift(); // Get the next order from the queue
    const order = orders.find(o => o.id === orderId);
    
    if (order.status === ORDER_STATUS.PENDING) {
      order.status = ORDER_STATUS.IN_PROGRESS;
      console.log(`Order ${orderId} is now In Progress.`);
    } else if (order.status === ORDER_STATUS.IN_PROGRESS) {
      order.status = ORDER_STATUS.COMPLETED;
      console.log(`Order ${orderId} is now Completed.`);
    }
  }
});

// API to get the menu
app.get('/menu', (req, res) => {
  res.json(menu);
});

// API to place an order
app.post('/order', (req, res) => {
  const { items } = req.body; // Items should be an array of item IDs
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in the order.' });
  }

  const orderItems = menu.filter(item => items.includes(item.id));
  if (orderItems.length !== items.length) {
    return res.status(400).json({ error: 'Some items are invalid.' });
  }

  const orderId = orders.length + 1;
  const newOrder = {
    id: orderId,
    items: orderItems,
    total: orderItems.reduce((sum, item) => sum + item.price, 0),
    status: ORDER_STATUS.PENDING,
  };

  orders.push(newOrder);
  orderQueue.push(orderId); // Add order to the processing queue
  console.log(`Order ${orderId} placed successfully!`);
  
  res.status(201).json(newOrder);
});

// API to get the status of an order
app.get('/order/:id', (req, res) => {
  const orderId = parseInt(req.params.id);
  const order = orders.find(o => o.id === orderId);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }
  
  res.json(order);
});

// Start the Express server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${3000}`);
});
