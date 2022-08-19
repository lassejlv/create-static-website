#!/usr/bin/env node

/*
Copyright (c) 2022, Lasse Vestergaard
This file is a part of the Create Static Website project.
*/

"use strict";

import chalk from "chalk";
import fs from "fs";
import path from "path";
import x from "fs-extra";
import inquirer from "inquirer";
import figlet from "figlet";

const figletWelcome = figlet.textSync("Create Static Website", {
  horizontalLayout: "default",
  verticalLayout: "default",
});

console.log(chalk.blueBright(figletWelcome));

const questions = [
  {
    type: "input",
    name: "projectName",
    message: "🤠 What is the name of your project?",
    default: "my-project",
    validate: function (value) {
      if (value.length) {
        return true;
      } else {
        return "⛔ Project name cannot be empty";
      }
    },
  },

  {
    type: "input",
    name: "dir",
    message: "📁 Where do you want to create the project?",
    default: "./",
    validate: function (value) {
      if (!fs.existsSync(value)) {
        return true;
      } else {
        return "⛔ " + value + " already exists";
      }
    },
  },

  {
    type: "input",
    name: "author",
    message: "🤖 Who is the author of the project?",
    default: "NO_AUTHOR",
    validate: function (value) {
      if (value.length) {
        return true;
      } else {
        return "⛔ Author name cannot be empty";
      }
    },
  },

  {
    type: "list",
    name: "template",
    message: "📝 Which template do you want to use?",
    choices: ["Bootstrap", "Simple"],
    default: "Simple",
  },

  {
    type: "confirm",
    name: "servemon",
    message: "⚡ Do you wan't to use Servemon as dev server? (recommended)",
    default: true,
  },
];

inquirer.prompt(questions).then(function (answers) {
  // Log File
  const LogFile = fs.createWriteStream(path.join(answers.dir, "log.txt"), {
    flags: "a",
  });

  // Create project folder
  if (!fs.existsSync(answers.dir)) {
    x.mkdirpSync(answers.dir);
  } else {
    return true;
  }

  // Write log file
  LogFile.writable = true;
  LogFile.write(
    "Project name: " +
      answers.projectName +
      "\n" +
      "Project directory: " +
      answers.dir +
      "\n" +
      "Author: " +
      answers.author +
      "\n" +
      "Template: " +
      answers.template +
      "\n" +
      "Servemon: " +
      answers.confirm +
      "\n" +
      "Date: " +
      new Date() +
      "\n" +
      "========================================================\n"
  );

  // Servemon configuration
  if (answers.servemon == true) {
    fs.writeFileSync(
      path.join(answers.dir, "servemon.config.js"),

      "module.exports = {\n" +
        "  // Read servemon documentation here: servemon.netlify.app\n" +
        "  port: 3000,\n" +
        "  directory: './',\n" +
        "  watch: true,\n" +
        "};\n"
    );
  } else {
    return false;
  }

  // Create project files

  let pkgConfig = {
    name: answers.projectName,
    version: "0.0.1",
    scripts: {
      start: "servemon dev",
    },
  };

  fs.writeFileSync(path.join(answers.dir, "README.md"), "");
  fs.writeFileSync(
    path.join(answers.dir, "package.json"),
    `
  
    ${JSON.stringify(pkgConfig, null, 5)}
    
  `
  );

  if (answers.template == "Simple") {
    x.copySync(path.join("./templates/simple"));
  } else if (answers.template == "Bootstrap") {
    x.copySync(path.join("./templates/bootstrap"));
  } else {
    console.log("⛔ Template not found");
  }
});
