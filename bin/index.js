#! /usr/bin/env node
'use strict'

const commandLineArgs = require('command-line-args');

const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const cliProgress = require("cli-progress")
const ConsoleStyle = require("./config")

const optionDefinitions = [
    { name: 'background', alias: 'b', type: String },
    { name: 'traits', type: String, multiple: true, alias: 't' },
    { name: 'layers', type: String, multiple: true, alias: 'l' },
    { name: 'name', type: String, alias: 'n'},
    { name: 'count', type: Number, alias: 'c'}
]

const argumentsOption = commandLineArgs(optionDefinitions)

const imageFormat = {
    width: 250,
    height: 1000,
};

const dir = {
    traitTypes: `./${argumentsOption.traits}`,
    outputs: `${process.cwd()}/outputs`,
    background: `./${argumentsOption.background}`,
};

const canvas = createCanvas(imageFormat.width, imageFormat.height);
const ctx = canvas.getContext("2d");

const priorities = argumentsOption.layers;

const main = async (numberOfOutputs=argumentsOption.count) => {
    const traitTypesDir = dir.traitTypes;

    // set all priotized layers to be drawn first. for eg: punk type, top... You can set these values in the priorities array in line 21
    const traitTypes = priorities
        // .concat(types.filter((x) => !priorities.includes(x)))
        .map((traitType) =>
            fs
                .readdirSync(`${traitTypesDir}/${traitType}/`)
                .map((value) => {
                    return { trait_type: traitType, value: value };
                })
                // .concat({ trait_type: traitType, value: "N/A" })
        );

    const backgrounds = fs.readdirSync(dir.background);

    // trait type avail for each punk
    const combinations = randomTraits(traitTypes, numberOfOutputs);

    const progressBar = new cliProgress.SingleBar({ barsize: 60, format: `Progress: {bar} {percentage}/${numberOfOutputs} Generated | Remained: {eta}s` }, cliProgress.Presets.shades_classic)
    progressBar.start(numberOfOutputs, 0)

    for (var n = 0; n < combinations.length; n++) {
        const randomBackground =
            backgrounds[Math.floor(Math.random() * backgrounds.length)];
        await drawImage(combinations[n], randomBackground, n);

        progressBar.update(n + 1)
    }

    progressBar.stop()

    console.log("\n", ConsoleStyle.FgCyan, "NFT Collection was successfully created. Happy minting!", ConsoleStyle.Reset)
};

const recreateOutputsDir = () => {
    if (fs.existsSync(dir.outputs)) {
        fs.rmdirSync(dir.outputs, { recursive: true });
    }
    fs.mkdirSync(dir.outputs);
    fs.mkdirSync(`${dir.outputs}/metadata`);
    fs.mkdirSync(`${dir.outputs}/images`);
};

const randomTraits = (arraysToCombine, max) => {
    const results = []

    for(let i = 0; i < max; i++) {
        const item = []
        priorities.map((trait, index) => {
            item.push({ trait_type: trait, value: arraysToCombine[index][Math.floor(Math.random() * arraysToCombine[index].length)].value })
        })

        results.push(item)
    }

    return results
}

const allPossibleCases = (arraysToCombine, max) => {
    const divisors = [];
    let permsCount = 1;

    for (let i = arraysToCombine.length - 1; i >= 0; i--) {
        divisors[i] = divisors[i + 1]
            ? divisors[i + 1] * arraysToCombine[i + 1].length
            : 1;
        permsCount *= arraysToCombine[i].length || 1;
    }

    if (!!max && max > 0) {
        console.log(max);
        permsCount = max;
    }

    const getCombination = (n, arrays, divisors) =>
        arrays.reduce((acc, arr, i) => {
            acc.push(arr[Math.floor(n / divisors[i]) % arr.length]);
            return acc;
        }, []);

    const combinations = [];
    for (let i = 0; i < permsCount; i++) {
        combinations.push(getCombination(i, arraysToCombine, divisors));
    }

    return combinations;
};

const drawImage = async (traitTypes, background, index) => {
    // draw background
    const backgroundIm = await loadImage(`${dir.background}/${background}`);

    ctx.drawImage(backgroundIm, 0, 0, imageFormat.width, imageFormat.height);

    //'N/A': means that this punk doesn't have this trait type
    const drawableTraits = traitTypes.filter((x) => x.value !== "N/A");
    for (let index = 0; index < drawableTraits.length; index++) {
        const val = drawableTraits[index];
        const image = await loadImage(
            `${dir.traitTypes}/${val.trait_type}/${val.value}`
        );
        ctx.drawImage(image, 0, 0, imageFormat.width, imageFormat.height);
    }

    // save metadata
    fs.writeFileSync(
        `${dir.outputs}/metadata/${index + 1}.json`,
        JSON.stringify({
            name: `${argumentsOption.name}#${index}`,
            attributes: drawableTraits,
        }),
        function (err) {
            if (err) throw err;
        }
    );

    // save image
    fs.writeFileSync(
        `${dir.outputs}/images/${index + 1}.png`,
        canvas.toBuffer("image/png")
    );
};

const consolePrint = () => {
    console.log(ConsoleStyle.FgCyan, "\n", "Directories", ConsoleStyle.Reset)
    console.table([{ 'Trait': dir.traitTypes, 'Output': dir.outputs, 'Background': dir.background }])
    console.log("\n")
    console.log(ConsoleStyle.FgCyan, "Trait Layer Priorities", ConsoleStyle.Reset)
    console.table(priorities.map(layer => ({ 'Layers': layer })))
    console.log("\n")
}

const validateParams = () => {
    if(!argumentsOption.background) {
        console.log(ConsoleStyle.FgRed, "\nBackground directory must be inputted. e.g: -background | -b traits/bg", ConsoleStyle.Reset)
        process.exit(1)
    }
    if(!argumentsOption.traits) {
        console.log(ConsoleStyle.FgRed, "\nTraits directory must be inputted. e.g: -trait | -t traits", ConsoleStyle.Reset)
        process.exit(1)
    }
    if(!argumentsOption.traits) {
        console.log(ConsoleStyle.FgRed, "\nLayer priority must be inputted. e.g: -layers | -l head body leg foot", ConsoleStyle.Reset)
        process.exit(1)
    }
    if(!argumentsOption.name) {
        console.log(ConsoleStyle.FgRed, "\nCollection name must be inputted. e.g: -name | -n MyCollection", ConsoleStyle.Reset)
        process.exit(1)
    }
    if(!argumentsOption.count) {
        console.log(ConsoleStyle.FgRed, "\nValid collection amount must be inputted. e.g: -count | -c 1000", ConsoleStyle.Reset)
        process.exit(1)
    }
}

//main
(() => {
    validateParams()
    consolePrint()
    recreateOutputsDir();
    main();
})();