//Call NPM packages
const inquirer = require('inquirer');
const chalk = require('chalk');
const low = require('lowdb'); //database
const FileSync = require('lowdb/adapters/FileSync'); //sync the data in the database
const crypto = require('crypto'); //provide a unique ID
const figlet = require("figlet");


//Store all the data in the lowdb database
const adapter = new FileSync('db.json');
const db = low(adapter);

// Set some defaults if your JSON file is empty
db.defaults({ inventory: [] })
    .write();


function mainMenu() {


    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: chalk.magenta('What would you like to do?'),
            choices: [
                'Add new item',
                'Update an item',
                'Delete an item',
                'View inventory',
                'View item details', // New option
                chalk.red('Exit')
            ],
        },
    ]).then((answers) => {
        switch (answers.action) {
            case 'Add new item':
                addItem();
                break;
            case 'Update an item':
                updateItem();
                break;
            case 'Delete an item':
                deleteItem();
                break;
            case 'View inventory':
                viewInventory();
                break;
            case 'View item details':
                viewItemDetails();
                break;
            default:
                process.exit();
        }
    });
}

//Welcome Message in BIG
console.log(chalk.blue(figlet.textSync("Welcome")));
//

// Call the main menu function
mainMenu();
//*** Below are all the function: Add Item, View items, Update ideam, and Dealete item. ***

//Add and Item Function
function addItem() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter the item name:',
            validate: function (value) {
                if (value.toLowerCase() === 'cancel') {
                    return true;
                }
                return value.length > 0 || 'Name cannot be empty';
            },
        }
    ]).then((answer) => {
        if (answer.name.toLowerCase() === 'cancel') {
            console.log();
            console.log(chalk.gray("Returning to main menu..."));
            console.log();
            return mainMenu();
        }

        let itemName = answer.name;

        inquirer.prompt([
            {
                type: 'input',
                name: 'quantity',
                message: 'Enter the quantity:',
                validate: function (value) {
                    if (value.toLowerCase() === 'cancel') {
                        return true;
                    }
                    var valid = /^[0-9]*(\.[0-9]+)?$/.test(value);
                    return valid || 'Please enter a number';
                },
            }
        ]).then((answer) => {
            if (answer.quantity.toLowerCase() === 'cancel') {
                console.log();
                console.log(chalk.yellow("Returning to main menu"));
                console.log();
                return mainMenu();
            }

            let itemQuantity = answer.quantity;

            inquirer.prompt([
                {
                    type: 'input',
                    name: 'price',
                    message: 'Enter the price: $',
                    validate: function (value) {
                        if (value.toLowerCase() === 'cancel') {
                            return true;
                        }
                        var valid = /^[0-9]*(\.[0-9]+)?$/.test(value);
                        return valid || 'Please enter a number';
                    },
                }
            ]).then((answer) => {
                if (answer.price.toLowerCase() === 'cancel') {
                    console.log();
                    console.log(chalk.yellow("Returning to main menu"));
                    console.log();
                    return mainMenu();
                }

                let itemPrice = answer.price;

                db.get('inventory')
                    .push({
                        id: crypto.randomBytes(4).toString('hex'),
                        name: itemName,
                        quantity: itemQuantity,
                        price: itemPrice,
                    })
                    .write();
                console.log();
                console.log(chalk.green('Item added successfully'));
                console.log();
                mainMenu();
            });
        });
    });
}

//View Inventory
function viewInventory() {
    const items = db.get('inventory').value();
    console.log();
    console.log(chalk.green("Listing all items: What's on your ") + chalk.white("wall") + chalk.green("...inventory?"));
    console.log();
    items.forEach(item => {
        let id = `${chalk.red('ID')}: ${item.id}`;
        let name = `${chalk.yellow('Name')}: ${item.name.substring(0, 24)}${item.name.length > 24 ? '... ' : ''}`;
        let quantity = `${chalk.blue('Quantity')}: ${item.quantity}`;
        let price = `${chalk.green('Price')}: $${item.price}`;

        console.log(id.padEnd(25) + name.padEnd(31) + quantity.padEnd(20) + ' ' + price);
    });
    console.log();
    mainMenu();
}
//view item
function viewItemDetails() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'id',
            message: 'Enter the ID of the item you want to view:',

            validate: function (value) {
                if (value.toLowerCase() === 'cancel') {
                    return true;
                }
                var itemExists = !!db.get('inventory').find({ id: value }).value();
                return itemExists || 'ID not found, try again.';
            },

        },
    ]).then((answers) => {
        if (answers.id.toLowerCase() === 'cancel') {
            console.log();
            console.log(chalk.yellow("Returning to main menu"));
            console.log();
            return mainMenu();
        }
        console.log();
        const item = db.get('inventory').find({ id: answers.id }).value();
        if (item) {
            console.log(chalk.red(`ID:`) + ` ${item.id}\n` + chalk.yellow(`Name:`) + ` ${item.name}\n` + chalk.blue(`Quantity:`) + ` ${item.quantity}\n` + chalk.green(`Price:`) + ` $${item.price}`);
        }
        console.log();
        mainMenu();
    });

}

