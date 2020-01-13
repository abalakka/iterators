const axios = require('axios');

const readLine = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'enter command > '
});

readLine.prompt();
readLine.on('line', line => {
    switch(line.trim()) {
        case 'log' : 
        {
            readLine.question(`What would you like to log today? \n`, async item => {
                const { data } = await axios.get(`http://localhost:3001/food`);
                const it = data[Symbol.iterator]();
                let position = it.next();
                while(!position.done) {
                    const food = position.value.name;
                    if(food === item) {
                        console.log(`${item} has ${position.value.calories} calories`);
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

