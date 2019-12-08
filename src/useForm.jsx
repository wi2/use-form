import { useEffect, useRef, useReducer } from 'react'

// useSmartReducer
const SMART_TIME = 10

function compareDefault(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function smartDefault(fn, frame) {
  let count
  function counter() {
    if (Number.isInteger(count)) {
      count = cancelAnimationFrame(count)
      fn()
    } else {
      count = requestAnimationFrame(counter) / frame
    }
  }
  return counter
}

const smartOptionsDefault = {
  smart: smartDefault,
  smartTime: SMART_TIME,
  smartCompare: compareDefault,
}

function useSmartReducer(reducer, initialForm, options = {}, init) {
  const { smart, smartTime, smartCompare } = { ...smartOptionsDefault, ...options }

  const [state, dispatch] = useReducer((s, a) => a.smart || reducer(s, a), initialForm, init)
  const smartState = useRef({ state, next: state }).current
  const doSmartDispatch = useRef(
    smart(
      () => {
        dispatch({ smart: smartState.next })
      },
      smartTime
    )
  ).current

  useEffect(() => {
    smartState.state = state
  }, [state])

  const smartDispatch = (actions, withSmart = true) => {
    const nextState = reducer(smartState.next, actions)
    // don't dispatch twice
    if (!smartCompare(nextState, smartState.state)) {
      smartState.next = nextState
      if (withSmart) {
        doSmartDispatch()
      } else {
        dispatch(actions)
      }
    }
  }

  return [state, smartDispatch, smartState.next]
}


// useForm

// constants
// status field - empty state field means PRISTINE
const DIRTY = 'DIRTY'
const VALID = 'VALID'
const INVALID = 'INVALID'
// type action reducer
const RESET = 'RESET'
const FORM = 'FORM'
const FIELDS = 'FIELDS'

// reducer
function initReducer(initial) {
  return { fields: { ...initial }, form: {}, initial }
}
const reducer = (state, { type, name, value, ...props }) => {
  switch (type) {
    case RESET:
      return initReducer(state.initial)
    case FIELDS: return { ...state, fields: value }
    case FORM:
      return {
        ...state,
        form: {
          ...state.form,
          ...value,
        },
      }
    default:
      if (name) {
        return {
          ...state,
          fields: {
            ...state.fields,
            [name]: {
              ...state.fields[name],
              status: DIRTY,
              ...props,
              value,
            },
          },
        }
      }
      return state
  }
}

// helper for useForm
const isField = field => field && field.name && field.form

const defaultFormOptions = {
  trigger: true,
  // validators: null,
  // validateOnBlur: true,
  // smart: lodash.throttle,
  // smartTime: 100,
  // smartCompare: require("react-fast-compare")(a,b),
}

// the custom hooks
function useForm(newOptions, initial) {
  const options = { ...defaultFormOptions, ...newOptions }
  const [state, dispatch, stateSync] = useSmartReducer(reducer, initial, options, initReducer)
  const register = useRef()
  const fields = useRef({}).current

  useEffect(() => {
    const { elements } = register.current
    for (const index in elements) {
      addField(elements[index])
    }

    return () => {
      for (const index in elements) {
        removeField(elements[index])
      }
    }
  }, [])

  const addField = field => {
    if (isField(field)) {
      fields[field.name] = field
      if (options.validateOnBlur) {
        field.addEventListener('blur', handleFieldBlur)
      }
    }
  }

  const removeField = fieldOrName => {
    const field = getField(fieldOrName)
    if (isField(field)) {
      delete fields[field.name]
      if (options.validateOnBlur) {
        field.removeEventListener('blur', handleFieldBlur)
      }
    }
  }

  const getFieldStatus = fieldOrName => {
    let errors = []
    const field = getField(fieldOrName)
    const { dataset: { validators }, value } = field
    if (validators) {
      validators.split(',').forEach(validator => {
        const currentValidator = options.validators[validator]
        if (currentValidator && currentValidator.length) {
          const listValidators = typeof currentValidator[0] === 'function' ? [currentValidator] : currentValidator
          errors = listValidators.reduce((prev, [test, message]) => 
            test(value, field, register, stateSync) ? prev : [...prev, message]
          , errors)
        }
      })
    }
    return errors.length > 0 ? { value, status: INVALID, errors } : { value, status: VALID, errors: null }
  }

  const handleFieldBlur = e => {
    if (options.trigger) {
      dispatch({ name: e.target.name, ...getFieldStatus(e.target) })
    }
  }

  const snapshot = () => {
    const newState = {}
    const { elements } = register.current
    for (const index in elements) {
      const field = elements[index]
      if (isField(field)) {
        newState[field.name] = getFieldStatus(field)
      }
    }
    return newState
  }

  const getField = fieldOrName => {
    if (isField(fieldOrName)) {
      return fieldOrName
    }
    return fields[fieldOrName] || register.current && Object.values(register.current.elements).find(element => element.name === fieldOrName)
  }

  const setValue = (fieldOrName, value, withTriggerValue = options.trigger) => {
    const field = getField(fieldOrName)
    if (isField(field)) {
      field.value = value
      if (withTriggerValue) {
        dispatch({ name: field.name, value })
      }
    }
  }

  const validate = name => {
    if (name) {
      dispatch({ name, ...getFieldStatus(name) })
    }
  }

  const reset = e => {
    if (e && e.preventDefault) {
      e.preventDefault()
    }

    register.current.reset()

    if (options.trigger) {
      dispatch({ type: RESET })
    }
  }

  const handleSubmit = submit => e => {
    e.preventDefault()
    const newState = snapshot()
    submit(newState)

    if (options.trigger) {
      dispatch({ type: FIELDS, value: newState })
    }
  }

  return [
    register, 
    handleSubmit,
    {
      state, // current state rendered
      dispatch,
      stateSync, // uncontrolled state (state in real time / no wait between dispatch and rendering)
      setValue, // setValue(name, value)
      validate, // validate(name)
      reset, // reset()
      snapshot, // get smapshot fo all field status
      getField, // get field by name
      addField,
      removeField,
      getFieldStatus, // get field status by name or field
    },
  ]
}

export default useForm
