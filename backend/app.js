// Import modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

// AWS SDK v3 imports
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

// Create DynamoDB client
const client = new DynamoDBClient({ region: "ap-south-1" });
const dynamoDocClient = DynamoDBDocumentClient.from(client);

// Create Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// POST route to add expense
app.post('/addExpense', async (req, res) => {
    console.log('Request body:', req.body); // Debug log

    const { amount, date, category } = req.body;

    // Validate input
    if (!amount || !date || !category) {
        return res.status(400).send('All fields (amount, date, category) are required.');
    }

    const params = {
        TableName: 'DailyExpenses',
        Item: {
            ExpenseID: uuidv4(),
            Amount: Number(amount),
            Date: date,
            Category: category
        }
    };

    try {
        await dynamoDocClient.send(new PutCommand(params));
        console.log('Added item:', params.Item);
        res.send('Expense added successfully!');
    } catch (err) {
        console.error('Error adding item:', err);
        res.status(500).send('Error adding item');
    }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
