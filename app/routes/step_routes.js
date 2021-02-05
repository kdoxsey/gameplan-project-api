// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for goals
const Goal = require('../models/goal')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { goal: { title: '', text: 'foo' } } -> { goal: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// CREATE
// POST /steps/
router.post('/steps', requireToken, (req, res, next) => {
  req.body.step.owner = req.user.id

  const stepData = req.body.step

  const goalId = stepData.goalId

  Goal.findById(goalId)
    .then(handle404)
    .then(goal => {
      goal.step.push(stepData)
      return goal.save()
    })
    .then(goal => res.status(201).json({ goal }))
    .catch(next)
})
// router.post('/steps', requireToken, (req, res, next) => {
//   req.body.step.owner = req.user.id
//   Step.create(req.body.step)
//       .then(step => res.status(201).json({ step }))
//       .then(() => res.sendStatus(204))
//       .catch(next)
// })

// INDEX
// GET /steps
router.get('/steps', requireToken, (req, res, next) => {
    Step.find({ owner: req.user.id })
        .then(steps => {
            return steps.map(step => step.toObject())
        })
        .then(steps => res.status(200).json({ steps }))
        .catch(next)
})

//show
router.get('/steps/:id', requireToken, (req, res, next) => {
    Step.findById(req.params.id)
        .then(handle404)
        .then(step => res.status(200).json({ step: step.toObject() }))
        .catch(next)
})

<<<<<<< HEAD

=======
// CREATE
// POST /steps/
router.post('/steps', requireToken, (req, res, next) => {
    // set owner of new step to be current user
    req.body.step.owner = req.user.id
    console.log(req.body)
    Step.create(req.body.step)
        .then(step => res.status(201).json({ step: step.toObject }))
        .then(() => res.sendStatus(204))
        .catch(next)
})
>>>>>>> eb36c29... saved over main branch, so backtracking a bit

// DESTROY
// DELETE /steps/:id
router.delete('/steps/:id', requireToken, (req, res, next) => {
    Step.findById(req.params.id)
        .then(handle404)
        .then(step => {
            requireOwnership(req, step)
            step.deleteOne()
        })
        .then(() => res.sendStatus(204))
        .catch(next)
})


// UPDATE
// PATCH /steps/:id
router.patch('/steps/:id', requireToken, (req, res, next) => {
    delete req.body.step.owner
    Step.findById(req.params.id)
        .then(handle404)
        .then(step => {
            requireOwnership(req, step)
            return step.updateOne(req.body.step)
        })
        .then(() => res.sendStatus(204))
        .catch(next)
})

module.exports = router