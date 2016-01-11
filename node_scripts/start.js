var fs = require('fs');
var chalk = require('chalk');
var dateFormat = require('dateformat');
var sass = require('node-sass');
var bs = require("browser-sync").create();

// console.log for 1337 h4X0r
var log = console.log.bind(console);

// ISO date format to use for debuging
var now = new Date();

// Greeting Message
log( chalk.red('  #####   ') );
log( chalk.red(' #######  ') );
log( chalk.red('#  ###  # ') + chalk.grey(' The mighty Skull is starting your project.' ) );
log( chalk.red('#   #   # ') );
log( chalk.red('######### ') + chalk.grey(' Happy coding !' ) );
log( chalk.red(' ### ###  ') );
log( chalk.red('  #####   ') );
log( chalk.red('  # # #   ') + chalk.grey(' Play more, care less, be an heartless' ));

// Reload all browser on HTML change
bs.watch("*.html").on("change", function(){
  bs.notify("<span color='green'>HTML Reloaded</span>", 2000);
  bs.reload();
});

// Reload all browser on JS change
bs.watch("js/**.js").on("change", function(){
  bs.notify("<span color='green'>JS Reloaded</span>", 2000);
  bs.reload();
});

// Specific compilation for SASS file
bs.watch("sass/**.scss", function (event, file) {
    if (event === "change") {

      sass.render({
        file: 'sass/style.scss',
        outputStyle: 'expanded',
        outFile: 'css/style.css',
        sourceMap: true
      }, function(error, result) {
        if (error) {
          // Pretty Debug Message on sass error

          var nowFormat = dateFormat(new Date(), "HH:MM:ss");

          log( chalk.red('[SASS ERROR ' + nowFormat + '] ' ) + error.file );
          log( chalk.red('[SASS ERROR ' + nowFormat + '] ' ) + 'On line ' + chalk.red(error.line) + ' at column ' + chalk.red(error.column) );
          log( chalk.red('[SASS ERROR ' + nowFormat + '] ' ) + error.message );

        } else {

          // Creating css style files
          fs.writeFile('css/style.css', result.css, function(err){
            if(!err){

              // Creating css map file
              fs.writeFile('css/style.map.css', result.map, function(err) {
                if(!err){
                  var nowFormat = dateFormat(new Date(), "[HH:MM:ss]");
                  log( nowFormat + chalk.green(' CSS Reloaded') );
                  bs.notify("<span color='green'>CSS Reloaded</span>", 2000);
                } else {
                  log( err );
                }
              });

            } else {
              log( err );
            }
          });
          // Injecting the CSS change in BrowserSync
          bs.reload('css/style.css');
        }
      });

    }
});

// Now init the Browsersync server
bs.init({
    server: "./"
});
