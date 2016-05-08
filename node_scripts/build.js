let Promise = require('bluebird')
let chalk = require('chalk')
let dateFormat = require('dateformat')
let rimraf = require('rimraf-promise')
let compressor = require('node-minify')
let Imagemin = require('imagemin')

// http://bluebirdjs.com/docs/api/promisification.html
let fs = Promise.promisifyAll(require('fs'))
// let mkdirp = Promise.promisifyAll(require('mkdirp'))
let ncp = Promise.promisifyAll(require('ncp'))

// console.log for 1337 h4X0r
let log = console.log.bind(console)

// let nowFormat = dateFormat(new Date(), 'HH:MM:ss')

// File & folder path used by this program
const buildFolderName = 'dist'
const buildFolderNameCss = 'css'
const buildFolderNameJs = 'js'
const buildFolderNameImg = 'img'
const fontFolderName = 'font'
const cssFileName = 'style.css'
const jsFileName = 'main.js'

// Greeting Message
log(chalk.red('  #####   '))
log(chalk.red(' #######  '))
log(chalk.red('#  ###  # ') + chalk.grey(' The mighty Skull is building your project.'))
log(chalk.red('#   #   # '))
log(chalk.red('######### ') + chalk.grey(' Please wait while I get your stuff ready for production.'))
log(chalk.red(' ### ###  '))
log(chalk.red('  #####   '))
log(chalk.red('  # # #   ') + chalk.grey(' Play more, care less, be an heartless'))

// Promise Version of :
// https://stackoverflow.com/questions/11293857/fastest-way-to-copy-file-in-node-js
let copyFile = function (source, target) {
  return new Promise(function (resolve, reject) {
    let rd = fs.createReadStream(source)
    rd.on('error', function (err) {
      reject(err)
    })

    let wr = fs.createWriteStream(target)
    wr.on('error', function (err) {
      reject(err)
    })
    wr.on('close', function (ex) {
      resolve()
    })

    rd.pipe(wr)
  })
}

let cleanDistFolder = function () {
  return rimraf(buildFolderName)
    .then(function (res) {
      log(chalk.green('[' + dateFormat(new Date(), 'HH:MM:ss') + '] ') + 'Old build folder cleaned')
    })
    .catch(console.error)
}

let compressCss = function () {
  return new Promise(function (resolve, reject) {
    compressor.minify({
      type: 'clean-css',
      fileIn: buildFolderNameCss + '/' + cssFileName,
      fileOut: buildFolderName + '/' + buildFolderNameCss + '/' + cssFileName,
      callback: function (err, min) {
        if (err) {
          reject(err)
        } else {
          resolve(min)
        }
      }
    })
  })
}

let compressJs = function () {
  return new Promise(function (resolve, reject) {
    compressor.minify({
      type: 'uglifyjs',
      fileIn: buildFolderNameJs + '/' + jsFileName,
      fileOut: buildFolderName + '/' + buildFolderNameJs + '/' + jsFileName,
      callback: function (err, min) {
        if (err) {
          reject(err)
        } else {
          resolve(min)
        }
      }
    })
  })
}

// TODO delete that stuff
let minifyCss = function () {
  return compressCss()
    .then(function (res) {
      log(chalk.green('[' + dateFormat(new Date(), 'HH:MM:ss') + '] ') + 'CSS Minified')
    })
    .catch(console.err)
}

// TODO delete that stuff
let minifyJs = function () {
  return compressJs()
    .then(function (res) {
      log(chalk.green('[' + dateFormat(new Date(), 'HH:MM:ss') + '] ') + 'JS Minified')
    })
    .catch(console.err)
}

let imgmin = function () {
  return new Promise(function (resolve, reject) {
    return new Imagemin()
      .src('img/*.{gif,jpg,png,svg}')
      .dest(buildFolderName + '/' + buildFolderNameImg)
      .use(Imagemin.jpegtran({progressive: true}))
      .use(Imagemin.svgo())
      .use(Imagemin.optipng({optimizationLevel: 3}))
      .use(Imagemin.gifsicle({interlaced: true}))
      .run(function (err, files) {
        if (err) {
          reject(err)
        } else {
          log(chalk.green('[' + dateFormat(new Date(), 'HH:MM:ss') + '] ') + 'Images optimized')
          resolve()
        }
      })
  })
}

let copyFont = function () {
  return ncp.ncpAsync(fontFolderName, buildFolderName + '/' + fontFolderName)
    .then(function () {
      log(chalk.green('[' + dateFormat(new Date(), 'HH:MM:ss') + '] ') + 'Font folder copied')
    })
    .catch(console.err)
}

let copyHtml = function () {
  return copyFile('index.html', 'dist/index.html')
    .then(function (res) {
      log(chalk.green('[' + dateFormat(new Date(), 'HH:MM:ss') + '] ') + 'index.html copied')
    })
    .catch(console.err)
}

/*
 * TODO
 * Put all these in a promise.all or something
 * http://bluebirdjs.com/docs/api-reference.html
 *
 * copy all the html file in the root on the dist directory
 *
 */

cleanDistFolder()
  .then(minifyCss)
  .then(minifyJs)
  .then(imgmin)
  .then(copyFont)
  .then(copyHtml)
