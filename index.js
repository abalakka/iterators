const axios = require('axios');

const readLine = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'enter command > '
});

readLine.prompt();
readLine.on('line', async line => {
    switch(line.trim()) {
        case 'log' : 
        {
            const { data } = await axios.get(`http://localhost:3001/food`);
            const it = data[Symbol.iterator]();
            let actionIt;
            
            function *actionGenerator() {
                const food = yield;
                const servingSize = askForServingSize = yield askForServingSize();
                yield displayCalories(servingSize, food);
            }

            function askForServingSize(){
                readLine.question(`How many servings did you eat? `, servingSize => {
                    if( servingSize === 'n') {
                        actionIt.return();
                    } else {
                        actionIt.next(servingSize);
                    }
                })    
            };

            async function displayCalories(servingSize, food){
                const calories = food.calories;
                console.log(`${food.name} with serving size ${servingSize} has ${Number.parseFloat(calories * parseInt(servingSize, 10)).toFixed()} calories`);
                
                const { data } = await axios.get(`http://localhost:3001/users/1`);
                const userLog = data.log || [];
                const putBody = { 
                    ...data,
                    log: [
                        ...userLog,
                        {
                            [Date.now()]: {
                                food: food.name,
                                servingSize,
                                calories: Number.parseFloat(calories * parseInt(servingSize, 10))
                            }
                        }
                    ]
                };
                await axios.put(`http://localhost:3001/users/1`, putBody, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                
                actionIt.next();
                readLine.prompt();
            };

            readLine.question(`What would you like to log today? \n`, async item => {
                let position = it.next();
                while(!position.done) {
                    const food = position.value.name;
                    if(food === item) {
                        console.log(`${item} has ${position.value.calories} calories`);
                        actionIt = actionGenerator();
                        actionIt.next();
                        actionIt.next(position.value);
                    }
                    position = it.next();
                }
                readLine.prompt();
            });
        }
        break;
        case 'list vegan foods' :
        {
            const { data } = await axios.get(`http://localhost:3001/food`);

            function *listVeganFoods() {
                let idx = 0;
                const veganFood = data.filter(food => {
                    return food.dietary_preferences.includes('vegan');
                });

                while(veganFood[idx]) {
                    yield veganFood[idx];
                    idx++;
                }
            }
            
                for(let val of listVeganFoods()) {
                    console.log(val.name)
                }
                readLine.prompt();
        }
        break;
        case 'todays log':
        {
            readLine.question('Email: ', async email => {
                const { data } = await axios.get(`htpp://localhost:3001/users?email=${email}`);
                const foodLog = data[0].log || [];
                let totalCalories = 0;

                function *getFoodLog() {
                    yield *foodLog;
                }

                for(const entry of getFoodLog()) {
                    const timestamp = Object.keys(entry)[0];
                    if(isToday(new Date(Number(timestamp)))) {
                        console.log(`${entry[timestamp].food}, ${entry[timestamp].servingSize} servings`);
                        totalCalories += entry[timestamp].calories;
                    }
                }
                console.log(`\nTodays total calories: ${totalCalories}`);
                readLine.prompt();
           })
        }
        break;
    }
});

const isToday = (timestamp) => {
    const today = new Date();
    return (
        timestamp.getDate() === today.getDate() &&
        timestamp.getMonth() === today.getMonth() &&
        timestamp.getFullYear() === today.getFullYear()
    );
}

