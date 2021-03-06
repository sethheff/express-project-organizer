let express = require('express')
let db = require('../models')
let router = express.Router()
let async = require('async')
// POST /projects - create a new project
router.post('/', (req, res) => {
  let cats = []
  if(req.body.category){
    cats = req.body.category.split(',')
  }
  db.project.create({
    name: req.body.name,
    githubLink: req.body.githubLink,
    deployLink: req.body.deployedLink,
    description: req.body.description
  })
  .then((project) => {
    console.log('project created')
    if(cats.length){
      async.forEach(cats, (c, done)=>{
        db.category.findOrCreate({
          where: {name: c.trim()}
        })
        .then(([category ,wasCreated])=>{
          console.log('was the cat created?')
          project.addCategory(category)
          .then(()=>{
            done()
          })
          .catch(err =>{
            console.log(err)
            done()
          })
        })
        .catch(err =>{
          console.log(err)
          done()
        })
      }, ()=>{
        res.redirect('/')
      })
      .catch((error) => {
        res.status(400).render('main/404')
      })
    }
  })
})
// GET /projects/new - display form for creating a new project
router.get('/new', (req, res) => {
  res.render('projects/new')
})
// GET /projects/:id - display a specific project
router.get('/:id', (req, res) => {
  db.project.findOne({
    where: { id: req.params.id },
    // include: [db.category]
  })
  .then((project) => {
    if (!project) throw Error()
    res.render('projects/show', { project: project })
  })
  .catch((error) => {
    res.status(400).render('main/404')
  })
})
router.post('/:id' , (req, res)=>{
  console.log(req.params.id, '<-------')
  db.project.destroy({
    where: {id: req.params.id}
  }).then((numRowDeleted)=>{
  console.log(numRowDeleted)
    res.redirect('/')
  })
  .catch(err => {
      console.log(err)
  })
})
module.exports = router