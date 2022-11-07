
const globalEnv={
    '+' : (...input)=> input.reduce((a,b) =>  a + b), 
    '-' : (...input)=>{if(input.length === 1){return op+input[0]} input.reduce((a,b) =>  a - b)},
    '*' : (...input)=> input.reduce((a,b) =>  a * b),
    '/' : (...input)=> {if(input.length !== 2){return "expected 2 arguments"} return input[0]/input[1]},
    '<' : (...input)=> {if(input.length !== 2){return "expected 2 arguments"} return input[0] < input[1]},
    '>' : (...input)=> {if(input.length !== 2){return "expected 2 arguments"} return input[0] > input[1]},
    '<=': (...input)=> {if(input.length !== 2){return "expected 2 arguments"} return input[0] <= input[1]},
    '>=': (...input)=> {if(input.length !== 2){return "expected 2 arguments"} return input[0] >= input[1]},
    '=' : (...input)=> {if(input.length !== 2){return "expected 2 arguments"} return input[0] === input[1]},
    '#f': false,
    '#t': true,
    true:true,
    false:false,
    pi  :3.147,
    sqrt:(...input)=>{
        if(input.length !==1) return null
        return Math.sqrt(input[0]) 
    },
    list:(...input)=> input
}
const specialForms=['if','quote','define','lambda','set!','begin']

function numberEval(atom){ //evaluating a number
   if(isNaN(Number(atom))) return null
   return Number(atom)
}

function symbolEval(atom,env=globalEnv){  //evaluating a symboles ie operators
    return env[atom] || null
}
 
function stringEval(atom){
 let parsed=atom.match(/".*"/)
 if(parsed !== null)return parsed[0].trim()
 return null
}


