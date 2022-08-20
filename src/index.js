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
import { execSync } from "child_process";

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

    {
        type: "confirm",
        name: "install",
        message: "📦 Do you want to install servemon locally?",
        default: true,
    },

    {
        type: "list",
        name: "pkgManager",
        message: "📦 What package manager do you want to use?",
        choices: ["npm", "yarn", "pnpm"],
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

    try {
        if (answers.template == "Simple") {
            x.copySync(
                x.copySync(
                    path.join("./src/templates/simple"),
                    path.join(answers.dir)
                )
            );
        } else if (answers.template == "Bootstrap") {
            x.copySync(
                path.join("./src/templates/bootstrap"),
                path.join(answers.dir)
            );
        } else {
            console.log("⛔ Template not found");
        }
    } catch (err) {
        return;
    }

    // Install servemon
    if (answers.install == true) {
        if (answers.pkgManager == "npm") {
            execSync("npm install -g servemon");
        } else if (answers.pkgManager == "yarn") {
            execSync("yarn global add servemon");
        } else if (answers.pkgManager == "pnpm") {
            execSync("pnpm add -g servemon");
        } else {
            console.log("⛔ Package manager not found");
        }
    } else {
        return false;
    }
});
