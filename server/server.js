const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const express = require("express");
const { createServer } = require('http');
const {setupSocketServer} = require('./socketServer')
const { sendConfirmationEmails } = require('./jobs/sendConfirmationEmails');
const cron = require('node-cron');

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
const app = require('./app');
const httpServer = createServer(app);

setupSocketServer(httpServer)

const DB = process.env.MONGO_URI.replace(
    '<password>',
    process.env.MONGO_PASSWORD
)
    .replace('<cluster>', process.env.MONGO_CLUSTER_NAME)
    .replace('<database>', process.env.MONGO_DATABASE);

mongoose.connect(DB).then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3001;
const server = httpServer.listen(port, () => {
  console.log(`App running on port ${port}...`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// sendConfirmationEmails();

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