function atomEval(atom, env){ // atom can be number or symbol ie is a variable name 
    if(atom[0]==='\'') return quoteEval(atom,env)
    return numberEval(atom) || symbolEval(atom,env) || stringEval(atom)

}
function getArguments(input){ //this function returns an atom or the list expression
    input=input.trim()
    input=input.replace(')', ' )')
    if(input[0] !== '('){
        let atom=input.split(' ')[0]
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
function collectiveParser(op,input,env){ //use it using switchcase
    if(op === 'if')     return  ifEval(input,env)
    if(op === 'quote')  return  quoteEval(input,env)
    if(op === 'define') return  defineEval(input,env)
    if(op === 'set!')   return  setEval(input,env)
    if(op === 'begin')  return  beginEval(input,env)
    if(op === 'lambda') return  lamdbaEval(input,env)
 
}
//if <test> <consequent> <alternate>  //change the names of parsers
function ifEval(input,env){ //<test> <consequent> <alt>
    let parsed =getArguments(input)
    let  test =parsed[0]
    input=parsed[1]
    parsed=getArguments(input)
    const consequent=parsed[0]
    input=parsed[1]
    parsed=getArguments(input)
    const alternalte=parsed[0]
    input=parsed[1]

    if(input.trim().length > 2){
        return " Error:Too many arguments"
        
    }
    if(expressionEval(test,env)) return expressionEval(consequent,env)
    return expressionEval(alternalte,env)
}
//quote atom or expression
function quoteEval(input,env){
    input=input.trim()
    if(input[0] === ')') return "Error: give some arguments"
    let parsed = getArguments(input)
    let result=parsed[0]
    if(parsed[1].length > 1) return "Error: Too many arguments"
    return result

}
//define bindes the value to a variable
function defineEval(input,env){
    input=input.trim()
    if(input[0] === ')') return "Error: give some arguments"
    let parsed = getArguments(input)
    let variable=parsed[0]
    input=parsed[1]
    parsed = getArguments(input)
    let value = parsed[0]
    env[variable]=expressionEval(value,env)
    if(env[variable] === null){console.log("Error: invalid arguments"); return null}
    return env[variable]
    
    
}
//(lambda (variables) <exp1> <exp2> ...)
function lamdbaEval(input,env){
    input=input.trim() 
    if(input[0] !== '(') return "Error:invalid syntax"
    let parsed=getArguments(input)
    let variables = parsed[0].slice(1)
    variables=getArray(variables)
    input=parsed[1]
    let expression = getArguments(input)[0]
    const localenv=Object.create(env)
    let lambda=(...args)=>{
        for(let i=0 ; i < args.length ;i++){
            localenv[variables[i]]=args[i]
        }
        return expressionEval(expression,localenv)
    }
    return lambda

}
//Set parser : it does not establish the new binding but rather alters the existing binding
function setEval(input,env){
    input=input.trim()
    if(input[0] === ')') return "Error: give some arguments"
    let parsed=getArguments(input)
    let variable=parsed[0]
    input=parsed[1]
    if(env[variable] === null){
        return "Error: no value found"
    }
    let argument=getArguments(input,env)[0]
    env[variable]=expressionEval(argument,env)
    return env[variable]

} 

//begin parser: (begin exp1,exp2 ...)
function beginEval(input,env){
    input=input.trim()
    if(input[0] === ')') return "Error: give some arguments"
    let expression=getArguments(input)
    for( let i=0 ; i < expression.length; i++){
        expressionEval(expression[i])    
    }
    
}

//compond expression evaluates the expression inside the braces
function compoundExpressionEval(compinput,env = globalEnv){ // (operater arg1 arg2 ...)
    compinput=compinput.slice(1).trim()
    let funArguments=getArguments(compinput)   //change the naming
    let op=funArguments[0]
    let args=funArguments[1]
    if(specialForms.includes(op)){
        return collectiveParser(op,args,env) //change the naming to specialformeval
    }
    let arrayarguments= getArray(args)
    arrayarguments=arrayarguments.map(args => expressionEval(args,env))
    if(op[0] === '('){ //for lambda handling 2 open braces
        op=expressionEval(op,env)
        if(arrayarguments.length === 0) return null
        return op(...arrayarguments)
    }
    else{
    if(env[op] === undefined) return "syntax Error"
    if(op === '-' && arrayarguments.length === 1)return op+args[0] // fix it
    return env[op](...arrayarguments)
    }
   
}
//error input index and give error
function expressionEval(input ,env = globalEnv){
    if(input[0] === '('){
        return compoundExpressionEval(input,env)
    }
    return atomEval(input,env)

}

// custom repl(read eval print loop) 
const readline = require('readline') //importing readline module allows reading of input line by line
const r1=readline.createInterface(process.stdin,process.stdout)
console.log('Welcome to Lisp v0.1')
r1.setPrompt('lisp~>')
r1.prompt() 
r1.on('line',(input)=>{       //on() function is used for listening the events   
    if(input === ':q') r1.close()
    console.log(expressionEval(input))
    r1.prompt()
   
})
r1.on('close', ()=>{
    process.exit(0)
})



// basic calculator test cases
// console.log(expressionEval('(- 1 3 (* 3 4))'))
// console.log(expressionEval('(- 1)'))

// console.log(expressionEval('(+ 1 2)')=== 3)
// console.log(expressionEval('(1)')==='syntax Error')
// console.log(expressionEval('(3)') === 'syntax Error')
// console.log(expressionEval('(sqrt 16)'))
// console.log(expressionEval('(sqrt (* pi 7.961))'))


// ifparser test case
// console.log(expressionEval('(if (> 3 2) \'yes \'no )')==='\'yes')
// console.log(expressionEval('(if (> 3 2) (+ 3 2) (- 2 1) )')=== 5) 
// console.log(expressionEval('(if (> 3 2) (+ 3 2) (- 2 1) (* 3 2) )')=== ' Error:Too many arguments')
// console.log(expressionEval('(if (< 3 2) "yes")')=== null)
// console.log(expressionEval('(if (= 3 3) "yes" "no")')=== '"yes"')
// console.log(expressionEval('(if #f "yes" (+ 3 2))')===5)
// console.log(expressionEval('(if true "yes" "no")')=== '"yes"')

// quote Parser test case 
// console.log(expressionEval('(quote )')=== "Error: give some arguments")
// console.log(expressionEval('(quote (> 3 2))')=== '(> 3 2  )' )     
// console.log(expressionEval('(quote x)') === 'x')
// console.log(expressionEval('(quote x (1))') === "Error: Too many arguments") 
// console.log(expressionEval('(quote (1 (+ 1 2)))')=== '(1 (+ 1 2  ))')
// console.log(expressionEval('(quote ("this" "is" "a" "list"))')=== '("this" "is" "a" "list"  )')

// // define testcase
// console.log(expressionEval('(define )')=== 'Error: give some arguments')
// console.log(expressionEval('(define x)'))
// console.log(expressionEval('(define x x)'))
// console.log(expressionEval('(define x (+ 3 2))'))
// console.log(expressionEval('(define x 2)'))
// console.log(globalEnv)

// set! testcase
// console.log(expressionEval('(set! )')=== 'Error: give some arguments')
// console.log(expressionEval('(set! x)')=== null)
// console.log(expressionEval('(define x 9)'))
// // console.log(globalEnv)
// console.log(expressionEval('(set! x (+ x 1))'))
// console.log(expressionEval('(+ x x)'))
// console.log(globalEnv)

//begin testcase
// console.log(expressionEval('(begin )'))
// console.log(expressionEval('(begin (define x 3)(define y 9))'))
// console.log(expressionEval('(+ x y)'))

//list testcase
// console.log(expressionEval('(list 1 2 3 4)'))
// console.log(expressionEval('(define a (list 1 2 3 4))'))
// console.log(globalEnv)
// console.log(expressionEval('(list \'yes (* 1 2 3 4) "no")'))

//lambda testcase
// console.log(expressionEval('(define x 6)'))
// console.log(globalEnv)
// console.log(expressionEval('(lambda )'))
// console.log(expressionEval('((lambda (x)(+ x x x)) x)'))
// console.log(expressionEval('((lambda (x y)(* x y)) 4 5)'))






