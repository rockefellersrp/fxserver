var binaryParser = require('superagent-binary-parser');
var request = require('superagent');
var chalk = require('chalk');
var fs = require('fs');
var extract = require('extract-zip');
var rimraf = require('rimraf');

module.exports = {
  download_resource: function(resource, dataConfigFile, save) {
    var arraytosplit = resource.split("/");
    var resource_user = arraytosplit[0];
    var resource_name = arraytosplit[1].split("@")[0] || arraytosplit[1];
    var resource_version;
    var versionarray = arraytosplit[1].split("@");

    if(versionarray.length > 0){
      resource_version = versionarray[1] || "";
    }

    return new Promise(function(resolve, reject) {
      request.get('https://api.github.com/repos/' + resource_user + "/" + resource_name + "/tags").set('Accept', 'application/json').end(function(err, res) {
        if (err) {
          console.log(chalk.red("Error: Resource "+ resource_user + "/" + resource_name + " Not Found or not possible to download !"));
          console.log("\n");
          reject("Error: Resource "+ resource_user + "/" + resource_name + " Not Found or not possible to download !");
          return;
        } else {
          var data;

          if(resource_version == ""){
            data = res.body[0];
            resource_version = data.name;
          }else{
            data = res.body.find(function(element){
              if(element.name == resource_version){
                return true;
              }else{
                return false;
              }
            });

            if (!(data)){
              console.log(chalk.red("Error: Version for "+ resource_user + "/" + resource_name + " not found !"));
              console.log("\n");
              reject("Error: Resource "+ resource_user + "/" + resource_name + " Not Found for this version !");
              return;
            }
          }


          console.log(chalk.green("Installing " + resource_name + " - " + resource_version));
          var zip_url = data.zipball_url;
          console.log(zip_url);

          request.get(zip_url).parse(binaryParser).buffer().end(function(err, resp) {
            fs.writeFileSync("resourcedownloadedfvm.zip", resp.body);
            var zipfolder = "";

            extract("resourcedownloadedfvm.zip", {
              dir: process.cwd() + "\\resources",
              onEntry: function(fileunzipped, zip) {
                if (zipfolder == "") {
                  zipfolder = fileunzipped.fileName;
                }
              }
            }, function(err) {

              //Remove and put resource in folder
              rimraf(process.cwd() + "\\resources\\" + resource_name, function() {
                fs.rename(process.cwd() + "/resources/" + zipfolder, process.cwd() + "/resources/" + resource_name, function(err) {
                  console.log("\n");
                  if(save){
                    dataConfigFile.addResource(resource_user+"/"+resource_name, resource_version);
                  }
                  resolve("Install Successful of "+resource_user+"/"+resource_name);
                });
              });
            });

          });
        }
      });
    });
  },
  update_resource: function(resource, previous_version, dataConfigFile, save) {
    var arraytosplit = resource.split("/");
    var resource_user = arraytosplit[0];
    var resource_name = arraytosplit[1].split("@")[0] || arraytosplit[1];
    var resource_version;
    var versionarray = arraytosplit[1].split("@");

    if(versionarray.length > 0){
      resource_version = versionarray[1] || "";
    }

    return new Promise(function(resolve, reject) {
      request.get('https://api.github.com/repos/' + resource_user + "/" + resource_name + "/tags").set('Accept', 'application/json').end(function(err, res) {
        if (err) {
          console.log(chalk.red("Error: Resource "+ resource_user + "/" + resource_name + " Not Found or not possible to update !"));
          console.log("\n");
          reject("Error: Resource "+ resource_user + "/" + resource_name + " Not Found or not possible to update !");
          return;
        } else {
          var data;

          if(resource_version == ""){
            data = res.body[0];
            resource_version = data.name;
          }else{
            data = res.body.find(function(element){
              if(element.name == resource_version){
                return true;
              }else{
                return false;
              }
            });

            if (!(data)){
              console.log(chalk.red("Error: Version for "+ resource_user + "/" + resource_name + " not found !"));
              console.log("\n");
              reject("Error: Resource "+ resource_user + "/" + resource_name + " Not Found for this version !");
              return;
            }
          }


          console.log(chalk.green("Updating " + resource_name + " - " + chalk.red(previous_version) + " -> " + resource_version));
          var zip_url = data.zipball_url;
          console.log(zip_url);

          request.get(zip_url).parse(binaryParser).buffer().end(function(err, resp) {
            fs.writeFileSync("resourcedownloadedfvm.zip", resp.body);
            var zipfolder = "";

            extract("resourcedownloadedfvm.zip", {
              dir: process.cwd() + "\\resources",
              onEntry: function(fileunzipped, zip) {
                if (zipfolder == "") {
                  zipfolder = fileunzipped.fileName;
                }
              }
            }, function(err) {

              //Remove and put resource in folder
              rimraf(process.cwd() + "\\resources\\" + resource_name, function() {
                fs.rename(process.cwd() + "/resources/" + zipfolder, process.cwd() + "/resources/" + resource_name, function(err) {
                  console.log("\n");
                  if(save){
                    dataConfigFile.addResource(resource_user+"/"+resource_name, resource_version);
                  }
                  resolve("Update Successful of "+resource_user+"/"+resource_name);
                });
              });
            });

          });
        }
      });
    });
  },
  deleteresource: function(resource, save, dataConfigFile){
    return new Promise(function(resolve, reject) {
      var arraytosplit = resource.split("/");
      var resource_user = arraytosplit[0];
      var resource_name = arraytosplit[1].split("@")[0] || arraytosplit[1];
      rimraf(process.cwd() + "\\resources\\" + resource_name, function() {
        if (save){
          dataConfigFile.removeResource(resource);
        }
        console.log("Delete Successful of "+resource_user+"/"+resource_name);
        resolve("Delete Successful of "+resource_user+"/"+resource_name);
      });
    });
  },
  check_update_resource: function(resource, resource_version){
    var arraytosplit = resource.split("/");
    var resource_user = arraytosplit[0];
    var resource_name = arraytosplit[1].split("@")[0] || arraytosplit[1];

    return new Promise(function(resolve, reject) {
      request.get('https://api.github.com/repos/' + resource_user + "/" + resource_name + "/tags").set('Accept', 'application/json').end(function(err, res) {
        if (err) {
          console.log(chalk.red("Error: Resource "+ resource_user + "/" + resource_name + " Not Found or not possible to update !"));
          console.log("\n");
          reject("Error: Resource "+ resource_user + "/" + resource_name + " Not Found or not possible to update !");
          return;
        } else {
          var version = res.body[0].name;

          if(resource_version != version){
            console.log(resource + "\t"+ "Installed: " + resource_version+"\t" +chalk.green(" New Version:"+version)+"\n");
          }else{
            console.log(resource + "\t"+ "Installed: " + resource_version+"\n");
          }
          resolve();
        }
      });
    });
  },
  check_resource_format: function (resource_name){
    return /(^(\w+)\/(\w+)@\S+$)|(^(\w+)\/(\w+)$)/g.test(resource_name);
  }
};