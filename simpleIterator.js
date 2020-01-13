function myIter(startIncl, finishExcl) {
    let index = startIncl;
    let count = 0;

    return {
        next() {
            let result;
            if(index < finishExcl) {
                result = {value: index, done: false};
                index += 1;
                count += 1;
                return result;
            }
            return result = { value: count, done: true};
        }
    }
}

const it = myIter(0, 10);

let res = it.next();

while(!res.done) {
    console.log(res.value);
    res = it.next();
}