//

//Update Item 
function updateItem() {
    let itemId, itemName, itemQuantity, itemPrice;

    inquirer.prompt([
        {
            type: 'input',
            name: 'id',
            message: 'Enter the ID of the item you want to update:',
            validate: function (value) {
                if (value.toLowerCase() === 'cancel') {
                    return true;
                }
                var itemExists = !!db.get('inventory').find({ id: value }).value();
                return itemExists || 'ID not found, try again.';
            },
        }
    ]).then((answer) => {
        if (answer.id.toLowerCase() === 'cancel') {
            console.log();
            console.log(chalk.yellow("Returning to main menu"));
            console.log();
            return mainMenu();
        }

        itemId = answer.id;

        inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Enter the new item name:',
            }
        ]).then((answer) => {
            if (answer.name.toLowerCase() === 'cancel') {  // changed from 'id' to 'name'
                console.log();
                console.log(chalk.yellow("Returning to main menu"));
                console.log();
                return mainMenu();
            }

            itemName = answer.name;

            inquirer.prompt([
                {
                    type: 'input',
                    name: 'quantity',
                    message: 'Enter the new quantity:',
                    validate: function (value) {
                        if (value.toLowerCase() === 'cancel') {
                            return true;
                        }
                        var valid = /^[0-9]*(\.[0-9]+)?$/.test(value);
                        return valid || 'Please enter a number';
                    },
                }
            ]).then((answer) => {
                if (answer.quantity.toLowerCase() === 'cancel') {  // changed from 'id' to 'quantity'
                    console.log();
                    console.log(chalk.yellow("Returning to main menu"));
                    console.log();
                    return mainMenu();
                }

                itemQuantity = answer.quantity;

                inquirer.prompt([
                    {
                        type: 'input',
                        name: 'price',
                        message: 'Enter the new price: $',

                        validate: function (value) {
                            if (value.toLowerCase() === 'cancel') {
                                return true;
                            }
                            var valid = /^[0-9]*(\.[0-9]+)?$/.test(value);
                            return valid || 'Please enter a number';
                        },
                    }
                ]).then((answer) => {
                    if (answer.price.toLowerCase() === 'cancel') {  // changed from 'id' to 'price'
                        console.log();
                        console.log(chalk.yellow("Returning to main menu"));
                        console.log();
                        return mainMenu();
                    }

                    itemPrice = answer.price;

                    // Check if item exists
                    const itemToUpdate = db.get('inventory').find({ id: itemId }).value();

                    if (itemToUpdate) {
                        // Update the item
                        db.get('inventory')
                            .find({ id: itemId })
                            .assign({ name: itemName, quantity: itemQuantity, price: itemPrice })
                            .write();
                        console.log();
                        console.log(chalk.green('Item updated successfully'));
                        console.log();
                        mainMenu();
                    } else {
                        console.log(chalk.red('Item not found, check the ID and try again.'));
                        updateItem(); // Retry the update
                    }
                });
            });
        });
    });
}

//

//Delete item function
function deleteItem() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'id',
            message: 'Enter the ID of the item you want to delete:',
            validate: function (value) {
                if (value.toLowerCase() === 'cancel') {
                    return true;
                }
                var itemExists = !!db.get('inventory').find({ id: value }).value();
                return itemExists || 'ID not found, try again.';
            },
        },

    ]).then((answers) => {
        if (answers.id.toLowerCase() === 'cancel') {
            console.log();
            console.log(chalk.yellow("Returning to main menu"));
            console.log();
            return mainMenu();
        }
        db.get('inventory')
            .remove({ id: answers.id })
            .write();
        console.log();
        console.log(chalk.red('Item deleted successfully'));
        console.log();
        mainMenu();
    });
}

//Next steps
//Divide in groups, deleate how many items you may want, filter by amount of money, filter by quantity