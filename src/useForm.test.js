import React from 'react'
import { act } from 'react-dom/test-utils'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import useForm from './useForm'

Enzyme.configure({ adapter: new Adapter() })

const sample = {
  firstname: {
    value: 'Mike',
  },
  github: {},
  country: {
    value: 'France',
  },
  phone: {
    value: '12345678',
    validators: [
      {
        test: value => !/^\d+$/.test(value),
        message: 'Error: this not a number',
      },
      {
        test: value => value.length < 8,
        message: 'not valid, need 8 digits',
      },
    ],
  },
  age: {
    value: '11',
    validators: [
      {
        test: value => !/^\d+$/.test(value),
        message: 'Error: this not a number',
      },
      {
        test: value => Number(value) < 21,
        message: 'Forbidden under 21',
      },
      {
        test: value => Number(value) < 15,
        message: 'Forbidden under 15',
      },
    ],
    disabled: true,
  },
}

describe('useForm', () => {
  let state, validate, dispatch, fields

  beforeAll(() => {
    function Comp() {
      [state, dispatch, validate, fields] = useForm(sample)
      return null
    }
    mount(<Comp />)
  })

  it('should return 1 state and 3 methods', () => {
    expect(typeof state).toBe('object')
    expect(typeof dispatch).toBe('function')
    expect(typeof validate).toBe('function')
    expect(typeof fields).toBe('function')
  })

  it('should return 2 more helpers methods', () => {
    let current
    function Comp() {
      current = useForm(sample, [() => true, () => false])
      return null
    }
    mount(<Comp />)

    expect(current.length).toBe(6)
    expect(typeof current[4]).toBe('function')
    expect(typeof current[5]).toBe('function')
    expect(current[4]()).toBe(true)
    expect(current[5]()).toBe(false)
  })

  it('age should be INVALID', () => {
    act(() => {
      validate('age')
    })
    expect(state.fields.age.status).toBe('INVALID')
  })

  it('age should be 34 and status = DIRTY', () => {
    act(() => {
      dispatch({ name: 'age', value: 34 })
    })
    expect(state.fields.age.value).toBe(34)
    expect(state.fields.age.status).toBe('DIRTY')
  })

  it('age should be VALID', () => {
    act(() => {
      validate('age')
    })
    expect(state.fields.age.status).toBe('VALID')
  })

  it('age should be 11 and status = PRISTINE', () => {
    act(() => {
      dispatch({ type: 'RESET' })
    })
    expect(state.fields.age.value).toBe('11')
    expect(state.fields.age.status).toBe('PRISTINE')
  })

  it('age should be VALID', () => {
    act(() => {
      dispatch({ name: 'age', value: 34 })
    })
    act(() => {
      validate('age')
    })
    expect(state.fields.age.value).toBe(34)
    expect(state.fields.age.status).toBe('VALID')
  })

  it('age should be 34 and status = PRISTINE', () => {
    act(() => {
      dispatch({ type: 'SAVE' })
    })
    expect(state.fields.age.value).toBe(34)
    expect(state.fields.age.status).toBe('PRISTINE')
  })
})
