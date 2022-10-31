const globalEnv={
    '+': (...input)=> input.reduce((a,b) =>  a + b),
    '-': (...input)=> input.reduce((a,b) =>  a - b),
    '*': (...input)=> input.reduce((a,b) =>  a * b),
    '/': (...input)=> input.reduce((a,b) =>  a / b)
}

function numberEval(atom){ //evaluating a number
   if(isNaN(Number(atom))) return null
   return Number(atom)
}

function symbolEval(atom,env=globalEnv){  //evaluating a symboles ie operators
    return env[atom] || null
}

function atomEval(atom, env){ // atom can be number or symbol ie is a variable name 
    return numberEval(atom) || symbolEval(atom,env)

}
function getArguments(input){ //this function returns an atom or the list expression
    input=input.trim()
    if(input[0] !== '('){
        let atom=input[0].split(' ')
        return [atom, input.slice(atom.length).trim()]
    }
    input=input.slice(1)
    let bracket=1
    let validlist='('
    while(bracket){
    if(input[0] === '(') bracket++
    if(input[0] === ')') bracket--
    validlist += input[0]
    input=input.slice(1)
    if(bracket === 0) break
    }
    return [validlist,input.trim()]

}
function getArray(input){ //this function puts the input ie.rest of the string in an array
    let arrayarguments=[]
    while(input[0] !== ')'){
        let parsed= getArguments(input)
        arrayarguments.push(parsed[0])
        input=parsed[1]
    }
    return arrayarguments 
}

//compond expression evaluates the expression inside the braces
function compoundExpressionEval(compinput,env = globalEnv){ // (operater arg1 arg2 ...)
    compinput=compinput.slice(1).trim()
    let funArguments=getArguments(compinput)
    let op=funArguments[0]
    // console.log(op)
    // console.log(env[op])
    let args=funArguments[1]
    // console.log(args)
    let arrayarguments= getArray(args)
    // console.log(arrayarguments)
    arrayarguments=arrayarguments.map(args => expressionEval(args,env))
    // console.log(arrayarguments)
    if(env[op] === undefined) return "syntax Error"
    return env[op](...arrayarguments)

}


function expressionEval(input ,env = globalEnv){
    if(input[0] === '('){
        return compoundExpressionEval(input,env)
    }
    return atomEval(input,env)

}

console.log(expressionEval('(2)'))