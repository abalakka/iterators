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
            const actionIterator = {
                [Symbol.iterator]() {
                    let positions = [...this.actions];
                    return {
                        [Symbol.iterator]() {
                            return this;
                        },
                        next(...args) {
                            if(positions.length > 0) {
                                const position = positions.shift();
                                const result = position(...args);
                                return { value: result, done: false };
                            } else {
                                return { done: true };
                            }
                        },
                        return() {
                            positions = [];
                            return { done: true};
                        },
                        throw (error) {
                            console.log(error);
                            return { value: undefined, done: true};
                        }
                    };
                },
                actions: [askForServingSize, displayCalories],
            };

            function askForServingSize(food){
                readLine.question(`How many servings did you eat? `, servingSize => {
                    if( servingSize === 'n') {
                        actionIt.return();
                    } else {
                        actionIt.next(servingSize, food);
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
                        actionIt = actionIterator[Symbol.iterator]();
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
            axios.get(`http://localhost:3001/food`).then(({data}) => {
                let idx = 0;
                const veganFood = data.filter(food => {
                    return food.dietary_preferences.includes('vegan');
                });

                const veganIterable = {
                    [Symbol.iterator]() {
                        return {
                            [Symbol.iterator]() {
                                return this;
                            },
                            next() {
                                const current = veganFood[idx];
                                idx++;
                                if(current)
                                    return { value: current, done: false}
                                else
                                    return { value: current, done: true}
                            }
                        }
                    }
                }
                for(let val of veganIterable) {
                    console.log(val.name)
                }
                readLine.prompt();
            });
        }
        break;
    }
})

