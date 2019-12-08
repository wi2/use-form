# @wi2/use-form
Hooks to manage form

**Motivation**
- use uncontrolled native html form
- very light && performant
  - around than 1.5kb gzip
  - fast first rendering
  - manage the update of the rendering smartly
  - set a field value with or without a new rendering
- easy to use and to implement
- easy to add validation and valite the form

## Install

```
npm install @wi2/use-form --save
```

### dependencies:
- react

## How to use it?


`useForm(options)`

**options**: config options
- `smart` function like debounce/throttle/... - useful when `validateOnBlur` is true or when you need multiple dispatch
- `trigger`: false => no rendering form, 
- `validateOnBlur`: true => validate on blur, 
- `validators: list of all validators for this form`
ex: 
```js
const options = {
  smart: lodash.debounce,
  // smartTime: 100 // default
  // trigger: true, // default
  validateOnBlur: true,
  validators: {
    isEmail: [
      [email => ifEmail(email), 'invalid email'],
    ],
    isRequired: [
      [value => ifIsNotEmpty(value), 'this is required'],
    ],
    multipleTest: [
      [() => false, 'first test return an error'],
      [() => true, 'second test do not return an error'],
    ]
  }
}
```


```js
const [register, state, handleSubmit, { reset }] = useForm(options)

const onSubmit = formState => {
  console.log(formState, state)
}

return (
  <form ref={register} onSubmit={onSubmit(handleSubmit)}>
    <input type="text" name="firstname" />
    <input type="text" name="lastname"/>
    <div>
      <input type="submit" />
      <button onClick={reset}>Reset</button>
    </div>
  </form>
)
```

## How to use it?

```js
const [register, state, handleSubmit, { setValue, validate }] = useForm({
  firstname: 'John',
}, {
  validators: {
    // validateOnBlur: true
    isRequired: [
      [value => value && value.length > 0, "this field is required"],
    ]
  }
})

const setIsBob = () => {
  setValue('firstname', 'Bob')
}

const ValidateFirstname = () => {
  validate('firstname')
}

...

```

```js
const [register, state, handleSubmit, { setValue, validate }] = useForm({
  validateOnBlur: true // smart behaviour very performant for fast onblur..
  smart: lodash.debounce,
  // smartTime: 500, //default
  validators: {
    isRequired: [
      [value => value && value.length > 0, "this field is required"],
    ]
  }
})

const setListFirstname = () => {
  listname.forEach(name => {
    setValue('firstname', name)
  })
  // this call will effect only one render
}

const ValidateFirstname = () => {
  validate('firstname')
}

return (
  <form ref={register} onSubmit={onSubmit(handleSubmit)}>
    <input type="text" name="firstname" data-validators="isRequired" />
    <input type="text" name="lastname" data-validators="isRequired" />
    <div>
      <input type="submit" />
      <button onClick={reset}>Reset</button>
    </div>
  </form>
)


...

```
